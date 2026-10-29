import { RotateCcw } from 'lucide-react';

interface ChildOption {
    id: number;
    name: string;
}

interface MoodFilterBlockProps {
    childId: string;
    mood: string;
    dateFrom: string;
    dateTo: string;
    children: ChildOption[];
    onChildChange: (value: string) => void;
    onMoodChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onReset: () => void;
}

export default function MoodFilterBlock({
    childId,
    mood,
    dateFrom,
    dateTo,
    children,
    onChildChange,
    onMoodChange,
    onDateFromChange,
    onDateToChange,
    onReset,
}: MoodFilterBlockProps) {
    const hasActiveFilters =
        childId !== 'all' || mood !== 'all' || dateFrom !== '' || dateTo !== '';

    return (
        <div className="users-filter">
            <div className="users-filter__field">
                <label className="users-filter__label">Ребёнок</label>
                <select
                    className="users-filter__select"
                    value={childId}
                    onChange={(e) => onChildChange(e.target.value)}
                >
                    <option value="all">Все дети</option>
                    {children.map(child => (
                        <option key={child.id} value={String(child.id)}>
                            {child.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Настроение</label>
                <select
                    className="users-filter__select"
                    value={mood}
                    onChange={(e) => onMoodChange(e.target.value)}
                >
                    <option value="all">Все настроения</option>
                    <option value="good">Хорошее</option>
                    <option value="normal">Нормальное</option>
                    <option value="bad">Плохое</option>
                </select>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Дата от</label>
                <input
                    type="date"
                    className="users-filter__input"
                    value={dateFrom}
                    onChange={(e) => onDateFromChange(e.target.value)}
                />
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Дата до</label>
                <input
                    type="date"
                    className="users-filter__input"
                    value={dateTo}
                    onChange={(e) => onDateToChange(e.target.value)}
                />
            </div>

            {hasActiveFilters && (
                <div className="users-filter__field users-filter__field--reset">
                    <button
                        type="button"
                        className="users-filter__reset-btn"
                        onClick={onReset}
                    >
                        <RotateCcw size={16} /> Сбросить
                    </button>
                </div>
            )}
        </div>
    );
}