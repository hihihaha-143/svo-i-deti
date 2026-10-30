import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import { recommendationApi } from '../../api/recommendations';
import type { Recommendation } from '../../api/recommendations';
import useToast from '../../hooks/useToast';

interface SimpleUser {
  id: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  recommendation: Recommendation | null;
  parents: SimpleUser[];
  children: SimpleUser[];
}

const RecommendationFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  recommendation,
  parents,
  children,
}) => {
  const { showToast } = useToast();
  const [parentId, setParentId] = useState<number | ''>('');
  const [childId, setChildId] = useState<number | ''>('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (recommendation) {
        setParentId(recommendation.parent_id);
        setChildId(recommendation.child_id || '');
        setText(recommendation.text);
      } else {
        setParentId('');
        setChildId('');
        setText('');
      }
    }
  }, [isOpen, recommendation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentId || !text.trim()) {
      showToast('Выберите родителя и введите текст', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        parent_id: Number(parentId),
        child_id: childId ? Number(childId) : null,
        text,
      };
      if (recommendation) {
        await recommendationApi.updateRecommendation(recommendation.id, text);
        showToast('Рекомендация обновлена', 'success');
      } else {
        await recommendationApi.createRecommendation(payload);
        showToast('Рекомендация добавлена', 'success');
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
    <Modal isOpen={isOpen} onClose={onClose} title={recommendation ? 'Редактировать рекомендацию' : 'Новая рекомендация'}>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="user-form__field">
          <label>Родитель</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(Number(e.target.value))}
            required
            disabled={!!recommendation} // При редактировании родителя менять нельзя
          >
            <option value="">Выберите родителя</option>
            {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="user-form__field">
          <label>Ребёнок (опционально)</label>
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value ? Number(e.target.value) : '')}
            disabled={!!recommendation}
          >
            <option value="">Не привязан</option>
            {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="user-form__field">
          <label>Текст рекомендации</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
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

export default RecommendationFormModal;