import { FC, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';
import { echo } from '../../lib/echo';
import { useAuth } from '../../contexts/AuthContext';

interface UrgentBadgeProps {
  onClick?: () => void;
}

const UrgentBadge: FC<UrgentBadgeProps> = ({ onClick }) => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'psychologist') return;

    const fetchCount = async () => {
      try {
        const res = await apiClient.get<{ count: number }>('/urgent-notifications/count');
        setCount(res.data.count);
      } catch {
        // молча
      }
    };

    fetchCount();

    const channel = echo.private(`user.${user.id}`);
    channel.listen('.UrgentNotificationCreated', () => {
      setCount((prev) => prev + 1);
    });

    return () => {
      echo.leave(`user.${user.id}`);
    };
  }, [user]);

  if (count === 0) return null;

  return (
    <button
      type="button"
      className="urgent-badge"
      onClick={onClick}
      aria-label={`Срочные сообщения: ${count}`}
    >
      <AlertCircle size={18} />
      <span>Срочные: {count}</span>
    </button>
  );
};

export default UrgentBadge;