import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/ParentDashboard/ParentDashboard.scss';

const pageTitles: Record<string, string> = {
  '/parent': 'Главная',
  '/parent/diary': 'Дневник наблюдений',
  '/parent/library': 'Библиотека знаний',
  '/parent/chat': 'Чат с психологом',
};

export default function ParentDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || 'Кабинет родителя';

  return (
    <div className="parent-dashboard">
      <header className="parent-dashboard__header">
        <h1 className="parent-dashboard__title">{currentTitle}</h1>
        <div className="parent-dashboard__user-info">
          <span className="parent-dashboard__user-name">{user?.name}</span>
        </div>
      </header>
      <main className="parent-dashboard__main">
        <Outlet />
      </main>
    </div>
  );
}