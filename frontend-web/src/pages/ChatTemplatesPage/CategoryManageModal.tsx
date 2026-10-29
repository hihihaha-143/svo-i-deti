import React, { useState } from 'react';
import Modal from '../../components/Modal/Modal';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { chatTemplateApi } from '../../api/chatTemplates';
import type { ChatTemplateCategory } from '../../api/chatTemplates';
import useToast from '../../hooks/useToast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: ChatTemplateCategory[];
  onCategoriesChange: () => void;
}

const CategoryManageModal: React.FC<Props> = ({ isOpen, onClose, categories, onCategoriesChange }) => {
  const { showToast } = useToast();
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      await chatTemplateApi.createCategory(newName.trim());
      showToast('Категория добавлена', 'success');
      setNewName('');
      onCategoriesChange();
    } catch {
      showToast('Ошибка добавления (возможно, дубликат)', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editName.trim()) return;
    setIsSubmitting(true);
    try {
      await chatTemplateApi.updateCategory(id, editName.trim());
      showToast('Категория обновлена', 'success');
      setEditId(null);
      onCategoriesChange();
    } catch {
      showToast('Ошибка обновления', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить категорию?')) return;
    try {
      await chatTemplateApi.deleteCategory(id);
      showToast('Категория удалена', 'success');
      onCategoriesChange();
    } catch {
      showToast('Ошибка удаления (возможно, в категории есть шаблоны)', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Управление категориями">
      <form onSubmit={handleAdd} className="user-form" style={{ marginBottom: '2rem' }}>
        <div className="user-form__field" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label>Новая категория</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          </div>
          <button type="submit" className="user-form__btn user-form__btn--submit" disabled={isSubmitting}>
            Добавить
          </button>
        </div>
      </form>

      <div className="users-table">
        <table className="users-table__table">
          <thead>
            <tr>
              <th>Название</th>
              <th className="users-table__actions-header">Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td data-label="Название">
                  {editId === c.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ padding: '0.8rem', border: '1px solid var(--secondary-admin)', borderRadius: 'var(--radius-1)', fontSize: '1.4rem', width: '100%' }}
                      autoFocus
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td data-label="Действия">
                  <div className="users-table__actions">
                    {editId === c.id ? (
                      <>
                        <button
                          className="users-table__action-btn users-table__action-btn--edit"
                          onClick={() => handleEdit(c.id)}
                          title="Сохранить"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="users-table__action-btn users-table__action-btn--delete"
                          onClick={() => setEditId(null)}
                          title="Отмена"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="users-table__action-btn users-table__action-btn--edit"
                          onClick={() => { setEditId(c.id); setEditName(c.name); }}
                          title="Изменить"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="users-table__action-btn users-table__action-btn--delete"
                          onClick={() => handleDelete(c.id)}
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default CategoryManageModal;