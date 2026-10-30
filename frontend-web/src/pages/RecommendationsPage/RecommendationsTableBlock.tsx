import React from 'react';
import { Pencil, Trash2, MailOpen } from 'lucide-react';
import type { Recommendation } from '../../api/recommendations';

interface Props {
  recommendations: Recommendation[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (r: Recommendation) => void;
  onDelete: (id: number) => void;
  onMarkUnread: (id: number) => void;
}

const RecommendationsTableBlock: React.FC<Props> = ({
  recommendations,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onMarkUnread,
}) => {
  if (isLoading) return <div className="users-table__loading">Загрузка...</div>;
  if (recommendations.length === 0) return <div className="users-table__empty">Нет рекомендаций</div>;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="users-table">
        <table className="users-table__table">
          <thead>
            <tr>
              <th>Ребёнок</th>
              <th>Родитель</th>
              <th>Рекомендация</th>
              <th>Статус</th>
              <th>Дата</th>
              <th className="users-table__actions-header">Действия</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((r) => (
              <tr key={r.id}>
                <td data-label="Ребёнок">{r.child?.user.name || '—'}</td>
                <td data-label="Родитель">{r.parent?.user.name || '—'}</td>
                <td
                  data-label="Рекомендация"
                  title={r.text}
                  style={{ maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {r.text}
                </td>
                <td data-label="Статус">
                  <span className={`login-role-badge login-role-badge--${r.is_read ? 'parent' : 'unknown'}`}>
                    {r.is_read ? 'Прочитано' : 'Не прочитано'}
                  </span>
                </td>
                <td data-label="Дата">{formatDate(r.created_at)}</td>
                <td data-label="Действия">
                  <div className="users-table__actions">
                    <button
                      className="users-table__action-btn users-table__action-btn--edit"
                      onClick={() => onEdit(r)}
                      title="Изменить"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="users-table__action-btn users-table__action-btn--delete"
                      onClick={() => onDelete(r.id)}
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                    {r.is_read && (
                      <button
                        className="users-table__action-btn"
                        onClick={() => onMarkUnread(r.id)}
                        title="Вернуть в непрочитанные"
                      >
                        <MailOpen size={16} />
                      </button>
                    )}
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

export default RecommendationsTableBlock;