import React from 'react';

interface SimpleUser {
  id: number;
  name: string;
}

interface Props {
  childId: number | '';
  onChildChange: (id: number | '') => void;
  parentId: number | '';
  onParentChange: (id: number | '') => void;
  status: 'read' | 'unread' | '';
  onStatusChange: (status: 'read' | 'unread' | '') => void;
  dateFrom: string;
  onDateFromChange: (val: string) => void;
  dateTo: string;
  onDateToChange: (val: string) => void;
  parents: SimpleUser[];
  children: SimpleUser[];
}

const RecommendationsFilterBlock: React.FC<Props> = ({
  childId, onChildChange,
  parentId, onParentChange,
  status, onStatusChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
  parents, children,
}) => {
  return (
    <div className="users-filter">
      <div className="users-filter__field">
        <label className="users-filter__label">Ребёнок</label>
        <select
          className="users-filter__select"
          value={childId}
          onChange={(e) => onChildChange(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Все дети</option>
          {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="users-filter__field">
        <label className="users-filter__label">Родитель</label>
        <select
          className="users-filter__select"
          value={parentId}
          onChange={(e) => onParentChange(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Все родители</option>
          {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="users-filter__field">
        <label className="users-filter__label">Статус</label>
        <select
          className="users-filter__select"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as 'read' | 'unread' | '')}
        >
          <option value="">Все</option>
          <option value="unread">Не прочитано</option>
          <option value="read">Прочитано</option>
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
    </div>
  );
};

export default RecommendationsFilterBlock;