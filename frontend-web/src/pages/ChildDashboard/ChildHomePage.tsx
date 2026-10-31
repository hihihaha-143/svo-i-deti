import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, BarChart3, Calendar, BookOpen, Heart,
  MessageCircle, ListTodo, Play, LogOut, Star,
  Smile, Meh, Frown,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import useToast from '../../hooks/useToast';
import mintTheme from '../../assets/themes/mint.png';
import oceanTheme from '../../assets/themes/ocean.png';
import duckTheme from '../../assets/themes/duck.png';
import spaceTheme from '../../assets/themes/space.png';
import '../../styles/pages/ChildDashboard/_child-home.scss';

interface Test {
  id: number;
  title: string;
  is_passed: boolean;
}

const THEMES = [
  { id: 'mint', image: mintTheme, label: 'Мятная' },
  { id: 'ocean', image: oceanTheme, label: 'Океан' },
  { id: 'duck', image: duckTheme, label: 'Утка' },
  { id: 'space', image: spaceTheme, label: 'Космос' },
];

const MOODS = [
  { id: 'good', label: 'Хорошо', Icon: Smile },
  { id: 'normal', label: 'Нормально', Icon: Meh },
  { id: 'bad', label: 'Грустно', Icon: Frown },
];

export default function ChildHomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tests, setTests] = useState<Test[]>([]);
  const [stars, setStars] = useState<number>(0);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>('mint');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, moodRes] = await Promise.all([
          apiClient.get('/child/tests'),
          apiClient.get('/child/mood/today'),
        ]);
        setTests(testsRes.data.data || []);
        setStars(testsRes.data.stars || 0);
        setSelectedMood(moodRes.data.data?.mood || null);
      } catch {
        showToast('Ошибка загрузки данных', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMoodSelect = async (mood: string) => {
    if (selectedMood) {
      showToast('Настроение уже отмечено сегодня', 'error');
      return;
    }
    try {
      await apiClient.post('/child/mood', { mood });
      setSelectedMood(mood);
      setStars((prev) => prev + 1);
      showToast('Настроение сохранено! +1 звезда', 'success');
    } catch {
      showToast('Ошибка сохранения настроения', 'error');
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const handleTakeTest = (testId: number) => {
    navigate(`/child/test/${testId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="child-home__loading">Загрузка...</div>;

  return (
    <div className="child-home">
      {/* Приветствие + звёзды */}
      <div className="child-home__greeting">
        <h1 className="child-home__greeting-text">
          Привет, {user?.name}!
        </h1>
        <div className="child-home__stars">
          <Star size={24} fill="currentColor" />
          <span className="child-home__stars-count">{stars} звёзд</span>
        </div>
      </div>

      {/* Меню */}
      <div className="child-home__menu">
        <button className="child-home__menu-btn" onClick={() => navigate('/child/achievements')}>
          <Trophy size={24} />
          <span>Достижения</span>
        </button>
        <button className="child-home__menu-btn" onClick={() => navigate('/child/stats')}>
          <BarChart3 size={24} />
          <span>Моя статистика</span>
        </button>
        <button className="child-home__menu-btn" onClick={() => navigate('/child/events')}>
          <Calendar size={24} />
          <span>Мои мероприятия</span>
        </button>
        <button className="child-home__menu-btn" onClick={() => navigate('/child/memo')}>
          <BookOpen size={24} />
          <span>Памятка</span>
        </button>
      </div>

      {/* Настроение */}
      <div className="child-home__section child-home__section--mood">
        <div className="child-home__section-title">
          <Heart size={20} />
          <span>Моё настроение</span>
        </div>
        <div className="child-home__moods">
          {MOODS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`child-home__mood-btn${selectedMood === id ? ' child-home__mood-btn--selected' : ''}`}
              onClick={() => handleMoodSelect(id)}
              disabled={!!selectedMood}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Обратиться за помощью */}
      <button className="child-home__help-btn" onClick={() => showToast('Чат появится позже', 'info')}>
        <MessageCircle size={20} />
        <span>Обратиться за помощью</span>
      </button>

      {/* Мои задания */}
      <div className="child-home__section">
        <div className="child-home__section-title">
          <ListTodo size={20} />
          <span>Мои задания</span>
        </div>
        {tests.length === 0 ? (
          <p className="child-home__empty">Нет доступных заданий</p>
        ) : (
          <ul className="child-home__tasks">
            {tests.map((test) => (
              <li key={test.id} className="child-home__task">
                <span className="child-home__task-title">{test.title}</span>
                {test.is_passed ? (
                  <span className="child-home__task-done">✓ Пройдено</span>
                ) : (
                  <button
                    className="child-home__task-btn"
                    onClick={() => handleTakeTest(test.id)}
                  >
                    <Play size={14} />
                    Пройти
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Выбери тему */}
      <div className="child-home__section child-home__section--themes">
        <div className="child-home__section-title">
          <span>Выбери тему</span>
        </div>
        <div className="child-home__themes">
          {THEMES.map(({ id, image, label }) => (
            <button
              key={id}
              className={`child-home__theme-btn${currentTheme === id ? ' child-home__theme-btn--active' : ''}`}
              onClick={() => handleThemeSelect(id)}
              title={label}
            >
              <img src={image} alt={label} className="child-home__theme-img" />
            </button>
          ))}
        </div>
      </div>

      {/* Выйти */}
      <button className="child-home__logout-btn" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Выйти</span>
      </button>
    </div>
  );
}