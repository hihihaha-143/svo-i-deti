import { Search, RotateCcw } from 'lucide-react';

interface LoginLogsFilterBlockProps {
    role: string;
    search: string;
    dateFrom: string;
    dateTo: string;
    onRoleChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onReset: () => void;
}

export default function LoginLogsFilterBlock({
    role,
    search,
    dateFrom,
    dateTo,
    onRoleChange,
    onSearchChange,
    onDateFromChange,
    onDateToChange,
    onReset,
}: LoginLogsFilterBlockProps) {
    const hasActiveFilters =
        role !== 'all' || search !== '' || dateFrom !== '' || dateTo !== '';

    return (
        <div className="users-filter">
            <div className="users-filter__field">
                <label className="users-filter__label">Роль</label>
                <select
                    className="users-filter__select"
                    value={role}
                    onChange={(e) => onRoleChange(e.target.value)}
                >
                    <option value="all">Все роли</option>
                    <option value="mentor">Наставник</option>
                    <option value="parent">Родитель</option>
                    <option value="child">Ребёнок</option>
                </select>
            </div>

            <div className="users-filter__field users-filter__field--search">
                <label className="users-filter__label">Поиск</label>
                <div className="users-filter__input-wrapper">
                    <Search size={18} className="users-filter__search-icon" />
                    <input
                        type="text"
                        className="users-filter__input"
                        placeholder="Имя или логин"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
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