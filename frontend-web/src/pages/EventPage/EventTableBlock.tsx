import { ClipboardCheck, Pencil, Trash2, Users } from 'lucide-react';

interface EventRow {
    id: number;
    title: string;
    type: string;
    type_label: string;
    start_date: string;
    lessons_count: number;
    children_count: number;
    children_names: string[];
    description: string | null;
    schedule_type: string;
    schedule_interval: number | null;
    schedule_day_of_week: number | null;
}

interface EventTableBlockProps {
    data: EventRow[];
    isLoading: boolean;
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onEdit: (event: EventRow) => void;
    onDelete: (event: EventRow) => void;
    onAttendance: (event: EventRow) => void;
}

export default function EventTableBlock({
    data,
    isLoading,
    currentPage,
    lastPage,
    total,
    onPageChange,
    onEdit,
    onDelete,
    onAttendance,
}: EventTableBlockProps) {
    if (isLoading) {
        return <div className="users-table__loading">Загрузка...</div>;
    }

    return (
        <div className="users-table">
            <table className="users-table__table">
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Тип</th>
                        <th>Дата</th>
                        <th>Занятий</th>
                        <th>Мероприятие для</th>
                        <th>Посещаемость</th>
                        <th className="users-table__actions-header">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="users-table__empty">
                                Мероприятий пока нет
                            </td>
                        </tr>
                    ) : (
                        data.map(event => {
                            const isOwn = event.type === 'psychologist';
                            return (
                                <tr key={event.id}>
                                    <td data-label="Название">{event.title}</td>
                                    <td data-label="Тип">
                                        <span className={`event-type-badge event-type-badge--${event.type}`}>
                                            {event.type_label}
                                        </span>
                                    </td>
                                    <td data-label="Дата">{event.start_date}</td>
                                    <td data-label="Занятий">
                                        <span className="event-lessons-badge">{event.lessons_count}</span>
                                    </td>
                                    <td data-label="Мероприятие для">
                                        <span className="event-children">
                                            <Users size={14} />
                                            {event.children_count === 1
                                                ? event.children_names[0]
                                                : `${event.children_count} детей`}
                                        </span>
                                    </td>
                                    <td data-label="Посещаемость">
                                        <button
                                            className="event-attendance-btn"
                                            onClick={() => onAttendance(event)}
                                        >
                                            <ClipboardCheck size={16} /> Отметить
                                        </button>
                                    </td>
                                    <td data-label="Действия">
                                        <div className="users-table__actions">
                                            <button
                                                className="users-table__action-btn users-table__action-btn--edit"
                                                onClick={() => onEdit(event)}
                                                disabled={!isOwn}
                                                title={isOwn ? 'Изменить' : 'Мероприятие наставника'}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                className="users-table__action-btn users-table__action-btn--delete"
                                                onClick={() => onDelete(event)}
                                                disabled={!isOwn}
                                                title={isOwn ? 'Удалить' : 'Мероприятие наставника'}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {lastPage > 1 && (
                <div className="users-table__pagination">
                    <button
                        className="users-table__page-btn"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        ← Назад
                    </button>
                    <span className="users-table__page-info">
                        Страница {currentPage} из {lastPage} <span className="users-table__total">(всего {total})</span>
                    </span>
                    <button
                        className="users-table__page-btn"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= lastPage}
                    >
                        Вперёд →
                    </button>
                </div>
            )}
        </div>
    );
}