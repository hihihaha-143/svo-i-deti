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
import Modal from '../../components/Modal/Modal';
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

interface NewAchievement {
  id: number;
  title: string;
  icon: string | null;
  stars_reward: number;
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
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [starEarnedToday, setStarEarnedToday] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<string>('mint');
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([]);
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
        setTodayMood(moodRes.data.data?.mood || null);
        setStarEarnedToday(moodRes.data.data?.star_earned || false);
      } catch {
        showToast('Ошибка загрузки данных', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMoodSelect = async (mood: string) => {
    try {
      const res = await apiClient.post('/child/mood', { mood });
      setTodayMood(mood);
      setStars(res.data.stars);
      if (res.data.star_earned) {
        setStarEarnedToday(true);
        showToast('Настроение сохранено! +1 звезда', 'success');
      } else {
        showToast('Настроение обновлено', 'success');
      }
    } catch {
      showToast('Ошибка сохранения настроения', 'error');
    }
  };

  const handleThemeSelect = async (themeId: string) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);

    try {
      const res = await apiClient.post('/child/theme', { theme: themeId });
      setStars(res.data.stars);
      if (res.data.newly_earned?.length > 0) {
        setNewAchievements(res.data.newly_earned);
      }
    } catch {
      // тихо игнорируем
    }
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
      <div className="child-home__greeting">
        <h1 className="child-home__greeting-text">
          Привет, {user?.name}!
        </h1>
        <div className="child-home__stars">
          <Star size={24} fill="currentColor" />
          <span className="child-home__stars-count">{stars} звёзд</span>
        </div>
      </div>

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

      <div className="child-home__section child-home__section--mood">
        <div className="child-home__section-title">
          <Heart size={20} />
          <span>Моё настроение</span>
        </div>
        <div className="child-home__moods">
          {MOODS.map(({ id, label, Icon }) => {
            const isSelected = todayMood === id;
            return (
              <button
                key={id}
                className={`child-home__mood-btn${isSelected ? ' child-home__mood-btn--selected' : ''}`}
                onClick={() => handleMoodSelect(id)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
        {starEarnedToday && (
          <p className="child-home__mood-note">
            Звезда за настроение сегодня уже получена
          </p>
        )}
      </div>

      <button className="child-home__help-btn" onClick={() => showToast('Чат появится позже', 'info')}>
        <MessageCircle size={20} />
        <span>Обратиться за помощью</span>
      </button>

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

      <button className="child-home__logout-btn" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Выйти</span>
      </button>

      <Modal
        isOpen={newAchievements.length > 0}
        onClose={() => setNewAchievements([])}
        title="Новое достижение!"
      >
        <div className="child-home__achievement-modal">
          {newAchievements.map((ach) => (
            <div key={ach.id} className="child-home__achievement-item">
              <p className="child-home__achievement-title">{ach.title}</p>
              {ach.stars_reward > 0 && (
                <p className="child-home__achievement-stars">
                  <Star size={16} fill="currentColor" /> +{ach.stars_reward} звёзд
                </p>
              )}
            </div>
          ))}
          <button
            className="child-home__achievement-btn"
            onClick={() => setNewAchievements([])}
          >
            Отлично!
          </button>
        </div>
      </Modal>
    </div>
  );
}