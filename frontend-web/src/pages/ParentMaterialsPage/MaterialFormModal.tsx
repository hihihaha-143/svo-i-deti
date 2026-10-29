import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import { parentMaterialApi } from '../../api/parentMaterials';
import type { ParentMaterial } from '../../api/parentMaterials';
import useToast from '../../hooks/useToast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  material: ParentMaterial | null;
}

const MaterialFormModal: React.FC<Props> = ({ isOpen, onClose, onSave, material }) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (material) {
        setTitle(material.title);
        setPreview(material.preview || '');
        setContent(material.content);
      } else {
        setTitle('');
        setPreview('');
        setContent('');
      }
    }
  }, [isOpen, material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Заполните название и текст статьи', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        preview: preview.trim() || null,
        content,
      };
      if (material) {
        await parentMaterialApi.updateMaterial(material.id, payload);
        showToast('Материал обновлен', 'success');
      } else {
        await parentMaterialApi.createMaterial(payload);
        showToast('Материал добавлен', 'success');
      }
      onSave();
    } catch {
      showToast('Ошибка сохранения', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const textareaStyle: React.CSSProperties = {
    padding: '1.2rem',
    border: '1px solid var(--secondary-admin)',
    borderRadius: 'var(--radius-1)',
    fontSize: '1.5rem',
    color: 'var(--text-admin)',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    width: '100%',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={material ? 'Редактировать материал' : 'Добавить материал'}>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="user-form__field">
          <label>Название</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="user-form__field">
          <label>Превью (краткое описание)</label>
          <textarea
            rows={2}
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            style={textareaStyle}
          />
        </div>
        <div className="user-form__field">
          <label>Полный текст статьи</label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={textareaStyle}
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

export default MaterialFormModal;