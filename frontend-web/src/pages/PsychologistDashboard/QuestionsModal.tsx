import { useEffect, useState } from 'react';
import { Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';

interface QuestionData {
    id?: number;
    question_text: string;
    type: 'single' | 'scale' | 'luscher';
    order: number;
    options: any;
    scale_min_label: string;
    scale_max_label: string;
    allow_skip: boolean;
    age_restrictions: { min?: number; max?: number } | null;
}

interface QuestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    testId: number | null;
    onSuccess: () => void;
}

const LUSCHER_DEFAULT_COLORS = [
    { id: 'blue', label: 'Синий', hex: '#1E88E5' },
    { id: 'green', label: 'Зелёный', hex: '#43A047' },
    { id: 'red', label: 'Красный', hex: '#E53935' },
    { id: 'yellow', label: 'Жёлтый', hex: '#FDD835' },
    { id: 'purple', label: 'Фиолетовый', hex: '#8E24AA' },
    { id: 'brown', label: 'Коричневый', hex: '#6D4C41' },
    { id: 'grey', label: 'Серый', hex: '#757575' },
    { id: 'black', label: 'Чёрный', hex: '#212121' },
];

function emptyQuestion(order: number): QuestionData {
    return {
        question_text: '',
        type: 'single',
        order,
        options: [],
        scale_min_label: '',
        scale_max_label: '',
        allow_skip: true,
        age_restrictions: null,
    };
}

export default function QuestionsModal({ isOpen, onClose, testId, onSuccess }: QuestionsModalProps) {
    const { showToast } = useToast();

    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen || testId === null) return;

        setIsLoading(true);
        apiClient.get(`/psychologist/tests/${testId}`)
            .then(res => {
                setQuestions(
                    (res.data.data.questions || []).map((q: any) => ({
                        id: q.id,
                        question_text: q.question_text,
                        type: q.type,
                        order: q.order,
                        options: q.options || [],
                        scale_min_label: q.scale_min_label || '',
                        scale_max_label: q.scale_max_label || '',
                        allow_skip: q.allow_skip,
                        age_restrictions: q.age_restrictions,
                    }))
                );
            })
            .catch(() => showToast('Не удалось загрузить вопросы', 'error'))
            .finally(() => setIsLoading(false));
    }, [isOpen, testId]);

    const addQuestion = (type: 'single' | 'scale' | 'luscher') => {
        const q = emptyQuestion(questions.length);
        q.type = type;
        if (type === 'single') {
            q.options = [{ text: '' }];
        } else if (type === 'luscher') {
            q.options = LUSCHER_DEFAULT_COLORS.map(c => ({ ...c }));
        }
        setQuestions(prev => [...prev, q]);
    };

    const updateQuestion = (index: number, patch: Partial<QuestionData>) => {
        setQuestions(prev => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
    };

    const removeQuestion = (index: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const moveQuestion = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= questions.length) return;
        setQuestions(prev => {
            const copy = [...prev];
            [copy[index], copy[target]] = [copy[target], copy[index]];
            return copy.map((q, i) => ({ ...q, order: i }));
        });
    };

    const addOption = (qIndex: number) => {
        setQuestions(prev =>
            prev.map((q, i) =>
                i === qIndex ? { ...q, options: [...(q.options || []), { text: '' }] } : q
            )
        );
    };

    const updateOption = (qIndex: number, oIndex: number, text: string) => {
        setQuestions(prev =>
            prev.map((q, i) => {
                if (i !== qIndex) return q;
                const options = [...(q.options || [])];
                options[oIndex] = { ...options[oIndex], text };
                return { ...q, options };
            })
        );
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        setQuestions(prev =>
            prev.map((q, i) => {
                if (i !== qIndex) return q;
                return { ...q, options: (q.options || []).filter((_: any, oi: number) => oi !== oIndex) };
            })
        );
    };

    const handleSubmit = async () => {
        if (testId === null) return;

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question_text.trim()) {
                showToast(`Вопрос ${i + 1}: введите текст`, 'error');
                return;
            }
            if (q.type === 'single') {
                const opts = (q.options || []).filter((o: any) => (o.text || '').trim() !== '');
                if (opts.length < 2) {
                    showToast(`Вопрос ${i + 1}: минимум 2 варианта ответа`, 'error');
                    return;
                }
            }
        }

        const payloadQuestions = questions.map((q, i) => ({
            id: q.id,
            question_text: q.question_text.trim(),
            type: q.type,
            order: i,
            options: q.type === 'single'
                ? (q.options || []).filter((o: any) => (o.text || '').trim() !== '').map((o: any) => ({ text: o.text.trim() }))
                : q.type === 'luscher'
                    ? q.options
                    : null,
            scale_min_label: q.type === 'scale' ? (q.scale_min_label || null) : null,
            scale_max_label: q.type === 'scale' ? (q.scale_max_label || null) : null,
            allow_skip: q.allow_skip,
            age_restrictions: q.age_restrictions,
        }));

        setIsSubmitting(true);
        try {
            const res = await apiClient.get(`/psychologist/tests/${testId}`);
            const testData = res.data.data;

            await apiClient.put(`/psychologist/tests/${testId}`, {
                ...testData,
                questions: payloadQuestions,
            });
            showToast('Вопросы сохранены', 'success');
            onSuccess();
            onClose();
        } catch (e: any) {
            showToast(e.response?.data?.message || 'Ошибка при сохранении', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderQuestionEditor = (q: QuestionData, index: number) => {
        return (
            <div key={index} className="event-form">
                <div className="users-header__actions">
                    <strong>Вопрос {index + 1}</strong>
                    <button type="button" className="users-table__action-btn users-table__action-btn--edit" onClick={() => moveQuestion(index, -1)} disabled={index === 0} title="Выше">
                        <ChevronUp size={16} />
                    </button>
                    <button type="button" className="users-table__action-btn users-table__action-btn--edit" onClick={() => moveQuestion(index, 1)} disabled={index === questions.length - 1} title="Ниже">
                        <ChevronDown size={16} />
                    </button>
                    <button type="button" className="users-table__action-btn users-table__action-btn--delete" onClick={() => removeQuestion(index)} title="Удалить вопрос">
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className="event-form__field">
                    <label className="event-form__label">Текст вопроса *</label>
                    <textarea
                        className="event-form__textarea"
                        rows={2}
                        value={q.question_text}
                        onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                    />
                </div>

                <div className="event-form__field">
                    <label className="event-form__label">Тип ответа</label>
                    <select
                        className="event-form__input event-form__select"
                        value={q.type}
                        onChange={(e) => {
                            const newType = e.target.value as 'single' | 'scale' | 'luscher';
                            if (newType === 'single') {
                                updateQuestion(index, { type: newType, options: [{ text: '' }] });
                            } else if (newType === 'luscher') {
                                updateQuestion(index, { type: newType, options: LUSCHER_DEFAULT_COLORS.map(c => ({ ...c })) });
                            } else {
                                updateQuestion(index, { type: newType, options: [] });
                            }
                        }}
                    >
                        <option value="single">Один из нескольких</option>
                        <option value="scale">Шкала от 1 до 5</option>
                        <option value="luscher">Люшер (ранжирование цветов)</option>
                    </select>
                </div>

                {q.type === 'single' && (
                    <div className="event-form__field">
                        <label className="event-form__label">Варианты ответа *</label>
                        <div className="questions-modal__options">
                            {(q.options || []).map((opt: any, oi: number) => (
                                <div key={oi} className="questions-modal__option-row">
                                    <input
                                        type="text"
                                        className="event-form__input questions-modal__option-input"
                                        placeholder={`Вариант ${oi + 1}`}
                                        value={opt.text || ''}
                                        onChange={(e) => updateOption(index, oi, e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="users-table__action-btn users-table__action-btn--delete"
                                        onClick={() => removeOption(index, oi)}
                                        title="Удалить вариант"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="event-form__btn event-form__btn--submit questions-modal__add-option" onClick={() => addOption(index)}>
                            <Plus size={16} /> Добавить вариант
                        </button>
                    </div>
                )}

                {q.type === 'scale' && (
                    <div className="event-form__field">
                        <label className="event-form__label">Подписи шкалы</label>
                        <div className="users-header__actions">
                            <input
                                type="text"
                                className="event-form__input"
                                placeholder="Что значит 1"
                                value={q.scale_min_label}
                                onChange={(e) => updateQuestion(index, { scale_min_label: e.target.value })}
                            />
                            <input
                                type="text"
                                className="event-form__input"
                                placeholder="Что значит 5"
                                value={q.scale_max_label}
                                onChange={(e) => updateQuestion(index, { scale_max_label: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {q.type === 'luscher' && (
                    <div className="event-form__field">
                        <label className="event-form__label">Цвета для ранжирования</label>
                        <div className="users-header__actions">
                            {(q.options || []).map((opt: any) => (
                                <div key={opt.id} className="users-filter__field">
                                    <span style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: opt.hex, display: 'inline-block' }} />
                                    <span>{opt.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="event-form__field">
                    <label className="event-form__child">
                        <input
                            type="checkbox"
                            checked={q.allow_skip}
                            onChange={(e) => updateQuestion(index, { allow_skip: e.target.checked })}
                        />
                        <span>Можно пропустить вопрос</span>
                    </label>
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Вопросы теста"
        >
            {isLoading ? (
                <div className="users-table__loading">Загрузка...</div>
            ) : (
                <div className="event-form">
                    <div className="event-form__field">
                        <strong>Вопросы ({questions.length})</strong>
                    </div>

                    {questions.map((q, i) => renderQuestionEditor(q, i))}

                    <div className="event-form__actions">
                        <button type="button" className="event-form__btn event-form__btn--submit" onClick={() => addQuestion('single')}>
                            <Plus size={16} /> Один из нескольких
                        </button>
                        <button type="button" className="event-form__btn event-form__btn--submit" onClick={() => addQuestion('scale')}>
                            <Plus size={16} /> Шкала 1–5
                        </button>
                        <button type="button" className="event-form__btn event-form__btn--submit" onClick={() => addQuestion('luscher')}>
                            <Plus size={16} /> Люшер
                        </button>
                    </div>

                    <div className="event-form__actions">
                        <button
                            className="event-form__btn event-form__btn--cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                        <button
                            className="event-form__btn event-form__btn--submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Сохранение...' : 'Сохранить вопросы'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}