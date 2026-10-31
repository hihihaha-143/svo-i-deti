import { Eye, GitCompare, Trash2 } from 'lucide-react';

export interface TestResultItem {
    id: number;
    child: {
        id: number;
        name: string;
        login: string;
    };
    test: {
        id: number;
        title: string;
    };
    answers_count: number;
    completed_at: string | null;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface TestResultsTableBlockProps {
    items: TestResultItem[];
    pagination: PaginationMeta | null;
    onPageChange: (page: number) => void;
    onView: (item: TestResultItem) => void;
    onCompare: (item: TestResultItem) => void;
    onDelete: (item: TestResultItem) => void;
    isLoading: boolean;
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hh}:${mm}`;
}

export default function TestResultsTableBlock({
    items,
    pagination,
    onPageChange,
    onView,
    onCompare,
    onDelete,
    isLoading,
}: TestResultsTableBlockProps) {
    if (isLoading) {
        return <div className="users-table__loading">Загрузка...</div>;
    }

    if (!items.length) {
        return <div className="users-table__empty">Результаты не найдены</div>;
    }

    return (
        <>
            <div className="users-table">
                <table className="users-table__table">
                    <thead>
                        <tr>
                            <th>Пользователь</th>
                            <th>Тест</th>
                            <th>Ответов</th>
                            <th>Пройден</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td data-label="Пользователь">
                                    <div className="users-table__user">
                                        <span className="users-table__user-name">{item.child.name || item.child.login}</span>
                                        <span className="users-table__user-login">{item.child.login}</span>
                                    </div>
                                </td>
                                <td data-label="Тест">{item.test.title}</td>
                                <td data-label="Ответов">{item.answers_count}</td>
                                <td data-label="Пройден">{formatDate(item.completed_at)}</td>
                                <td data-label="Действия">
                                    <div className="users-table__actions">
                                        <button
                                            type="button"
                                            className="users-table__action-btn"
                                            onClick={() => onView(item)}
                                            title="Просмотр"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="users-table__action-btn"
                                            onClick={() => onCompare(item)}
                                            title="Сравнение"
                                        >
                                            <GitCompare size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="users-table__action-btn users-table__action-btn--delete"
                                            onClick={() => onDelete(item)}
                                            title="Удалить"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.last_page > 1 && (
                <div className="users-table__pagination">
                    <button
                        type="button"
                        className="users-table__page-btn"
                        disabled={pagination.current_page <= 1}
                        onClick={() => onPageChange(pagination.current_page - 1)}
                    >
                        ← Назад
                    </button>
                    <span className="users-table__page-info">
                        {pagination.current_page} / {pagination.last_page}
                    </span>
                    <button
                        type="button"
                        className="users-table__page-btn"
                        disabled={pagination.current_page >= pagination.last_page}
                        onClick={() => onPageChange(pagination.current_page + 1)}
                    >
                        Вперёд →
                    </button>
                </div>
            )}
        </>
    );
}