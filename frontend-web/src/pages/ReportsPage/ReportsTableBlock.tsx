import { Eye } from 'lucide-react';

interface ReportChildRow {
    id: number;
    name: string;
    login: string;
    moods_total: number;
    moods_good: number;
    moods_normal: number;
    moods_bad: number;
    tests_completed: number;
    is_active: boolean;
    is_risk: boolean;
}

interface ReportsTableBlockProps {
    items: ReportChildRow[];
    isLoading: boolean;
    onOpenChild: (row: ReportChildRow) => void;
}

export default function ReportsTableBlock({ items, isLoading, onOpenChild }: ReportsTableBlockProps) {
    if (isLoading) {
        return <div className="users-table__loading">Загрузка...</div>;
    }

    if (!items.length) {
        return <div className="users-table__empty">Данных за период нет</div>;
    }

    return (
        <div className="users-table">
            <table className="users-table__table">
                <thead>
                    <tr>
                        <th>Ребёнок</th>
                        <th>Логин</th>
                        <th>Настроений</th>
                        <th>Хорошо</th>
                        <th>Нейтрально</th>
                        <th>Плохо</th>
                        <th>Тестов</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(row => (
                        <tr key={row.id}>
                            <td data-label="Ребёнок">{row.name}</td>
                            <td data-label="Логин">{row.login}</td>
                            <td data-label="Настроений">{row.moods_total}</td>
                            <td data-label="Хорошо">{row.moods_good}</td>
                            <td data-label="Нейтрально">{row.moods_normal}</td>
                            <td data-label="Плохо">{row.moods_bad}</td>
                            <td data-label="Тестов">{row.tests_completed}</td>
                            <td data-label="Статус">
                                {row.is_risk ? (
                                    <span className="login-role-badge login-role-badge--child">Зона риска</span>
                                ) : row.is_active ? (
                                    <span className="login-role-badge login-role-badge--parent">Активен</span>
                                ) : (
                                    <span className="login-role-badge login-role-badge--unknown">Не активен</span>
                                )}
                            </td>
                            <td data-label="Действия">
                                <div className="users-table__actions">
                                    <button
                                        type="button"
                                        className="users-table__action-btn"
                                        onClick={() => onOpenChild(row)}
                                        title="Детальный отчёт"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}