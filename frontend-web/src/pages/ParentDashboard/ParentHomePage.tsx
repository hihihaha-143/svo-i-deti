import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageCircle, Lightbulb, Users, Bell, ListTodo, Play, LogOut, Check } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import useToast from '../../hooks/useToast';
import '../../styles/pages/ParentDashboard/_parent-home.scss';

interface Child {
  id: number;
  name: string;
  login: string;
}

interface Recommendation {
  id: number;
  text: string;
  is_read: boolean;
  created_at: string;
}

interface Test {
  id: number;
  title: string;
  is_passed: boolean;
}

export default function ParentHomePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [children, setChildren] = useState<Child[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [dailyTip, setDailyTip] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [childrenRes, recommendationsRes, testsRes, tipRes] = await Promise.all([
          apiClient.get('/parent/children'),
          apiClient.get('/parent/recommendations'),
          apiClient.get('/parent/tests'),
          apiClient.get('/parent/daily-tip'),
        ]);

        setChildren(childrenRes.data.data || []);
        setRecommendations(recommendationsRes.data.data || []);
        setTests(testsRes.data.data || []);
        setDailyTip(tipRes.data.data?.text || '');
      } catch (error) {
        showToast('Ошибка загрузки данных', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTakeTest = (testId: number) => {
    navigate(`/parent/test/${testId}`);
  };

  const handleMarkRead = async (recId: number) => {
    try {
      await apiClient.post(`/parent/recommendations/${recId}/read`);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, is_read: true } : r))
      );
    } catch {
      showToast('Ошибка обновления рекомендации', 'error');
    }
  };

  if (loading) {
    return <div className="parent-home__loading">Загрузка...</div>;
  }

  const visibleRecommendations = showAllRecommendations
    ? recommendations
    : recommendations.slice(0, 3);

  return (
    <div className="parent-home">
      {/* Меню */}
      <div className="parent-home__menu-grid">
        <button className="parent-home__menu-btn" onClick={() => navigate('/parent/diary')}>
          <BookOpen size={20} />
          <span>Дневник наблюдений</span>
        </button>
        <button className="parent-home__menu-btn" onClick={() => navigate('/parent/library')}>
          <BookOpen size={20} />
          <span>Библиотека знаний</span>
        </button>
        <button className="parent-home__menu-btn parent-home__menu-btn--full" onClick={() => navigate('/parent/chat')}>
          <MessageCircle size={20} />
          <span>Чат с психологом</span>
        </button>
      </div>

      {/* Совет дня */}
      {dailyTip && (
        <div className="parent-home__tip">
          <div className="parent-home__tip-header">
            <Lightbulb size={20} />
            <span>Совет дня</span>
          </div>
          <p className="parent-home__tip-text">{dailyTip}</p>
        </div>
      )}

      {/* Ваши дети */}
      <div className="parent-home__section">
        <div className="parent-home__section-header">
          <Users size={20} />
          <span>Ваши дети</span>
        </div>
        {children.length === 0 ? (
          <p className="parent-home__empty">Дети не привязаны</p>
        ) : (
          <ul className="parent-home__list">
            {children.map((child) => (
              <li key={child.id} className="parent-home__list-item">
                {child.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Рекомендации психолога */}
      <div className="parent-home__section">
        <div className="parent-home__section-header">
          <Bell size={20} />
          <span>Рекомендации психолога</span>
        </div>
        {recommendations.length === 0 ? (
          <p className="parent-home__empty">Пока нет рекомендаций</p>
        ) : (
          <>
            <ul className="parent-home__recommendations">
              {visibleRecommendations.map((rec) => (
                <li
                  key={rec.id}
                  className={`parent-home__recommendation${!rec.is_read ? ' parent-home__recommendation--unread' : ''}`}
                >
                  <p className="parent-home__recommendation-text">{rec.text}</p>
                  {!rec.is_read && (
                    <button
                      className="parent-home__recommendation-read-btn"
                      onClick={() => handleMarkRead(rec.id)}
                    >
                      <Check size={14} />
                      Прочитать
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {recommendations.length > 3 && (
              <button
                className="parent-home__show-all-btn"
                onClick={() => setShowAllRecommendations(!showAllRecommendations)}
              >
                {showAllRecommendations ? 'Свернуть' : `Показать все (${recommendations.length})`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Мои задания */}
      <div className="parent-home__section">
        <div className="parent-home__section-header">
          <ListTodo size={20} />
          <span>Мои задания</span>
        </div>
        {tests.length === 0 ? (
          <p className="parent-home__empty">Нет доступных заданий</p>
        ) : (
          <ul className="parent-home__tasks-list">
            {tests.map((test) => (
              <li key={test.id} className="parent-home__task">
                <span className="parent-home__task-title">{test.title}</span>
                {test.is_passed ? (
                  <span className="parent-home__task-done">Пройден</span>
                ) : (
                  <button
                    className="parent-home__task-btn"
                    onClick={() => handleTakeTest(test.id)}
                  >
                    <Play size={16} />
                    Пройти
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Выйти (внизу, как на макете) */}
      <div className="parent-home__logout">
        <button className="parent-home__logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );
}