import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { ChatTemplate } from '../../api/chatTemplates';

interface Props {
  templates: ChatTemplate[];
  isLoading: boolean;
  onEdit: (t: ChatTemplate) => void;
  onDelete: (id: number) => void;
}

const ChatTemplatesTableBlock: React.FC<Props> = ({ templates, isLoading, onEdit, onDelete }) => {
  if (isLoading) return <div className="users-table__loading">Загрузка...</div>;
  if (templates.length === 0) return <div className="users-table__empty">Шаблоны не найдены</div>;

  return (
    <div className="users-table">
      <table className="users-table__table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Категория</th>
            <th>Текст</th>
            <th>Использований</th>
            <th className="users-table__actions-header">Действия</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((t) => (
            <tr key={t.id}>
              <td data-label="Название">{t.name}</td>
              <td data-label="Категория">{t.category.name}</td>
              <td
                data-label="Текст"
                title={t.text}
                style={{ maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {t.text}
              </td>
              <td data-label="Использований">{t.usage_count}</td>
              <td data-label="Действия">
                <div className="users-table__actions">
                  <button
                    className="users-table__action-btn users-table__action-btn--edit"
                    onClick={() => onEdit(t)}
                    title="Изменить"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="users-table__action-btn users-table__action-btn--delete"
                    onClick={() => onDelete(t.id)}
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChatTemplatesTableBlock;