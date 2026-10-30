import { Key } from 'lucide-react';

export interface MentorChildData {
    id: number;
    name: string;
    login: string;
    parent_name: string | null;
}

interface MentorChildrenTableBlockProps {
    data: MentorChildData[];
    isLoading: boolean;
    onResetPassword: (child: MentorChildData) => void;
}

export default function MentorChildrenTableBlock({ data, isLoading, onResetPassword }: MentorChildrenTableBlockProps) {
    if (isLoading) {
        return <div className="users-table__loading">Загрузка...</div>;
    }

    return (
        <div className="users-table">
            <table className="users-table__table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Логин</th>
                        <th>Родитель</th>
                        <th className="users-table__actions-header">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map(child => (
                            <tr key={child.id}>
                                <td data-label="ID" className="users-table__id">{child.id}</td>
                                <td data-label="Имя">{child.name}</td>
                                <td data-label="Логин">{child.login}</td>
                                <td data-label="Родитель">{child.parent_name ?? '—'}</td>
                                <td className="users-table__actions">
                                    <button
                                        className="users-table__action-btn users-table__action-btn--key"
                                        onClick={() => onResetPassword(child)}
                                        title="Сгенерировать новый пароль"
                                    >
                                        <Key size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="users-table__empty">Нет данных</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}