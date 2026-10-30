import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useSearchParams } from 'react-router-dom';
import { Menu, Smile } from 'lucide-react';
import MentorSidebar, { type MentorPageKey } from './MentorSidebar';
import MentorStatsCardsBlock from './MentorStatsCardsBlock';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';

interface DashboardData {
    children: number;
    online_children: number;
    mood_entries_week: number;
    events: number;
}

const STORAGE_KEY = 'mentor_current_page';
const VALID_PAGES: MentorPageKey[] = [
    'dashboard', 'children', 'moods', 'events', 'chat', 'child-answers', 'test-results',
];

function isValidPage(value: string | null): value is MentorPageKey {
    return value !== null && (VALID_PAGES as string[]).includes(value);
}

function PageStub({ title }: { title: string }) {
    return (
        <div className="dashboard-welcome">
            <h2 className="dashboard-welcome__title">
                <Smile size={28} /> {title}
            </h2>
            <p className="dashboard-welcome__subtitle">
                Раздел в разработке
            </p>
        </div>
    );
}

export default function MentorDashboard() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState<DashboardData | null>(null);

    const initialPage = (() => {
        const fromUrl = searchParams.get('page');
        if (isValidPage(fromUrl)) return fromUrl;

        const fromStorage = localStorage.getItem(STORAGE_KEY);
        if (isValidPage(fromStorage)) return fromStorage;

        return 'dashboard';
    })();

    const [currentPage, setCurrentPage] = useState<MentorPageKey>(initialPage);

    useEffect(() => {
        const params: Record<string, string> = { page: currentPage };

        const currentPageParam = searchParams.get('page');

        if (currentPageParam !== params.page) {
            setSearchParams(params, { replace: true });
        }

        localStorage.setItem(STORAGE_KEY, currentPage);
    }, [currentPage, searchParams, setSearchParams]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/mentor/dashboard');
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

    const pageTitles: Record<MentorPageKey, string> = {
        dashboard: 'Главная',
        children: 'Мои дети',
        moods: 'Настроения детей',
        events: 'Мероприятия',
        chat: 'Чат',
        'child-answers': 'Ответы детей',
        'test-results': 'Результаты тестов',
    };

    const renderPage = () => {
        if (currentPage === 'dashboard') {
            return (
                <>
                    <div className="dashboard-welcome">
                        <h2 className="dashboard-welcome__title">
                            <Smile size={28} /> Добро пожаловать в кабинет наставника
                        </h2>
                        <p className="dashboard-welcome__subtitle">
                            Здесь вы видите, что делают ваши дети
                        </p>
                    </div>

                    {stats ? (
                        <MentorStatsCardsBlock data={stats} />
                    ) : (
                        <div>Загрузка статистики...</div>
                    )}
                </>
            );
        }

        if (currentPage === 'children') {
            return <PageStub title="Мои дети" />;
        }

        if (currentPage === 'moods') {
            return <PageStub title="Настроения детей" />;
        }

        if (currentPage === 'events') {
            return <PageStub title="Мероприятия" />;
        }

        if (currentPage === 'chat') {
            return <PageStub title="Чат" />;
        }

        if (currentPage === 'child-answers') {
            return <PageStub title="Ответы детей" />;
        }

        if (currentPage === 'test-results') {
            return <PageStub title="Результаты тестов" />;
        }

        return null;
    };

    return (
        <div className="dashboard-layout" {...swipeHandlers}>
            {isSidebarOpen && (
                <div className="dashboard-layout__overlay" onClick={closeSidebar} />
            )}

            <div className={`dashboard-layout__sidebar-wrapper ${isSidebarOpen ? 'dashboard-layout__sidebar-wrapper--open' : ''}`}>
                <MentorSidebar onClose={closeSidebar} onNavigate={(page) => setCurrentPage(page)} currentPage={currentPage} />
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