import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Star } from 'lucide-react';
import '../../styles/pages/ChildDashboard/_child-dashboard.scss';

const pageTitles: Record<string, string> = {
  '/child': '',
  '/child/achievements': '',
  '/child/stats': '',
  '/child/events': '',
  '/child/memo': '',
};

export default function ChildDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/child';
  const title = pageTitles[location.pathname] || '';

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