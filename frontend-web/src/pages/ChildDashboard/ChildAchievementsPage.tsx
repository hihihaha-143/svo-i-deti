import { useState, useEffect, ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trophy, Star, Lock,
  Palette, MessageCircle, Shield, Rainbow, Flame, Star as StarIcon,
  Crown, Pencil, Search, BookOpen, GraduationCap, Brain, Zap,
  Landmark, Gem, Brush, Image, Award, Target, HatGlasses, Calendar, Smile, Meh, Frown,
} from 'lucide-react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import Modal from '../../components/Modal/Modal';
import '../../styles/pages/ChildDashboard/_child-achievements.scss';

interface Achievement {
  id: number;
  code: string;
  title: string;
  icon: string | null;
  description: string | null;
  stars_reward: number;
  is_hidden: boolean;
  is_earned: boolean;
}

interface NewAchievement {
  id: number;
  title: string;
  icon: string | null;
  stars_reward: number;
}

const ICON_MAP: Record<string, ComponentType<{ size?: number }>> = {
  palette: Palette,
  message: MessageCircle,
  shield: Shield,
  rainbow: Rainbow,
  flame: Flame,
  star: StarIcon,
  crown: Crown,
  pencil: Pencil,
  search: Search,
  book: BookOpen,
  graduation: GraduationCap,
  brain: Brain,
  zap: Zap,
  bank: Landmark,
  diamond: Gem,
  brush: Brush,
  image: Image,
  trophy: Trophy,
  hat: HatGlasses,
  calendar: Calendar,
  smile: Smile,
  meh: Meh,
  frown: Frown,
  award: Award,
  target: Target,
};

export default function ChildAchievementsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedCount, setEarnedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [newlyEarned, setNewlyEarned] = useState<NewAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/child/achievements');
        setAchievements(res.data.data || []);
        setEarnedCount(res.data.earned_count || 0);
        setTotalCount(res.data.total_count || 0);
        setNewlyEarned(res.data.newly_earned || []);
      } catch {
        showToast('Ошибка загрузки достижений', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="child-achievements__loading">Загрузка...</div>;

  return (
    <div className="child-achievements">
      <button className="child-achievements__back" onClick={() => navigate('/child')}>
        <ArrowLeft size={16} />
        <span>Назад</span>
      </button>

      <h1 className="child-achievements__title">
        <Trophy size={28} />
        Мои достижения
      </h1>

      <p className="child-achievements__counter">
        <Star size={16} fill="currentColor" />
        Получено: {earnedCount} из {totalCount}
      </p>

      <div className="child-achievements__grid">
        {achievements.map((ach) => {
          const Icon = (ach.icon && ICON_MAP[ach.icon]) || Trophy;
          return (
            <div
              key={ach.id}
              className={`child-achievements__card${ach.is_earned ? ' child-achievements__card--earned' : ''}`}
              title={ach.description || ach.title}
            >
              {!ach.is_earned && (
                <div className="child-achievements__lock">
                  <Lock size={16} />
                </div>
              )}
              <div className="child-achievements__icon">
                <Icon size={32} />
              </div>
              <p className="child-achievements__card-title">
                {ach.title}
              </p>
              {ach.stars_reward > 0 && (
                <p className="child-achievements__stars">
                  <Star size={12} fill="currentColor" /> +{ach.stars_reward}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={newlyEarned.length > 0}
        onClose={() => setNewlyEarned([])}
        title="Новое достижение!"
      >
        <div className="child-achievements__modal">
          {newlyEarned.map((ach) => {
            const Icon = (ach.icon && ICON_MAP[ach.icon]) || Trophy;
            return (
              <div key={ach.id} className="child-achievements__modal-item">
                <div className="child-achievements__modal-icon">
                  <Icon size={48} />
                </div>
                <p className="child-achievements__modal-title">{ach.title}</p>
                {ach.stars_reward > 0 && (
                  <p className="child-achievements__modal-stars">
                    <Star size={16} fill="currentColor" /> +{ach.stars_reward} звёзд
                  </p>
                )}
              </div>
            );
          })}
          <button
            className="child-achievements__modal-btn"
            onClick={() => setNewlyEarned([])}
          >
            Отлично!
          </button>
        </div>
      </Modal>
    </div>
  );
}