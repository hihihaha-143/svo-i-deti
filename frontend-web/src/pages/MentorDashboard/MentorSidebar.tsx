import {
    LayoutDashboard, Baby, Smile, CalendarDays,
    MessageCircle, MessageSquareReply, ListChecks, LogOut, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export type MentorPageKey =
    | 'dashboard'
    | 'children'
    | 'moods'
    | 'events'
    | 'chat'
    | 'child-answers'
    | 'test-results';

interface MentorSidebarProps {
    onClose?: () => void;
    onNavigate?: (page: MentorPageKey) => void;
    currentPage?: string;
}

export default function MentorSidebar({ onClose, onNavigate, currentPage }: MentorSidebarProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${onClose ? 'sidebar--mobile' : ''}`}>
            <div className="sidebar__header">
                <h2 className="sidebar__title">Кабинет наставника</h2>
                {onClose && (
                    <button className="sidebar__close" onClick={onClose}>
                        <X size={24} />
                    </button>
                )}
            </div>

            <nav className="sidebar__nav">
                <div className="sidebar__group">
                    <span className="sidebar__group-title">Основное</span>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'dashboard' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('dashboard'); onClose?.(); }}
                    >
                        <LayoutDashboard size={20} /> Главная
                    </a>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'children' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('children'); onClose?.(); }}
                    >
                        <Baby size={20} /> Мои дети
                    </a>
                </div>

                <div className="sidebar__group">
                    <span className="sidebar__group-title">Дети</span>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'moods' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('moods'); onClose?.(); }}
                    >
                        <Smile size={20} /> Настроения детей
                    </a>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'events' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('events'); onClose?.(); }}
                    >
                        <CalendarDays size={20} /> Мероприятия
                    </a>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'child-answers' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('child-answers'); onClose?.(); }}
                    >
                        <MessageSquareReply size={20} /> Ответы детей
                    </a>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'test-results' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('test-results'); onClose?.(); }}
                    >
                        <ListChecks size={20} /> Результаты тестов
                    </a>
                </div>

                <div className="sidebar__group">
                    <span className="sidebar__group-title">Коммуникация</span>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'chat' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('chat'); onClose?.(); }}
                    >
                        <MessageCircle size={20} /> Чат
                    </a>
                </div>
            </nav>

            <div className="sidebar__footer">
                <button onClick={handleLogout} className="sidebar__link sidebar__link--logout">
                    <LogOut size={20} /> Выйти
                </button>
            </div>
        </aside>
    );
}