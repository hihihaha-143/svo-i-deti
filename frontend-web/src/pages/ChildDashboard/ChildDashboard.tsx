import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/ChildDashboard/_child-dashboard.scss';

const pageTitles: Record<string, string> = {
  '/child': '',
  '/child/achievements': 'Мои достижения',
  '/child/stats': 'Моя статистика',
  '/child/events': 'Мои мероприятия',
  '/child/memo': 'Памятка',
};

const THEME_STORAGE_KEY = 'child_theme';

export default function ChildDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/child';
  const title = pageTitles[location.pathname] || '';

  // Применяем сохранённую тему при входе в кабинет ребёнка
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  return (
    <div className="child-dashboard">
      {!isHome && title && (
        <header className="child-dashboard__header">
          <h1 className="child-dashboard__title">{title}</h1>
        </header>
      )}
      <main className="child-dashboard__main">
        <Outlet />
      </main>
    </div>
  );
}