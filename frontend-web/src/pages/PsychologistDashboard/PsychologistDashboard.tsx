import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Menu, Smile } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatsCardsBlock from './StatsCardsBlock';
import OnlineCardsBlock from './OnlineCardsBlock';
import UsersPage from './UsersPage';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';

interface DashboardData {
    children: number;
    parents: number;
    mentors: number;
    anketas: number;
    messages: number;
    online_total: number;
    online_children: number;
    online_parents: number;
    online_mentors: number;
}

export default function PsychologistDashboard() {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState<DashboardData | null>(null);
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'users'>('dashboard');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/psychologist/dashboard');
                setStats(response.data.data);
            } catch (error) {
                console.error('Ошибка при загрузке статистики:', error);
            }
        };
        fetchStats();
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const swipeHandlers = useSwipeable({
        onSwipedRight: (eventData) => {
            if (eventData.initial[0] < 50 && !isSidebarOpen) setIsSidebarOpen(true);
        },
        onSwipedLeft: () => {
            if (isSidebarOpen) setIsSidebarOpen(false);
        },
        delta: 50,
        preventScrollOnSwipe: false,
        trackMouse: false,
    });

    return (
        <div className="dashboard-layout" {...swipeHandlers}>
            {isSidebarOpen && (
                <div className="dashboard-layout__overlay" onClick={closeSidebar} />
            )}

            <div className={`dashboard-layout__sidebar-wrapper ${isSidebarOpen ? 'dashboard-layout__sidebar-wrapper--open' : ''}`}>
                {/* Передаем в Sidebar функцию смены страницы через контекст или пропсы (сейчас временно через пропс) */}
                <Sidebar onClose={closeSidebar} onNavigate={(page) => setCurrentPage(page)} currentPage={currentPage} />
            </div>

            <main className="dashboard-content">
                <header className="dashboard-content__header">
                    <button className="dashboard-content__burger" onClick={toggleSidebar}>
                        <Menu size={28} />
                    </button>
                    <h1>{currentPage === 'dashboard' ? 'Главная' : 'Пользователи'}</h1>
                    <div className="dashboard-content__user">
                        {user?.name}
                    </div>
                </header>
                
                <div className="dashboard-content__body">
                    {currentPage === 'dashboard' ? (
                        <>
                            <div className="dashboard-welcome">
                                <h2 className="dashboard-welcome__title">
                                    <Smile size={28} /> Добро пожаловать в Ваш личный кабинет
                                </h2>
                                <p className="dashboard-welcome__subtitle">
                                    Здесь вы видите, что делают дети и родители
                                </p>
                            </div>

                            {stats ? (
                                <>
                                    <StatsCardsBlock data={stats} />
                                    <OnlineCardsBlock data={stats} />
                                </>
                            ) : (
                                <div>Загрузка статистики...</div>
                            )}
                        </>
                    ) : (
                        <UsersPage />
                    )}
                </div>
            </main>
        </div>
    );
}