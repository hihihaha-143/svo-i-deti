import { useEffect, useState } from 'react';
import {
    Award,
    Brain,
    ClipboardList,
    Download,
    Flame,
    Handshake,
    Heart,
    MessageCircle,
    RotateCcw,
    Users,
    Zap,
} from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';

interface AnswerItem {
    id: number;
    question: {
        id: number;
        text: string;
        type: string;
        options: any;
    };
    answer: any;
    answered_at: string | null;
}

interface Superpowers {
    independence: number;
    emotional_sphere: number;
    responsibility: number;
    creativity: number;
    organization: number;
    sociability: number;
    social_activity: number;
    willpower: number;
}

interface RetakeInfo {
    allowed_at: string;
}

interface TestResultViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    attemptId: number | null;
    onSuperpowersSaved?: () => void;
}

type QualityKey = keyof Superpowers;

const ICONS: Record<QualityKey, JSX.Element> = {
    independence: <Flame size={18} />,
    emotional_sphere: <Heart size={18} />,
    responsibility: <Zap size={18} />,
    creativity: <Brain size={18} />,
    organization: <ClipboardList size={18} />,
    sociability: <MessageCircle size={18} />,
    social_activity: <Handshake size={18} />,
    willpower: <Users size={18} />,
};

const DEFAULT_SUPERPOWERS: Superpowers = {
    independence: 0,
    emotional_sphere: 0,
    responsibility: 0,
    creativity: 0,
    organization: 0,
    sociability: 0,
    social_activity: 0,
    willpower: 0,
};

export default function TestResultViewModal({
    isOpen,
    onClose,
    attemptId,
    onSuperpowersSaved,
}: TestResultViewModalProps) {
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [childName, setChildName] = useState('');
    const [testTitle, setTestTitle] = useState('');
    const [answers, setAnswers] = useState<AnswerItem[]>([]);
    const [qualities, setQualities] = useState<Record<QualityKey, string>>({
        independence: 'Самостоятельность',
        emotional_sphere: 'Эмоциональная сфера',
        responsibility: 'Ответственность',
        creativity: 'Креативность',
        organization: 'Организованность',
        sociability: 'Общительность',
        social_activity: 'Социальная активность',
        willpower: 'Сила воли',
    });

    const [superpowers, setSuperpowers] = useState<Superpowers>(DEFAULT_SUPERPOWERS);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [retake, setRetake] = useState<RetakeInfo | null>(null);
    const [isAllowing, setIsAllowing] = useState(false);

    useEffect(() => {
        if (!isOpen || attemptId === null) return;

        setIsLoading(true);
        setIsFormOpen(false);
        setSuperpowers(DEFAULT_SUPERPOWERS);
        setRetake(null);

        apiClient.get(`/psychologist/test-results/${attemptId}`)
            .then(res => {
                const data = res.data;
                setChildName(data.attempt.child.name || data.attempt.child.login);
                setTestTitle(data.attempt.test.title);
                setAnswers(data.answers || []);
                if (data.qualities) {
                    setQualities(data.qualities);
                }
                if (data.superpowers) {
                    setSuperpowers(data.superpowers);
                }
                setRetake(data.retake ?? null);
            })
            .catch(() => showToast('Не удалось загрузить ответы', 'error'))
            .finally(() => setIsLoading(false));
    }, [isOpen, attemptId]);

    const formatDate = (iso: string | null): string => {
        if (!iso) return '—';
        const d = new Date(iso);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hh}:${mm}`;
    };

    const formatAnswer = (value: any, question: AnswerItem['question']): string => {
        if (value === null || value === undefined || value === '') return 'skipped';

        if (question.type === 'single') {
            if (typeof value === 'string') return value;
            if (typeof value === 'object') {
                if (typeof value.text === 'string' && value.text !== '') return value.text;

                const options = Array.isArray(question.options) ? question.options : [];
                const idx = value.index;
                const optionId = value.option_id;

                if (typeof idx === 'number' && options[idx]?.text) return options[idx].text;
                if (typeof optionId === 'number' && options[optionId - 1]?.text) return options[optionId - 1].text;

                return `Вариант #${optionId ?? '?'}`;
            }
            return String(value);
        }

        if (question.type === 'scale') {
            if (typeof value === 'object' && 'value' in value) return String(value.value);
            return String(value);
        }

        if (question.type === 'luscher') {
            if (typeof value === 'object' && 'order' in value && Array.isArray(value.order)) {
                return value.order.join(' → ');
            }
            return JSON.stringify(value);
        }

        return String(value);
    };

    const updateSuperpower = (key: QualityKey, value: number) => {
        const clamped = Math.max(0, Math.min(10, value));
        setSuperpowers(prev => ({ ...prev, [key]: clamped }));
    };

    const handleSaveSuperpowers = async () => {
        if (attemptId === null) return;

        setIsSaving(true);
        try {
            await apiClient.put(`/psychologist/test-results/${attemptId}/superpowers`, superpowers);
            showToast('Оценка качества сохранена', 'success');
            setIsFormOpen(false);
            if (onSuperpowersSaved) onSuperpowersSaved();
        } catch (e: any) {
            showToast(e.response?.data?.message || 'Ошибка сохранения', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAllowRetake = async () => {
        if (attemptId === null) return;

        setIsAllowing(true);
        try {
            const res = await apiClient.post(`/psychologist/test-results/${attemptId}/allow-retake`);
            setRetake({ allowed_at: res.data.retake.allowed_at });
            showToast('Повторное прохождение разрешено', 'success');
        } catch (e: any) {
            showToast(e.response?.data?.message || 'Не удалось разрешить повторное прохождение', 'error');
        } finally {
            setIsAllowing(false);
        }
    };

    const handleExportPdf = async () => {
        if (attemptId === null) return;

        setIsExporting(true);
        try {
            const res = await apiClient.get(`/psychologist/test-results/${attemptId}/export`, {
                responseType: 'blob',
            });

            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `test-result-${attemptId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e: any) {
            showToast('Не удалось сформировать PDF', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={testTitle ? `Ответы: ${childName} — ${testTitle}` : 'Ответы'}
        >
            {isLoading ? (
                <div className="users-table__loading">Загрузка...</div>
            ) : (
                <div className="test-result-view">
                    <div className="test-result-view__answers">
                        <table className="users-table__table">
                            <thead>
                                <tr>
                                    <th>Вопрос</th>
                                    <th className="test-result-view__col-answer">Ответ</th>
                                    <th className="test-result-view__col-date">Дата</th>
                                </tr>
                            </thead>
                            <tbody>
                                {answers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3}>Ответов нет</td>
                                    </tr>
                                ) : (
                                    answers.map(a => (
                                        <tr key={a.id}>
                                            <td data-label="Вопрос">{a.question.text}</td>
                                            <td data-label="Ответ">{formatAnswer(a.answer, a.question)}</td>
                                            <td data-label="Дата" className="test-result-view__date">
                                                {formatDate(a.answered_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="test-result-view__actions">
                        <button
                            type="button"
                            className="test-result-view__btn test-result-view__btn--primary"
                            onClick={() => setIsFormOpen(prev => !prev)}
                        >
                            <Award size={16} />
                            {isFormOpen ? 'Скрыть оценку качества' : 'Поставить оценку качества'}
                        </button>
                        <button
                            type="button"
                            className="test-result-view__btn test-result-view__btn--secondary"
                            onClick={handleExportPdf}
                            disabled={isExporting}
                        >
                            <Download size={16} />
                            {isExporting ? 'Формирование...' : 'Экспорт PDF'}
                        </button>
                        <button
                            type="button"
                            className={`test-result-view__btn ${retake ? 'test-result-view__btn--allowed' : 'test-result-view__btn--accent'}`}
                            onClick={handleAllowRetake}
                            disabled={isAllowing || !!retake}
                            title={retake ? `Разрешено ${formatDate(retake.allowed_at)}` : 'Разрешить пройти тест ещё раз'}
                        >
                            <RotateCcw size={16} />
                            {retake ? 'Повторное прохождение разрешено' : (isAllowing ? 'Разрешение...' : 'Разрешить пройти ещё раз')}
                        </button>
                    </div>

                    {isFormOpen && (
                        <div className="superpowers-form">
                            <div className="superpowers-form__title">Суперсилы ребёнка</div>
                            <div className="superpowers-form__list">
                                {(Object.keys(qualities) as QualityKey[]).map(key => (
                                    <div key={key} className="superpowers-form__item">
                                        <div className="superpowers-form__label">
                                            {ICONS[key]}
                                            <span>{qualities[key]}</span>
                                        </div>
                                        <div className="superpowers-form__control">
                                            <input
                                                type="range"
                                                min={0}
                                                max={10}
                                                value={superpowers[key]}
                                                onChange={(e) => updateSuperpower(key, Number(e.target.value))}
                                                className="superpowers-form__range"
                                            />
                                            <span className="superpowers-form__value">
                                                {superpowers[key]}/10
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="event-form__actions">
                                <button
                                    type="button"
                                    className="event-form__btn event-form__btn--cancel"
                                    onClick={() => setIsFormOpen(false)}
                                    disabled={isSaving}
                                >
                                    Отмена
                                </button>
                                <button
                                    type="button"
                                    className="event-form__btn event-form__btn--submit"
                                    onClick={handleSaveSuperpowers}
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Сохранение...' : 'Сохранить оценку'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}