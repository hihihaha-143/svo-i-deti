import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}

const DailyTipsFilterBlock: React.FC<Props> = ({
  search, onSearchChange, dateFrom, onDateFromChange, dateTo, onDateToChange,
}) => {
  return (
    <div className="users-filter">
      <div className="users-filter__field users-filter__field--search">
        <label className="users-filter__label">Поиск</label>
        <div className="users-filter__input-wrapper">
          <Search className="users-filter__search-icon" size={18} />
          <input
            type="text"
            className="users-filter__input"
            placeholder="Текст совета..."
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
    </div>
  );
};

export default DailyTipsFilterBlock;