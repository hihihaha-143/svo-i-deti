import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useSearchParams } from 'react-router-dom';
import { Menu, Smile } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatsCardsBlock from './StatsCardsBlock';
import OnlineCardsBlock from './OnlineCardsBlock';
import UsersPage from './UsersPage';
import LoginLogsPage from '../LoginLogsPage/LoginLogsPage';
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

type PageKey = 'dashboard' | 'users' | 'login-logs';

const STORAGE_KEY = 'psychologist_current_page';
const VALID_PAGES: PageKey[] = ['dashboard', 'users', 'login-logs'];

function isValidPage(value: string | null): value is PageKey {
    return value !== null && (VALID_PAGES as string[]).includes(value);
}

export default function PsychologistDashboard() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState<DashboardData | null>(null);

    // Определяем стартовую страницу: URL → localStorage → dashboard
    const initialPage = (() => {
        const fromUrl = searchParams.get('page');
        if (isValidPage(fromUrl)) return fromUrl;

        const fromStorage = localStorage.getItem(STORAGE_KEY);
        if (isValidPage(fromStorage)) return fromStorage;

        return 'dashboard';
    })();

    const [currentPage, setCurrentPage] = useState<PageKey>(initialPage);

    // Синхронизация с URL и localStorage при смене страницы
    useEffect(() => {
        if (searchParams.get('page') !== currentPage) {
            setSearchParams({ page: currentPage }, { replace: true });
        }
        localStorage.setItem(STORAGE_KEY, currentPage);
    }, [currentPage, searchParams, setSearchParams]);

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

    const pageTitles: Record<PageKey, string> = {
        dashboard: 'Главная',
        users: 'Пользователи',
        'login-logs': 'Мониторинг входов',
    };

    const renderPage = () => {
        if (currentPage === 'dashboard') {
            return (
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
            );
        }

        if (currentPage === 'users') {
            return <UsersPage />;
        }

        return <LoginLogsPage />;
    };

    return (
        <div className="dashboard-layout" {...swipeHandlers}>
            {isSidebarOpen && (
                <div className="dashboard-layout__overlay" onClick={closeSidebar} />
            )}

            <div className={`dashboard-layout__sidebar-wrapper ${isSidebarOpen ? 'dashboard-layout__sidebar-wrapper--open' : ''}`}>
                <Sidebar onClose={closeSidebar} onNavigate={(page) => setCurrentPage(page)} currentPage={currentPage} />
            </div>

            <main className="dashboard-content">
                <header className="dashboard-content__header">
                    <button className="dashboard-content__burger" onClick={toggleSidebar}>
                        <Menu size={28} />
                    </button>
                    <h1>{pageTitles[currentPage]}</h1>
                    <div className="dashboard-content__user">
                        {user?.name}
                    </div>
                </header>

                <div className="dashboard-content__body">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
}