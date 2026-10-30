import { useEffect, useState } from 'react';
import { Trash2, Upload } from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';

interface TestData {
    id: number;
    title: string;
    for_whom: string;
    description: string | null;
    age_restrictions: { min?: number; max?: number } | null;
    motivation_text: string | null;
    coloring_file: string | null;
    coloring_file_url: string | null;
    is_active: boolean;
    is_monthly: boolean;
}

interface TestsFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    testId: number | null;
    onSuccess: () => void;
}

export default function TestsFormModal({ isOpen, onClose, testId, onSuccess }: TestsFormModalProps) {
    const { showToast } = useToast();
    const isEditing = testId !== null;

    const [title, setTitle] = useState('');
    const [forWhom, setForWhom] = useState('child');
    const [description, setDescription] = useState('');
    const [ageMin, setAgeMin] = useState('');
    const [ageMax, setAgeMax] = useState('');
    const [motivationText, setMotivationText] = useState('');
    const [coloringFile, setColoringFile] = useState<string | null>(null);
    const [coloringFileUrl, setColoringFileUrl] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [isMonthly, setIsMonthly] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        if (testId === null) {
            setTitle('');
            setForWhom('child');
            setDescription('');
            setAgeMin('');
            setAgeMax('');
            setMotivationText('');
            setColoringFile(null);
            setColoringFileUrl(null);
            setIsActive(true);
            setIsMonthly(false);
            return;
        }

        setIsLoading(true);
        apiClient.get(`/psychologist/tests/${testId}`)
            .then(res => {
                const t: TestData = res.data.data;
                setTitle(t.title);
                setForWhom(t.for_whom);
                setDescription(t.description || '');
                setAgeMin(t.age_restrictions?.min !== undefined ? String(t.age_restrictions.min) : '');
                setAgeMax(t.age_restrictions?.max !== undefined ? String(t.age_restrictions.max) : '');
                setMotivationText(t.motivation_text || '');
                setColoringFile(t.coloring_file);
                setColoringFileUrl(t.coloring_file_url);
                setIsActive(t.is_active);
                setIsMonthly(t.is_monthly);
            })
            .catch(() => showToast('Не удалось загрузить тест', 'error'))
            .finally(() => setIsLoading(false));
    }, [isOpen, testId]);

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await apiClient.post('/psychologist/tests/upload-coloring', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setColoringFile(res.data.data.path);
            setColoringFileUrl(res.data.data.url);
            showToast('Файл загружен', 'success');
        } catch (e: any) {
            showToast(e.response?.data?.message || 'Ошибка загрузки', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            showToast('Введите название теста', 'error');
            return;
        }

        const payload = {
            title: title.trim(),
            for_whom: forWhom,
            description: description.trim() || null,
            age_restrictions: (ageMin || ageMax)
                ? {
                    min: ageMin ? Number(ageMin) : undefined,
                    max: ageMax ? Number(ageMax) : undefined,
                }
                : null,
            motivation_text: motivationText.trim() || null,
            coloring_file: coloringFile,
            is_active: isActive,
            is_monthly: isMonthly,
            questions: [],
        };

        setIsSubmitting(true);
        try {
            if (isEditing && testId) {
                const existing = await apiClient.get(`/psychologist/tests/${testId}`);
                const questions = existing.data.data.questions || [];
                await apiClient.put(`/psychologist/tests/${testId}`, { ...payload, questions });
                showToast('Тест обновлён', 'success');
            } else {
                await apiClient.post('/psychologist/tests', payload);
                showToast('Тест создан', 'success');
            }
            onSuccess();
            onClose();
        } catch (e: any) {
            showToast(e.response?.data?.message || 'Ошибка при сохранении', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Редактировать тест' : 'Создать тест'}
        >
            {isLoading ? (
                <div className="users-table__loading">Загрузка...</div>
            ) : (
                <div className="event-form">
                    <div className="event-form__field">
                        <label className="event-form__label">Название *</label>
                        <input
                            type="text"
                            className="event-form__input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="event-form__field">
                        <label className="event-form__label">Для кого *</label>
                        <select
                            className="event-form__input event-form__select"
                            value={forWhom}
                            onChange={(e) => setForWhom(e.target.value)}
                        >
                            <option value="child">Для детей</option>
                            <option value="parent">Для родителей</option>
                            <option value="both">Для всех</option>
                        </select>
                    </div>

                    <div className="event-form__field">
                        <label className="event-form__label">Описание</label>
                        <textarea
                            className="event-form__textarea"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="event-form__field">
                        <label className="event-form__label">Возрастные ограничения</label>
                        <div className="users-header__actions">
                            <input
                                type="number"
                                className="event-form__input"
                                placeholder="От"
                                min={0}
                                value={ageMin}
                                onChange={(e) => setAgeMin(e.target.value)}
                            />
                            <input
                                type="number"
                                className="event-form__input"
                                placeholder="До"
                                min={0}
                                value={ageMax}
                                onChange={(e) => setAgeMax(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="event-form__field">
                        <label className="event-form__label">Мотивационный текст</label>
                        <textarea
                            className="event-form__textarea"
                            rows={2}
                            placeholder="Текст, который увидит ребёнок перед прохождением"
                            value={motivationText}
                            onChange={(e) => setMotivationText(e.target.value)}
                        />
                    </div>

                    <div className="event-form__field">
                        <label className="event-form__label">Файл раскраски</label>
                        {coloringFileUrl ? (
                            <div className="users-header__actions">
                                <a href={coloringFileUrl} target="_blank" rel="noopener noreferrer">Открыть файл</a>
                                <button type="button" className="users-table__action-btn users-table__action-btn--delete" onClick={() => { setColoringFile(null); setColoringFileUrl(null); }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="event-form__btn event-form__btn--submit">
                                <Upload size={16} /> {isUploading ? 'Загрузка...' : 'Загрузить файл'}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,application/pdf"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) handleUpload(e.target.files[0]);
                                    }}
                                    disabled={isUploading}
                                />
                            </label>
                        )}
                    </div>

                    <div className="event-form__field">
                        <label className="event-form__child">
                            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                            <span>Активен (доступен для прохождения)</span>
                        </label>
                        <label className="event-form__child">
                            <input type="checkbox" checked={isMonthly} onChange={(e) => setIsMonthly(e.target.checked)} />
                            <span>Ежемесячный (автоматически активируется 1-го числа)</span>
                        </label>
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
                            {isSubmitting ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}