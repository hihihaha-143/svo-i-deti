import { RotateCcw } from 'lucide-react';

interface Option {
    id?: number;
    value?: string;
    name?: string;
    label?: string;
}

interface DiaryFilterBlockProps {
    childId: string;
    parentId: string;
    event: string;
    dateFrom: string;
    dateTo: string;
    children: Option[];
    parents: Option[];
    events: Option[];
    onChildChange: (value: string) => void;
    onParentChange: (value: string) => void;
    onEventChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onReset: () => void;
}

export default function DiaryFilterBlock({
    childId,
    parentId,
    event,
    dateFrom,
    dateTo,
    children,
    parents,
    events,
    onChildChange,
    onParentChange,
    onEventChange,
    onDateFromChange,
    onDateToChange,
    onReset,
}: DiaryFilterBlockProps) {
    const hasActiveFilters =
        childId !== 'all' ||
        parentId !== 'all' ||
        event !== 'all' ||
        dateFrom !== '' ||
        dateTo !== '';

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
                    {children.map(c => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Родитель</label>
                <select
                    className="users-filter__select"
                    value={parentId}
                    onChange={(e) => onParentChange(e.target.value)}
                >
                    <option value="all">Все родители</option>
                    {parents.map(p => (
                        <option key={p.id} value={String(p.id)}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Событие</label>
                <select
                    className="users-filter__select"
                    value={event}
                    onChange={(e) => onEventChange(e.target.value)}
                >
                    <option value="all">Все события</option>
                    {events.map(ev => (
                        <option key={ev.value} value={ev.value}>{ev.label}</option>
                    ))}
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