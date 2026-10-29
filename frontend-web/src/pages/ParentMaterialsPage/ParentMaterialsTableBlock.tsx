import React from 'react';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import type { ParentMaterial } from '../../api/parentMaterials';

interface Props {
  materials: ParentMaterial[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (m: ParentMaterial) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (id: number) => void;
}

const ParentMaterialsTableBlock: React.FC<Props> = ({
  materials,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onTogglePublish,
}) => {
  if (isLoading) return <div className="users-table__loading">Загрузка...</div>;
  if (materials.length === 0) return <div className="users-table__empty">Материалы не найдены</div>;

  return (
    <>
      <div className="users-table">
        <table className="users-table__table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Превью</th>
              <th>Статус</th>
              <th className="users-table__actions-header">Действия</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id}>
                <td data-label="Название">
                  <strong>{m.title}</strong>
                </td>
                <td
                  data-label="Превью"
                  title={m.preview || ''}
                  style={{ maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {m.preview || '—'}
                </td>
                <td data-label="Статус">
                  <span className={`login-role-badge login-role-badge--${m.is_published ? 'parent' : 'unknown'}`}>
                    {m.is_published ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td data-label="Действия">
                  <div className="users-table__actions">
                    <button
                      className="users-table__action-btn users-table__action-btn--edit"
                      onClick={() => onEdit(m)}
                      title="Изменить"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="users-table__action-btn users-table__action-btn--delete"
                      onClick={() => onDelete(m.id)}
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="users-table__action-btn"
                      onClick={() => onTogglePublish(m.id)}
                      title={m.is_published ? 'Снять с публикации' : 'Опубликовать'}
                      style={{
                        backgroundColor: 'var(--accent-admin, #FFC107)',
                        borderColor: 'var(--accent-admin, #FFC107)',
                        color: '#000',
                      }}
                    >
                      {m.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="users-table__pagination">
          <button
            className="users-table__page-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Назад
          </button>
          <span className="users-table__page-info">
            Страница {page} из {totalPages}
          </span>
          <button
            className="users-table__page-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            Вперед
          </button>
        </div>
      )}
    </>
  );
};

export default ParentMaterialsTableBlock;