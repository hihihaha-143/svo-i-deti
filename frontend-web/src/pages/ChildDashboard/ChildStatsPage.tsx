import { useState, useEffect, ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, MessageCircle, AlertTriangle, ListTodo,
  Trophy, Paintbrush, Star, Smile, Meh, Frown, List, Flame, Clock,
  Zap, Heart, Shield, Palette, BookOpen, Users,
} from 'lucide-react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import Modal from '../../components/Modal/Modal';
import '../../styles/pages/ChildDashboard/_child-stats.scss';

interface Superpower {
  key: string;
  label: string;
  value: number;
  max: number;
}

interface StatsData {
  messages_sent: number;
  urgent_messages: number;
  tests_passed: number;
  achievements_earned: number;
  colorings: number;
  stars_total: number;
  moods: {
    good: number;
    normal: number;
    bad: number;
    total: number;
    streak: number;
    last_date: string | null;
  };
  superpowers: Superpower[];
}

interface NewAchievement {
  id: number;
  title: string;
  icon: string | null;
  stars_reward: number;
}

const SUPER_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  independence: Zap,
  emotional_sphere: Heart,
  responsibility: Shield,
  creativity: Palette,
  organization: BookOpen,
  sociability: MessageCircle,
  social_activity: Users,
  willpower: Flame,
};

export default function ChildStatsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/child/stats');
        setStats(res.data.data);
        if (res.data.newly_earned?.length > 0) {
          setNewAchievements(res.data.newly_earned);
        }
      } catch {
        showToast('Ошибка загрузки статистики', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="child-stats__loading">Загрузка...</div>;
  if (!stats) return <div className="child-stats__loading">Нет данных</div>;

  return (
    <div className="child-stats">
      <button className="child-stats__back" onClick={() => navigate('/child')}>
        <ArrowLeft size={16} />
        <span>Назад</span>
      </button>

      <h1 className="child-stats__title">
        <BarChart3 size={28} />
        Моя статистика
      </h1>

      {/* Основные счётчики */}
      <div className="child-stats__grid">
        <div className="child-stats__card">
          <MessageCircle size={24} />
          <p className="child-stats__value">{stats.messages_sent}</p>
          <p className="child-stats__label">Сообщений отправлено</p>
        </div>
        <div className="child-stats__card child-stats__card--warn">
          <AlertTriangle size={24} />
          <p className="child-stats__value">{stats.urgent_messages}</p>
          <p className="child-stats__label">Срочных сообщений</p>
        </div>
        <div className="child-stats__card">
          <ListTodo size={24} />
          <p className="child-stats__value">{stats.tests_passed}</p>
          <p className="child-stats__label">Тестов пройдено</p>
        </div>
        <div className="child-stats__card">
          <Trophy size={24} />
          <p className="child-stats__value">{stats.achievements_earned}</p>
          <p className="child-stats__label">Достижений получено</p>
        </div>
        <div className="child-stats__card">
          <Paintbrush size={24} />
          <p className="child-stats__value">{stats.colorings}</p>
          <p className="child-stats__label">Раскрасок раскрашено</p>
        </div>
        <div className="child-stats__card">
          <Star size={24} />
          <p className="child-stats__value">{stats.stars_total}</p>
          <p className="child-stats__label">Звёзд всего</p>
        </div>
      </div>

      {/* Настроение */}
      <h2 className="child-stats__subtitle">
        <Smile size={20} />
        Настроение
      </h2>

      <div className="child-stats__grid">
        <div className="child-stats__card">
          <Smile size={24} />
          <p className="child-stats__value">{stats.moods.good}</p>
          <p className="child-stats__label">Хорошее</p>
        </div>
        <div className="child-stats__card">
          <Meh size={24} />
          <p className="child-stats__value">{stats.moods.normal}</p>
          <p className="child-stats__label">Нормальное</p>
        </div>
        <div className="child-stats__card">
          <Frown size={24} />
          <p className="child-stats__value">{stats.moods.bad}</p>
          <p className="child-stats__label">Плохое</p>
        </div>
        <div className="child-stats__card">
          <List size={24} />
          <p className="child-stats__value">{stats.moods.total}</p>
          <p className="child-stats__label">Всего отметок</p>
        </div>
        <div className="child-stats__card">
          <Flame size={24} />
          <p className="child-stats__value">{stats.moods.streak}</p>
          <p className="child-stats__label">Дней подряд</p>
        </div>
        <div className="child-stats__card">
          <Clock size={24} />
          <p className="child-stats__value">
            {stats.moods.last_date
              ? new Date(stats.moods.last_date).toLocaleDateString('ru-RU')
              : '—'}
          </p>
          <p className="child-stats__label">Последняя отметка</p>
        </div>
      </div>

      {/* Суперсилы */}
      <h2 className="child-stats__subtitle">
        <Zap size={20} />
        Мои суперсилы
      </h2>

      <div className="child-stats__superpowers">
        {stats.superpowers.map((sp) => {
          const Icon = SUPER_ICONS[sp.key] || Zap;
          const percent = (sp.value / sp.max) * 100;
          return (
            <div key={sp.key} className="child-stats__superpower">
              <div className="child-stats__superpower-header">
                <span className="child-stats__superpower-label">
                  <Icon size={18} />
                  {sp.label}
                </span>
                <span className="child-stats__superpower-value">
                  {sp.value}/{sp.max}
                </span>
              </div>
              <div className="child-stats__superpower-bar">
                <div
                  className="child-stats__superpower-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={newAchievements.length > 0}
        onClose={() => setNewAchievements([])}
        title="Новое достижение!"
      >
        <div className="child-stats__achievement-modal">
          {newAchievements.map((ach) => (
            <div key={ach.id} className="child-stats__achievement-item">
              <p className="child-stats__achievement-title">{ach.title}</p>
            </div>
          ))}
          <button
            className="child-stats__achievement-btn"
            onClick={() => setNewAchievements([])}
          >
            Отлично!
          </button>
        </div>
      </Modal>
    </div>
  );
}