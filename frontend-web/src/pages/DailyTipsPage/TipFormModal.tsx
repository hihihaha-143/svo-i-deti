import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import { dailyTipApi } from '../../api/dailyTips';
import type { DailyTip } from '../../api/dailyTips';
import useToast from '../../hooks/useToast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  tip: DailyTip | null;
}

const TipFormModal: React.FC<Props> = ({ isOpen, onClose, onSave, tip }) => {
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (tip) {
        setText(tip.text);
      } else {
        setText('');
      }
    }
  }, [isOpen, tip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      showToast('Введите текст совета', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (tip) {
        await dailyTipApi.updateTip(tip.id, text);
        showToast('Совет обновлен', 'success');
      } else {
        await dailyTipApi.createTip(text);
        showToast('Совет добавлен', 'success');
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
    <Modal isOpen={isOpen} onClose={onClose} title={tip ? 'Редактировать совет' : 'Добавить совет'}>
      <form onSubmit={handleSubmit} className="user-form">
        <div className="user-form__field">
          <label>Текст совета</label>
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

export default TipFormModal;