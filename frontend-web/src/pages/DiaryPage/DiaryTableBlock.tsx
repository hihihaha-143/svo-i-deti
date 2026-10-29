import { Eye } from 'lucide-react';

interface DiaryRow {
    id: number;
    child_id: number;
    child_name: string;
    parent_id: number;
    parent_name: string;
    event: string;
    event_label: string;
    text: string;
    date: string;
}

interface DiaryTableBlockProps {
    data: DiaryRow[];
    isLoading: boolean;
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onView: (entry: DiaryRow) => void;
}

export default function DiaryTableBlock({
    data,
    isLoading,
    currentPage,
    lastPage,
    total,
    onPageChange,
    onView,
}: DiaryTableBlockProps) {
    if (isLoading) {
        return <div className="users-table__loading">Загрузка...</div>;
    }

    return (
        <div className="users-table">
            <table className="users-table__table">
                <thead>
                    <tr>
                        <th>Ребёнок</th>
                        <th>Родитель</th>
                        <th>Событие</th>
                        <th>Запись</th>
                        <th>Дата</th>
                        <th className="users-table__actions-header">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="users-table__empty">
                                Нет записей
                            </td>
                        </tr>
                    ) : (
                        data.map(entry => (
                            <tr key={entry.id}>
                                <td data-label="Ребёнок">{entry.child_name}</td>
                                <td data-label="Родитель">{entry.parent_name}</td>
                                <td data-label="Событие">
                                    <span className="diary-event-badge">{entry.event_label}</span>
                                </td>
                                <td data-label="Запись">
                                    <div className="diary-text-preview">{entry.text}</div>
                                </td>
                                <td data-label="Дата">{entry.date}</td>
                                <td data-label="Действия">
                                    <div className="users-table__actions">
                                        <button
                                            className="users-table__action-btn"
                                            onClick={() => onView(entry)}
                                            title="Просмотр"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
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