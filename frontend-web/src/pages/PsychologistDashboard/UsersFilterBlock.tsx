import { Search, RotateCcw } from 'lucide-react';

interface UsersFilterBlockProps {
    search: string;
    onSearchChange: (value: string) => void;
}

export default function UsersFilterBlock({ search, onSearchChange }: UsersFilterBlockProps) {
    const hasActiveFilters = search !== '';

    return (
        <div className="users-filter">
            <div className="users-filter__search">
                <Search size={18} className="users-filter__search-icon" />
                <input
                    type="text"
                    placeholder="Поиск по имени или логину..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {hasActiveFilters && (
                <button
                    type="button"
                    className="users-filter__reset-btn"
                    onClick={() => onSearchChange('')}
                >
                    <RotateCcw size={16} /> Сбросить
                </button>
            )}
        </div>
    );
}