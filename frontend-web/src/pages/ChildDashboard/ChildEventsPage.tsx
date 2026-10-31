import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, BookOpen, CheckCircle, XCircle, Clock } from 'lucide-react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import '../../styles/pages/ChildDashboard/_child-events.scss';

interface LessonInfo {
  date: string;
  lesson_number: number;
}

interface LastLessonInfo extends LessonInfo {
  attended: boolean | null;
}

interface MissedLesson {
  lesson_number: number;
  date: string;
}

interface EventItem {
  id: number;
  title: string;
  type: string | null;
  description: string | null;
  start_date: string | null;
  lessons_count: number;
  attended_count: number;
  schedule_type: string | null;
  schedule_interval: number | null;
  schedule_day_of_week: string | null;
  next_lesson: LessonInfo | null;
  last_lesson: LastLessonInfo | null;
  missed_lessons: MissedLesson[];
}

export default function ChildEventsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/child/events');
        setEvents(res.data.data || []);
      } catch {
        showToast('Ошибка загрузки мероприятий', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="child-events__loading">Загрузка...</div>;

  return (
    <div className="child-events">
      <button className="child-events__back" onClick={() => navigate('/child')}>
        <ArrowLeft size={16} />
        <span>Назад</span>
      </button>

      <h1 className="child-events__title">
        <Calendar size={28} />
        Мои мероприятия
      </h1>

      {events.length === 0 ? (
        <p className="child-events__empty">Пока нет мероприятий</p>
      ) : (
        <ul className="child-events__list">
          {events.map((event) => (
            <li key={event.id} className="child-events__card">
              <h3 className="child-events__card-title">{event.title}</h3>

              {event.type && (
                <p className="child-events__card-type">{event.type}</p>
              )}

              {event.description && (
                <p className="child-events__card-desc">{event.description}</p>
              )}

              <div className="child-events__card-meta">
                {event.start_date && (
                  <span>
                    <Calendar size={14} /> Начало: {event.start_date}
                  </span>
                )}
                <span>
                  <BookOpen size={14} /> Посещено: {event.attended_count} из {event.lessons_count}
                </span>
              </div>

              <div className="child-events__card-progress">
                <div
                  className="child-events__card-progress-fill"
                  style={{
                    width: `${event.lessons_count > 0
                      ? (event.attended_count / event.lessons_count) * 100
                      : 0}%`,
                  }}
                />
              </div>

              {event.last_lesson && (
                <div className="child-events__card-lesson">
                  <span className="child-events__card-lesson-label">
                    <Clock size={14} /> Прошедшее занятие ({event.last_lesson.date}):
                  </span>
                  {event.last_lesson.attended === true && (
                    <span className="child-events__card-status-done">
                      <CheckCircle size={14} /> Был
                    </span>
                  )}
                  {event.last_lesson.attended === false && (
                    <span className="child-events__card-status-pending">
                      <XCircle size={14} /> Не был
                    </span>
                  )}
                  {event.last_lesson.attended === null && (
                    <span className="child-events__card-status-unknown">Нет отметки</span>
                  )}
                </div>
              )}

              {event.next_lesson && (
                <div className="child-events__card-lesson">
                  <span className="child-events__card-lesson-label">
                    <Clock size={14} /> Следующее занятие: {event.next_lesson.date}
                  </span>
                </div>
              )}

              {event.missed_lessons.length > 0 && (
                <div className="child-events__card-missed">
                  <span className="child-events__card-missed-label">
                    <XCircle size={14} /> Пропущено ({event.missed_lessons.length}):
                  </span>
                  <ul className="child-events__card-missed-list">
                    {event.missed_lessons.map((l) => (
                      <li key={l.lesson_number} className="child-events__card-missed-item">
                        {l.date}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}