import { UserPlus, FileDown } from 'lucide-react';

interface UsersHeaderBlockProps {
    activeTab: 'mentors' | 'parents' | 'children';
    onTabChange: (tab: 'mentors' | 'parents' | 'children') => void;
    counts: { mentors: number; parents: number; children: number };
    onAddClick: () => void;
    onExport: (type: 'all' | 'mentors' | 'parents' | 'children') => void;
}

export default function UsersHeaderBlock({ activeTab, onTabChange, counts, onAddClick, onExport }: UsersHeaderBlockProps) {
    return (
        <>
            <div className="users-header">
               
                <div className="users-header__actions">
                    <div className="users-header__export">
                        <span className="users-header__export-label">
                            <FileDown size={16} /> Экспорт:
                        </span>
                        <button className="users-header__export-btn" onClick={() => onExport('all')}>Все</button>
                        <button className="users-header__export-btn" onClick={() => onExport('mentors')}>Наставники</button>
                        <button className="users-header__export-btn" onClick={() => onExport('parents')}>Родители</button>
                        <button className="users-header__export-btn" onClick={() => onExport('children')}>Дети</button>
                    </div>

                    <button className="users-header__add-btn" onClick={onAddClick}>
                        <UserPlus size={20} /> Добавить
                    </button>
                </div>
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