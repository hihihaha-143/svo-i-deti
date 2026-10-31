import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Circle, MessageSquare, Save, History, BookOpen } from 'lucide-react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import '../../styles/pages/ParentDashboard/_parent-diary.scss';

interface Child {
  id: number;
  name: string;
}

interface DiaryEntry {
  id: number;
  child_id: number;
  child_name: string;
  event: string;
  event_label: string;
  text: string;
  date: string;
}

interface EventOption {
  value: string;
  label: string;
}

export default function ParentDiaryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [formChildId, setFormChildId] = useState<string>('');
  const [formEvent, setFormEvent] = useState<string>('');
  const [formText, setFormText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/parent/diaries');
      setEntries(res.data.data || []);
      setChildren(res.data.children || []);
      setEvents(res.data.events || []);
      if (res.data.children?.length > 0) {
        setFormChildId(res.data.children[0].id.toString());
      }
      if (res.data.events?.length > 0) {
        setFormEvent(res.data.events[0].value);
      }
    } catch {
      showToast('Ошибка загрузки дневника', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formChildId || !formText.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/parent/diaries', {
        child_id: Number(formChildId),
        event: formEvent,
        text: formText.trim(),
      });
      showToast('Запись добавлена', 'success');
      setFormText('');
      await fetchData();
    } catch {
      showToast('Ошибка сохранения записи', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="parent-diary__loading">Загрузка...</div>;
  }

  return (
    <div className="parent-diary">
      <button className="parent-diary__back" onClick={() => navigate('/parent')}>
        <ArrowLeft size={16} />
        <span>На главную</span>
      </button>

      <h2 className="parent-diary__page-title">
        <BookOpen size={24} />
        Дневник наблюдений
      </h2>

      {children.length === 0 ? (
        <div className="parent-diary__block">
          <p className="parent-diary__empty">У вас пока нет привязанных детей.</p>
        </div>
      ) : (
        <>
          <div className="parent-diary__block">
            <h3 className="parent-diary__block-title">
              <Save size={20} />
              Новая запись
            </h3>

            <form className="parent-diary__form" onSubmit={handleSubmit}>
              <div className="parent-diary__field">
                <label className="parent-diary__label">
                  <User size={16} />
                  Ребёнок
                </label>
                <select
                  className="parent-diary__select"
                  value={formChildId}
                  onChange={(e) => setFormChildId(e.target.value)}
                  required
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="parent-diary__field">
                <label className="parent-diary__label">
                  <Circle size={16} />
                  Событие (необязательно)
                </label>
                <select
                  className="parent-diary__select"
                  value={formEvent}
                  onChange={(e) => setFormEvent(e.target.value)}
                >
                  <option value="">Без события</option>
                  {events.map((ev) => (
                    <option key={ev.value} value={ev.value}>
                      {ev.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="parent-diary__field">
                <label className="parent-diary__label">
                  <MessageSquare size={16} />
                  Заметка
                </label>
                <textarea
                  className="parent-diary__textarea"
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  rows={5}
                  maxLength={5000}
                  placeholder="Опишите наблюдение..."
                  required
                />
              </div>

              <button
                type="submit"
                className="parent-diary__btn-submit"
                disabled={isSubmitting}
              >
                <Save size={18} />
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>

          <div className="parent-diary__block">
            <h3 className="parent-diary__block-title">
              <History size={20} />
              История записей
            </h3>

            {entries.length === 0 ? (
              <p className="parent-diary__empty">
                <BookOpen size={16} />
                Записей пока нет
              </p>
            ) : (
              <ul className="parent-diary__list">
                {entries.map((entry) => (
                  <li key={entry.id} className="parent-diary__item">
                    <div className="parent-diary__item-header">
                      <span className="parent-diary__item-badge">{entry.event_label}</span>
                      <span className="parent-diary__item-date">{entry.date}</span>
                    </div>
                    <div className="parent-diary__item-child">
                      <User size={14} />
                      {entry.child_name}
                    </div>
                    <p className="parent-diary__item-text">{entry.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}