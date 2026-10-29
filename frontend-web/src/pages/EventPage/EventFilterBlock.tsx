import { Search, RotateCcw } from 'lucide-react';

interface EventFilterBlockProps {
    search: string;
    type: string;
    lessonsCount: string;
    dateFrom: string;
    dateTo: string;
    onSearchChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onLessonsCountChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onReset: () => void;
}

export default function EventFilterBlock({
    search,
    type,
    lessonsCount,
    dateFrom,
    dateTo,
    onSearchChange,
    onTypeChange,
    onLessonsCountChange,
    onDateFromChange,
    onDateToChange,
    onReset,
}: EventFilterBlockProps) {
    const hasActiveFilters =
        search !== '' ||
        type !== 'all' ||
        lessonsCount !== '' ||
        dateFrom !== '' ||
        dateTo !== '';

    return (
        <div className="users-filter">
            <div className="users-filter__field users-filter__field--search">
                <label className="users-filter__label">Поиск</label>
                <div className="users-filter__input-wrapper">
                    <Search size={18} className="users-filter__search-icon" />
                    <input
                        type="text"
                        className="users-filter__input"
                        placeholder="Название мероприятия"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Тип</label>
                <select
                    className="users-filter__select"
                    value={type}
                    onChange={(e) => onTypeChange(e.target.value)}
                >
                    <option value="all">Все типы</option>
                    <option value="psychologist">Психолог</option>
                    <option value="mentor">Наставник</option>
                </select>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Количество занятий</label>
                <input
                    type="number"
                    className="users-filter__input"
                    placeholder="Например, 4"
                    min={1}
                    value={lessonsCount}
                    onChange={(e) => onLessonsCountChange(e.target.value)}
                />
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