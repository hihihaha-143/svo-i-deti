import { Pencil, Key, Trash2 } from 'lucide-react';

interface UserData {
    id: number;
    number: string;
    name: string;
    login: string;
    organization?: string;
    mentor_name?: string;
    parent_name?: string;
}

interface UsersTableBlockProps {
    activeTab: 'mentors' | 'parents' | 'children';
    data: UserData[];
    isLoading: boolean;
    onEdit: (user: UserData) => void;
    onRememberPassword: (user: UserData) => void;
    onDelete: (user: UserData) => void;
}

export default function UsersTableBlock({ activeTab, data, isLoading, onEdit, onRememberPassword, onDelete }: UsersTableBlockProps) {
    if (isLoading) {
        return <div className="users-table__loading">Загрузка...</div>;
    }

    return (
        <div className="users-table">
            <table className="users-table__table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Номер</th>
                        <th>Имя</th>
                        <th>Логин</th>
                        {activeTab === 'mentors' && <th>Организация</th>}
                        {(activeTab === 'parents' || activeTab === 'children') && <th>Наставник</th>}
                        {activeTab === 'children' && <th>Родитель</th>}
                        <th className="users-table__actions-header">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map(user => (
                            <tr key={user.id}>
                                <td data-label="ID" className="users-table__id">{user.id}</td>
                                <td data-label="Номер" className="users-table__number">{user.number}</td>
                                <td data-label="Имя">{user.name}</td>
                                <td data-label="Логин">{user.login}</td>
                                {activeTab === 'mentors' && <td data-label="Организация">{user.organization}</td>}
                                {(activeTab === 'parents' || activeTab === 'children') && <td data-label="Наставник">{user.mentor_name}</td>}
                                {activeTab === 'children' && <td data-label="Родитель">{user.parent_name}</td>}
                                <td className="users-table__actions">
                                    <button className="users-table__action-btn users-table__action-btn--edit" onClick={() => onEdit(user)} title="Редактировать">
                                        <Pencil size={18} />
                                    </button>
                                    <button className="users-table__action-btn users-table__action-btn--key" onClick={() => onRememberPassword(user)} title="Сгенерировать новый пароль">
                                        <Key size={18} />
                                    </button>
                                    <button className="users-table__action-btn users-table__action-btn--delete" onClick={() => onDelete(user)} title="Удалить">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} className="users-table__empty">Нет данных</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}