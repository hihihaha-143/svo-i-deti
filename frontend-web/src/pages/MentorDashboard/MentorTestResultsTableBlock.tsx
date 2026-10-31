import type { MentorTestResult } from './MentorTestResultsPage';

interface MentorTestResultsTableBlockProps {
    rows: MentorTestResult[];
    loading: boolean;
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function MentorTestResultsTableBlock({
    rows,
    loading,
    currentPage,
    lastPage,
    onPageChange,
}: MentorTestResultsTableBlockProps) {
    return (
        <div className="users-table">
            <table className="users-table__table">
                <thead>
                    <tr>
                        <th>Ребёнок</th>
                        <th>Тест</th>
                        <th>Дата прохождения</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={3}>Загрузка…</td>
                        </tr>
                    )}

                    {!loading && rows.length === 0 && (
                        <tr>
                            <td colSpan={3}>Нет результатов</td>
                        </tr>
                    )}

                    {!loading &&
                        rows.map((row) => (
                            <tr key={row.id}>
                                <td>
                                    {row.child.name}
                                    <span className="users-table__login">
                                        {' '}
                                        ({row.child.login})
                                    </span>
                                </td>
                                <td>{row.test.title}</td>
                                <td>{formatDate(row.completed_at)}</td>
                            </tr>
                        ))}
                </tbody>
            </table>

            {lastPage > 1 && (
                <div className="users-table__pagination">
                    <button
                        type="button"
                        className="users-table__page-btn"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        ‹
                    </button>
                    <span>
                        {currentPage} / {lastPage}
                    </span>
                    <button
                        type="button"
                        className="users-table__page-btn"
                        disabled={currentPage >= lastPage}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        ›
                    </button>
                </div>
            )}
        </div>
    );
}
