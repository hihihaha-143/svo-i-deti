import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useSearchParams } from 'react-router-dom';
import { Menu, Smile } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatsCardsBlock from './StatsCardsBlock';
import OnlineCardsBlock from './OnlineCardsBlock';
import UsersPage from './UsersPage';
import LoginLogsPage from '../LoginLogsPage/LoginLogsPage';
import MoodPage from '../MoodPage/MoodPage';
import DiaryPage from '../DiaryPage/DiaryPage';
import EventPage from '../EventPage/EventPage';
import EventAttendancePage from '../EventPage/EventAttendancePage';
import ChatTemplatesPage from '../ChatTemplatesPage/ChatTemplatesPage';
import ParentMaterialsPage from '../ParentMaterialsPage/ParentMaterialsPage';
import DailyTipsPage from '../DailyTipsPage/DailyTipsPage';
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

type PageKey = 'dashboard' | 'users' | 'login-logs' | 'moods' | 'diaries' | 'events' | 'event-attendance' | 'chat-templates' | 'parent-materials' | 'daily-tips';

const STORAGE_KEY = 'psychologist_current_page';
const VALID_PAGES: PageKey[] = [
    'dashboard', 'users', 'login-logs', 'moods', 'diaries', 'events', 'event-attendance', 'chat-templates', 'parent-materials', 'daily-tips',
];

function isValidPage(value: string | null): value is PageKey {
    return value !== null && (VALID_PAGES as string[]).includes(value);
}

export default function PsychologistDashboard() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState<DashboardData | null>(null);
    const [activeEventId, setActiveEventId] = useState<number | null>(null);

    const initialPage = (() => {
        const fromUrl = searchParams.get('page');
        if (isValidPage(fromUrl)) return fromUrl;

        const fromStorage = localStorage.getItem(STORAGE_KEY);
        if (isValidPage(fromStorage)) return fromStorage;

        return 'dashboard';
    })();

    const initialEventId = (() => {
        const fromUrl = searchParams.get('event_id');
        if (fromUrl && !isNaN(Number(fromUrl))) return Number(fromUrl);
        return null;
    })();

    const [currentPage, setCurrentPage] = useState<PageKey>(initialPage);

    useEffect(() => {
        if (initialEventId !== null) {
            setActiveEventId(initialEventId);
        }
    }, []);

    useEffect(() => {
        const params: Record<string, string> = { page: currentPage };
        if (currentPage === 'event-attendance' && activeEventId !== null) {
            params.event_id = String(activeEventId);
        }

        const currentPageParam = searchParams.get('page');
        const currentEventParam = searchParams.get('event_id');

        if (
            currentPageParam !== params.page ||
            currentEventParam !== (params.event_id ?? null)
        ) {
            setSearchParams(params, { replace: true });
        }

        if (currentPage !== 'event-attendance') {
            localStorage.setItem(STORAGE_KEY, currentPage);
        }
    }, [currentPage, activeEventId, searchParams, setSearchParams]);

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

    const handleOpenAttendance = (eventId: number) => {
        setActiveEventId(eventId);
        setCurrentPage('event-attendance');
    };

    const handleBackFromAttendance = () => {
        setActiveEventId(null);
        setCurrentPage('events');
    };

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
        moods: 'Настроения детей',
        diaries: 'Дневники родителей',
        events: 'Мероприятия',
        'event-attendance': 'Посещаемость мероприятия',
        'chat-templates': 'Чат-шаблоны для быстрых ответов',
        'parent-materials': 'Управление материалами',
        'daily-tips': 'Управление ежедневными советами',
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

        if (currentPage === 'login-logs') {
            return <LoginLogsPage />;
        }

        if (currentPage === 'moods') {
            return <MoodPage />;
        }

        if (currentPage === 'diaries') {
            return <DiaryPage />;
        }

        if (currentPage === 'events') {
            return <EventPage onOpenAttendance={handleOpenAttendance} />;
        }

        if (currentPage === 'event-attendance' && activeEventId !== null) {
            return (
                <EventAttendancePage
                    eventId={activeEventId}
                    onBack={handleBackFromAttendance}
                />
            );
        }

        if (currentPage === 'chat-templates') {
            return <ChatTemplatesPage />;
        }

        if (currentPage === 'parent-materials') {
            return <ParentMaterialsPage />;
        }

        if (currentPage === 'daily-tips') {
            return <DailyTipsPage />;
        }

        return null;
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