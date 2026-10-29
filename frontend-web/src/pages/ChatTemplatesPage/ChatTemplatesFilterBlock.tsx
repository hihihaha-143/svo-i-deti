import React from 'react';
import { Search } from 'lucide-react';
import type { ChatTemplateCategory } from '../../api/chatTemplates';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: number | '';
  onCategoryChange: (value: number | '') => void;
  categories: ChatTemplateCategory[];
}

const ChatTemplatesFilterBlock: React.FC<Props> = ({
  search, onSearchChange, categoryId, onCategoryChange, categories,
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
            placeholder="Название, текст..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="users-filter__field">
        <label className="users-filter__label">Категория</label>
        <select
          className="users-filter__select"
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ChatTemplatesFilterBlock;