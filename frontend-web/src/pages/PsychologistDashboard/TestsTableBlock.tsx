import { Pencil, Trash2, Eye, EyeOff, Calendar, ListChecks } from 'lucide-react';

interface TestRow {
    id: number;
    title: string;
    for_whom: string;
    for_whom_label: string;
    description: string | null;
    age_restrictions: { min?: number; max?: number } | null;
    motivation_text: string | null;
    coloring_file: string | null;
    coloring_file_url: string | null;
    is_active: boolean;
    is_monthly: boolean;
    questions_count: number;
    created_at: string;
}

interface TestsTableBlockProps {
    data: TestRow[];
    isLoading: boolean;
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
    onEdit: (test: TestRow) => void;
    onDelete: (test: TestRow) => void;
    onToggleActive: (test: TestRow) => void;
    onManageQuestions: (test: TestRow) => void;
}

export default function TestsTableBlock({
    data,
    isLoading,
    currentPage,
    lastPage,
    total,
    onPageChange,
    onEdit,
    onDelete,
    onToggleActive,
    onManageQuestions,
}: TestsTableBlockProps) {
    if (isLoading) {
        return <div className="users-table__loading">Загрузка...</div>;
    }

    const formatAge = (age: { min?: number; max?: number } | null) => {
        if (!age || (age.min === undefined && age.max === undefined)) return '—';
        if (age.min !== undefined && age.max !== undefined) return `${age.min}–${age.max} лет`;
        if (age.min !== undefined) return `от ${age.min} лет`;
        if (age.max !== undefined) return `до ${age.max} лет`;
        return '—';
    };

    return (
        <div className="users-table">
            <table className="users-table__table">
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Для кого</th>
                        <th>Возраст</th>
                        <th>Вопросов</th>
                        <th>Ежемесячный</th>
                        <th>Статус</th>
                        <th className="users-table__actions-header">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="users-table__empty">
                                Тестов пока нет
                            </td>
                        </tr>
                    ) : (
                        data.map(test => (
                            <tr key={test.id}>
                                <td data-label="Название">{test.title}</td>
                                <td data-label="Для кого">{test.for_whom_label}</td>
                                <td data-label="Возраст">{formatAge(test.age_restrictions)}</td>
                                <td data-label="Вопросов">
                                    <span className="event-lessons-badge">{test.questions_count}</span>
                                </td>
                                <td data-label="Ежемесячный">
                                    {test.is_monthly ? (
                                        <span className="login-role-badge login-role-badge--mentor">
                                            <Calendar size={14} /> Да
                                        </span>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td data-label="Статус">
                                    {test.is_active ? (
                                        <span className="login-role-badge login-role-badge--psychologist">
                                            <Eye size={14} /> Активен
                                        </span>
                                    ) : (
                                        <span className="login-role-badge login-role-badge--parent">
                                            <EyeOff size={14} /> Скрыт
                                        </span>
                                    )}
                                </td>
                                <td data-label="Действия">
                                    <div className="users-table__actions">
                                        <button
                                            className="users-table__action-btn users-table__action-btn--edit"
                                            onClick={() => onManageQuestions(test)}
                                            title="Управление вопросами"
                                        >
                                            <ListChecks size={18} />
                                        </button>
                                        <button
                                            className="users-table__action-btn users-table__action-btn--edit"
                                            onClick={() => onToggleActive(test)}
                                            title={test.is_active ? 'Скрыть тест' : 'Опубликовать тест'}
                                        >
                                            {test.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <button
                                            className="users-table__action-btn users-table__action-btn--edit"
                                            onClick={() => onEdit(test)}
                                            title="Изменить"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            className="users-table__action-btn users-table__action-btn--delete"
                                            onClick={() => onDelete(test)}
                                            title="Удалить"
                                        >
                                            <Trash2 size={18} />
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