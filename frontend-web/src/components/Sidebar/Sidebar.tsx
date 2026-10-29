import {
    LayoutDashboard, Users, DoorOpen, FileText, Smile, BookOpen,
    MessageSquareReply, CalendarDays, Clock, MessageCircle,
    MessageSquareDashed, FolderOpen, Lightbulb, FileHeart, Puzzle, ListChecks, LogOut, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type PageKey = 'dashboard' | 'users' | 'login-logs' | 'moods' | 'diaries' | 'events' | 'event-attendance' | 'chat-templates' | 'parent-materials' | 'daily-tips';

interface SidebarProps {
    onClose?: () => void;
    onNavigate?: (page: PageKey) => void;
    currentPage?: string;
}

export default function Sidebar({ onClose, onNavigate, currentPage }: SidebarProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${onClose ? 'sidebar--mobile' : ''}`}>
            <div className="sidebar__header">
                <h2 className="sidebar__title">Ваш личный кабинет</h2>
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
                        className={`sidebar__link ${currentPage === 'users' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('users'); onClose?.(); }}
                    >
                        <Users size={20} /> Пользователи
                    </a>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'login-logs' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('login-logs'); onClose?.(); }}
                    >
                        <DoorOpen size={20} /> Мониторинг входов
                    </a>
                    <a href="#" className="sidebar__link">
                        <FileText size={20} /> Отчётность
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
                        className={`sidebar__link ${currentPage === 'diaries' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('diaries'); onClose?.(); }}
                    >
                        <BookOpen size={20} /> Дневники родителей
                    </a>
                    <a href="#" className="sidebar__link">
                        <MessageSquareReply size={20} /> Ответы детей
                    </a>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'events' || currentPage === 'event-attendance' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('events'); onClose?.(); }}
                    >
                        <CalendarDays size={20} /> Мероприятия
                    </a>
                </div>

                <div className="sidebar__group">
                    <span className="sidebar__group-title">Уведомления</span>
                    <a href="#" className="sidebar__link">
                        <Clock size={20} /> По расписанию
                    </a>
                </div>

                <div className="sidebar__group">
                    <span className="sidebar__group-title">Коммуникация</span>
                    <a href="#" className="sidebar__link">
                        <MessageCircle size={20} /> Чат
                    </a>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'chat-templates' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('chat-templates'); onClose?.(); }}
                    >
                        <MessageSquareDashed size={20} /> Чат-шаблоны
                    </a>
                </div>

                <div className="sidebar__group">
                    <span className="sidebar__group-title">Контент</span>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'parent-materials' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('parent-materials'); onClose?.(); }}
                    >
                        <FolderOpen size={20} /> Материалы для родителей
                    </a>
                    <a
                        href="#"
                        className={`sidebar__link ${currentPage === 'daily-tips' ? 'sidebar__link--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); onNavigate?.('daily-tips'); onClose?.(); }}
                    >
                        <Lightbulb size={20} /> Ежедневные советы
                    </a>
                    <a href="#" className="sidebar__link">
                        <FileHeart size={20} /> Рекомендации родителям
                    </a>
                </div>

                <div className="sidebar__group">
                    <span className="sidebar__group-title">Тесты</span>
                    <a href="#" className="sidebar__link">
                        <Puzzle size={20} /> Список тестов
                    </a>
                    <a href="#" className="sidebar__link">
                        <ListChecks size={20} /> Результаты тестов
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