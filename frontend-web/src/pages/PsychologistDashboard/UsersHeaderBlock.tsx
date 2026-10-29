import { UserPlus } from 'lucide-react';

interface UsersHeaderBlockProps {
    activeTab: 'mentors' | 'parents' | 'children';
    onTabChange: (tab: 'mentors' | 'parents' | 'children') => void;
    counts: { mentors: number; parents: number; children: number };
    onAddClick: () => void;
}

export default function UsersHeaderBlock({ activeTab, onTabChange, counts, onAddClick }: UsersHeaderBlockProps) {
    return (
        <>
            <div className="users-header">
                <h1 className="users-header__title">Пользователи</h1>
                <button className="users-header__add-btn" onClick={onAddClick}>
                    <UserPlus size={20} /> Добавить
                </button>
            </div>

            <div className="users-header__tabs">
                <button 
                    className={`users-header__tab ${activeTab === 'mentors' ? 'users-header__tab--active' : ''}`}
                    onClick={() => onTabChange('mentors')}
                >
                    Наставники ({counts.mentors})
                </button>
                <button 
                    className={`users-header__tab ${activeTab === 'parents' ? 'users-header__tab--active' : ''}`}
                    onClick={() => onTabChange('parents')}
                >
                    Родители ({counts.parents})
                </button>
                <button 
                    className={`users-header__tab ${activeTab === 'children' ? 'users-header__tab--active' : ''}`}
                    onClick={() => onTabChange('children')}
                >
                    Дети ({counts.children})
                </button>
            </div>
        </>
    );
}