import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { DailyTip } from '../../api/dailyTips';

interface Props {
  tips: DailyTip[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (t: DailyTip) => void;
  onDelete: (id: number) => void;
}

const DailyTipsTableBlock: React.FC<Props> = ({
  tips,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  if (isLoading) return <div className="users-table__loading">Загрузка...</div>;
  if (tips.length === 0) return <div className="users-table__empty">Советы не найдены</div>;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div className="users-table">
        <table className="users-table__table">
          <thead>
            <tr>
              <th>Текст совета</th>
              <th>Создан</th>
              <th className="users-table__actions-header">Действия</th>
            </tr>
          </thead>
          <tbody>
            {tips.map((t) => (
              <tr key={t.id}>
                <td
                  data-label="Текст совета"
                  title={t.text}
                  style={{ maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {t.text}
                </td>
                <td data-label="Создан">{formatDate(t.created_at)}</td>
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

export default DailyTipsTableBlock;