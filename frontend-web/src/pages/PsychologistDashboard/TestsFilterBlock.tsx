import { Search, RotateCcw } from 'lucide-react';

interface TestsFilterBlockProps {
    search: string;
    forWhom: string;
    isActive: string;
    isMonthly: string;
    onSearchChange: (value: string) => void;
    onForWhomChange: (value: string) => void;
    onIsActiveChange: (value: string) => void;
    onIsMonthlyChange: (value: string) => void;
    onReset: () => void;
}

export default function TestsFilterBlock({
    search,
    forWhom,
    isActive,
    isMonthly,
    onSearchChange,
    onForWhomChange,
    onIsActiveChange,
    onIsMonthlyChange,
    onReset,
}: TestsFilterBlockProps) {
    const hasActiveFilters =
        search !== '' || forWhom !== 'all' || isActive !== 'all' || isMonthly !== 'all';

    return (
        <div className="users-filter">
            <div className="users-filter__field users-filter__field--search">
                <label className="users-filter__label">Поиск</label>
                <div className="users-filter__input-wrapper">
                    <Search size={18} className="users-filter__search-icon" />
                    <input
                        type="text"
                        className="users-filter__input"
                        placeholder="Название теста"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Для кого</label>
                <select
                    className="users-filter__select"
                    value={forWhom}
                    onChange={(e) => onForWhomChange(e.target.value)}
                >
                    <option value="all">Все</option>
                    <option value="child">Для детей</option>
                    <option value="parent">Для родителей</option>
                    <option value="both">Для всех</option>
                </select>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Активность</label>
                <select
                    className="users-filter__select"
                    value={isActive}
                    onChange={(e) => onIsActiveChange(e.target.value)}
                >
                    <option value="all">Все</option>
                    <option value="1">Активные</option>
                    <option value="0">Неактивные</option>
                </select>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Ежемесячный</label>
                <select
                    className="users-filter__select"
                    value={isMonthly}
                    onChange={(e) => onIsMonthlyChange(e.target.value)}
                >
                    <option value="all">Все</option>
                    <option value="1">Да</option>
                    <option value="0">Нет</option>
                </select>
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