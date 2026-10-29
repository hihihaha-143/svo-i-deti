import { AlertTriangle, Minus } from 'lucide-react';

interface MoodRow {
    id: number;
    child_id: number;
    child_name: string;
    mood: string;
    mood_label: string;
    date: string;
    risk: boolean;
}

interface MoodTableBlockProps {
    data: MoodRow[];
    isLoading: boolean;
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
}

const MOOD_MODIFIERS: Record<string, string> = {
    good: 'good',
    normal: 'normal',
    bad: 'bad',
};

export default function MoodTableBlock({
    data,
    isLoading,
    currentPage,
    lastPage,
    total,
    onPageChange,
}: MoodTableBlockProps) {
    if (isLoading) {
        return <div className="users-table__loading">Загрузка...</div>;
    }

    return (
        <div className="users-table">
            <table className="users-table__table">
                <thead>
                    <tr>
                        <th>Ребёнок</th>
                        <th>Зона риска</th>
                        <th>Настроение</th>
                        <th>Дата</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="users-table__empty">
                                Нет записей о настроениях
                            </td>
                        </tr>
                    ) : (
                        data.map(row => (
                            <tr key={row.id}>
                                <td data-label="Ребёнок">{row.child_name}</td>
                                <td data-label="Зона риска">
                                    {row.risk ? (
                                        <span className="mood-risk mood-risk--yes">
                                            <AlertTriangle size={14} /> Да
                                        </span>
                                    ) : (
                                        <span className="mood-risk mood-risk--no">
                                            <Minus size={14} /> Нет
                                        </span>
                                    )}
                                </td>
                                <td data-label="Настроение">
                                    <span className={`mood-badge mood-badge--${MOOD_MODIFIERS[row.mood] ?? 'unknown'}`}>
                                        {row.mood_label}
                                    </span>
                                </td>
                                <td data-label="Дата">{row.date}</td>
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