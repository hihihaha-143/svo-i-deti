import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/ChildDashboard/_child-dashboard.scss';

const pageTitles: Record<string, string> = {
  '/child': '',
  '/child/achievements': 'Мои достижения',
  '/child/stats': 'Моя статистика',
  '/child/events': 'Мои мероприятия',
  '/child/memo': 'Памятка',
  '/child/chat': 'Чат',
};

const THEME_STORAGE_KEY = 'child_theme';

export default function ChildDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/child';
  const title = pageTitles[location.pathname] || '';

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
          {location.pathname !== '/child/chat' && (
             <button 
               type="button" 
               className="child-dashboard__back-btn" 
               onClick={() => navigate(-1)}
             >
               <ArrowLeft size={24} />
             </button>
          )}
          {location.pathname === '/child/chat' && (
             <button 
               type="button" 
               className="child-dashboard__back-btn" 
               onClick={() => navigate('/child')}
             >
               <ArrowLeft size={24} />
             </button>
          )}
          <h1 className="child-dashboard__title">{title}</h1>
        </header>
      )}
      <main className="child-dashboard__main">
        <Outlet />
      </main>
    </div>
  );
}