import { useEffect, useState } from 'react';
import Modal from '../../components/Modal/Modal';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';

interface ChildOption {
    id: number;
    name: string;
}

interface EventData {
    id: number;
    title: string;
    type: string;
    start_date: string;
    lessons_count: number;
    description: string | null;
    schedule_type: string;
    schedule_interval: number | null;
    schedule_day_of_week: number | null;
    children_names: string[];
}

interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventData | null;
    children: ChildOption[];
    onSuccess: () => void;
}

const DAYS_OF_WEEK = [
    { value: 0, label: 'Понедельник' },
    { value: 1, label: 'Вторник' },
    { value: 2, label: 'Среда' },
    { value: 3, label: 'Четверг' },
    { value: 4, label: 'Пятница' },
    { value: 5, label: 'Суббота' },
    { value: 6, label: 'Воскресенье' },
];

export default function EventFormModal({
    isOpen,
    onClose,
    event,
    children,
    onSuccess,
}: EventFormModalProps) {
    const { showToast } = useToast();
    const isEditing = !!event;

    const [title, setTitle] = useState('');
    const [type, setType] = useState('psychologist');
    const [lessonsCount, setLessonsCount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [scheduleType, setScheduleType] = useState('weekly');
    const [scheduleInterval, setScheduleInterval] = useState('');
    const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState<string>('0');
    const [description, setDescription] = useState('');
    const [selectedChildren, setSelectedChildren] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setType(event.type);
            setLessonsCount(String(event.lessons_count));
            setStartDate(event.start_date.split('.').reverse().join('-')); // DD.MM.YYYY -> YYYY-MM-DD
            setScheduleType(event.schedule_type);
            setScheduleInterval(event.schedule_interval ? String(event.schedule_interval) : '');
            setScheduleDayOfWeek(event.schedule_day_of_week !== null ? String(event.schedule_day_of_week) : '0');
            setDescription(event.description || '');
            const childIds = children.filter(c => event.children_names.includes(c.name)).map(c => c.id);
            setSelectedChildren(childIds);
        } else {
            setTitle('');
            setType('psychologist');
            setLessonsCount('');
            setStartDate('');
            setScheduleType('weekly');
            setScheduleInterval('');
            setScheduleDayOfWeek('0');
            setDescription('');
            setSelectedChildren([]);
        }
    }, [event, isOpen, children]);

    const toggleChild = (id: number) => {
        setSelectedChildren(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            showToast('Введите название', 'error');
            return;
        }
        if (!lessonsCount || Number(lessonsCount) < 1) {
            showToast('Введите количество занятий', 'error');
            return;
        }
        if (!startDate) {
            showToast('Выберите дату начала', 'error');
            return;
        }
        if (selectedChildren.length === 0) {
            showToast('Выберите хотя бы одного ребёнка', 'error');
            return;
        }
        if (scheduleType === 'every_n_days' && (!scheduleInterval || Number(scheduleInterval) < 1)) {
            showToast('Введите интервал в днях', 'error');
            return;
        }

        const payload: any = {
            title: title.trim(),
            type,
            lessons_count: Number(lessonsCount),
            start_date: startDate,
            description: description.trim() || null,
            schedule_type: scheduleType,
            schedule_interval: scheduleType === 'every_n_days' ? Number(scheduleInterval) : null,
            schedule_day_of_week: scheduleType === 'weekly' ? Number(scheduleDayOfWeek) : null,
            child_ids: selectedChildren,
        };

        setIsSubmitting(true);
        try {
            if (isEditing && event) {
                await apiClient.put(`/psychologist/events/${event.id}`, payload);
                showToast('Мероприятие обновлено', 'success');
            } else {
                await apiClient.post('/psychologist/events', payload);
                showToast('Мероприятие создано', 'success');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Ошибка при сохранении';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Редактировать мероприятие' : 'Добавить мероприятие'}
        >
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
                    <label className="event-form__label">Тип *</label>
                    <select
                        className="event-form__input event-form__select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        disabled={isEditing}
                    >
                        <option value="psychologist">Психолог</option>
                        <option value="mentor">Наставник</option>
                    </select>
                </div>

                <div className="event-form__field">
                    <label className="event-form__label">Количество занятий *</label>
                    <input
                        type="number"
                        className="event-form__input"
                        min={1}
                        value={lessonsCount}
                        onChange={(e) => setLessonsCount(e.target.value)}
                    />
                </div>

                <div className="event-form__field">
                    <label className="event-form__label">Дата начала *</label>
                    <input
                        type="date"
                        className="event-form__input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="event-form__field">
                    <label className="event-form__label">Расписание *</label>
                    <select
                        className="event-form__input event-form__select"
                        value={scheduleType}
                        onChange={(e) => setScheduleType(e.target.value)}
                    >
                        <option value="weekly">Каждую неделю</option>
                        <option value="every_n_days">Каждые N дней</option>
                        <option value="daily">Ежедневно</option>
                        <option value="monthly">Ежемесячно</option>
                    </select>
                </div>

                {scheduleType === 'weekly' && (
                    <div className="event-form__field">
                        <label className="event-form__label">День недели *</label>
                        <select
                            className="event-form__input event-form__select"
                            value={scheduleDayOfWeek}
                            onChange={(e) => setScheduleDayOfWeek(e.target.value)}
                        >
                            {DAYS_OF_WEEK.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {scheduleType === 'every_n_days' && (
                    <div className="event-form__field">
                        <label className="event-form__label">Интервал (дней) *</label>
                        <input
                            type="number"
                            className="event-form__input"
                            min={1}
                            value={scheduleInterval}
                            onChange={(e) => setScheduleInterval(e.target.value)}
                        />
                    </div>
                )}

                <div className="event-form__field">
                    <label className="event-form__label">Описание</label>
                    <textarea
                        className="event-form__textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="event-form__field">
                    <label className="event-form__label">Дети-участники *</label>
                    <div className="event-form__children">
                        {children.length === 0 ? (
                            <div className="event-form__children-empty">Нет доступных детей</div>
                        ) : (
                            children.map(child => (
                                <label key={child.id} className="event-form__child">
                                    <input
                                        type="checkbox"
                                        checked={selectedChildren.includes(child.id)}
                                        onChange={() => toggleChild(child.id)}
                                    />
                                    <span>{child.name}</span>
                                </label>
                            ))
                        )}
                    </div>
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
                        {isSubmitting
                            ? 'Сохранение...'
                            : isEditing
                                ? 'Сохранить изменения'
                                : 'Создать'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}