import { CalendarDays } from 'lucide-react';

export interface ReportsFilters {
    date_from: string;
    date_to: string;
}

interface ReportsFilterBlockProps {
    filters: ReportsFilters;
    onChange: (filters: ReportsFilters) => void;
}

function toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function startOfWeek(): Date {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diff);
    return d;
}

export default function ReportsFilterBlock({ filters, onChange }: ReportsFilterBlockProps) {
    const setWeek = () => {
        const from = startOfWeek();
        const to = new Date();
        onChange({ date_from: toISODate(from), date_to: toISODate(to) });
    };

    const setMonth = () => {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1);
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        onChange({ date_from: toISODate(from), date_to: toISODate(to) });
    };

    const update = (patch: Partial<ReportsFilters>) => {
        onChange({ ...filters, ...patch });
    };

    return (
        <div className="users-filter">
            <div className="users-filter__field users-filter__field--reset">
                <label className="users-filter__label">Период</label>
                <div className="users-header__actions">
                    <button type="button" className="users-header__export-btn" onClick={setWeek}>
                        Неделя
                    </button>
                    <button type="button" className="users-header__export-btn" onClick={setMonth}>
                        Месяц
                    </button>
                </div>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Дата от</label>
                <div className="users-filter__input-wrapper">
                    <CalendarDays size={16} className="users-filter__search-icon" />
                    <input
                        type="date"
                        className="users-filter__input"
                        value={filters.date_from}
                        onChange={(e) => update({ date_from: e.target.value })}
                    />
                </div>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Дата до</label>
                <div className="users-filter__input-wrapper">
                    <CalendarDays size={16} className="users-filter__search-icon" />
                    <input
                        type="date"
                        className="users-filter__input"
                        value={filters.date_to}
                        onChange={(e) => update({ date_to: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}