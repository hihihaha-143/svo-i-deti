import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import { chatTemplateApi } from '../../api/chatTemplates';
import type { ChatTemplate, ChatTemplateCategory } from '../../api/chatTemplates';
import useToast from '../../hooks/useToast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  template: ChatTemplate | null;
  categories: ChatTemplateCategory[];
}

const TemplateFormModal: React.FC<Props> = ({ isOpen, onClose, onSave, template, categories }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (template) {
        setName(template.name);
        setText(template.text);
        setCategoryId(template.category_id);
      } else {
        setName('');
        setText('');
        setCategoryId(categories.length ? categories[0].id : '');
      }
    }
  }, [isOpen, template, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || !categoryId) {
      showToast('Заполните все поля', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { name, text, category_id: Number(categoryId) };
      if (template) {
        await chatTemplateApi.updateTemplate(template.id, payload);
        showToast('Шаблон обновлен', 'success');
      } else {
        await chatTemplateApi.createTemplate(payload);
        showToast('Шаблон добавлен', 'success');
      }
      onSave();
    } catch {
      showToast('Ошибка сохранения', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={template ? 'Редактировать шаблон' : 'Добавить шаблон'}>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="user-form__field">
          <label>Название</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="user-form__field">
          <label>Категория</label>
          <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} required>
            <option value="">Выберите категорию</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="user-form__field">
          <label>Текст</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ padding: '1.2rem', border: '1px solid var(--secondary-admin)', borderRadius: 'var(--radius-1)', fontSize: '1.5rem', color: 'var(--text-admin)', outline: 'none', resize: 'vertical' }}
            required
          />
        </div>
        <div className="user-form__actions">
          <button type="button" className="user-form__btn user-form__btn--cancel" onClick={onClose} disabled={isSubmitting}>
            Отмена
          </button>
          <button type="submit" className="user-form__btn user-form__btn--submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TemplateFormModal;