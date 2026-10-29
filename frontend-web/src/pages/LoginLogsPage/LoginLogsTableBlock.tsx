interface LoginLog {
    id: number;
    datetime: string;
    name: string;
    login: string;
    role: string | null;
    role_label: string;
}

interface LoginLogsTableBlockProps {
    data: LoginLog[];
    isLoading: boolean;
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
}

export default function LoginLogsTableBlock({
    data,
    isLoading,
    currentPage,
    lastPage,
    total,
    onPageChange,
}: LoginLogsTableBlockProps) {
    if (isLoading) {
        return <div className="users-table__loading">Загрузка...</div>;
    }

    return (
        <div className="users-table">
            <table className="users-table__table">
                <thead>
                    <tr>
                        <th>Дата входа</th>
                        <th>Имя</th>
                        <th>Логин</th>
                        <th>Роль</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="users-table__empty">
                                Нет записей о входах
                            </td>
                        </tr>
                    ) : (
                        data.map(log => (
                            <tr key={log.id}>
                                <td data-label="Дата входа">{log.datetime}</td>
                                <td data-label="Имя">{log.name}</td>
                                <td data-label="Логин">{log.login}</td>
                                <td data-label="Роль">
                                    <span className={`login-role-badge login-role-badge--${log.role ?? 'unknown'}`}>
                                        {log.role_label}
                                    </span>
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