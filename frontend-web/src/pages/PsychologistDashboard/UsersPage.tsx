import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import UsersHeaderBlock from './UsersHeaderBlock';
import UsersFilterBlock from './UsersFilterBlock';
import UsersTableBlock from './UsersTableBlock';
import UserForm from './UserForm';
import Modal from '../../components/Modal/Modal';
import PasswordModal from '../../components/PasswordModal/PasswordModal';

interface UserData {
    id: number;
    number: string;
    name: string;
    login: string;
    organization?: string;
    mentor_name?: string;
    parent_name?: string;
    mentor_id?: number;
    parent_id?: number;
}

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState<'mentors' | 'parents' | 'children'>('mentors');
    const [data, setData] = useState<{ mentors: UserData[], parents: UserData[], children: UserData[] }>({
        mentors: [], parents: [], children: [],
    });
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [passwordUserName, setPasswordUserName] = useState('');

    const getRoleString = (tab: string) => {
        if (tab === 'mentors') return 'mentor';
        if (tab === 'parents') return 'parent';
        return 'child';
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/psychologist/users');
            setData(response.data.data);
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const currentData = data[activeTab];
    const filteredData = currentData.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) || 
        user.login.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddClick = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: UserData) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (user: UserData) => {
        if (window.confirm(`Вы уверены, что хотите удалить ${user.name}?`)) {
            try {
                // Используем POST с _method = DELETE для обхода проблем с методом DELETE
                await apiClient.post(`/psychologist/users/${user.id}`, { 
                    _method: 'DELETE',
                    role: getRoleString(activeTab) 
                });
                fetchUsers();
            } catch (error) {
                alert('Ошибка при удалении');
            }
        }
    };

    const handleRememberPassword = async (user: UserData) => {
        try {
            // Используем POST с _method = PUT для обхода проблем с методом PUT
            const response = await apiClient.post(`/psychologist/users/${user.id}`, { 
                _method: 'PUT',
                name: user.name, 
                login: user.login, 
                role: getRoleString(activeTab),
                generate_password: true
            });
            
            if (response.data.generated_password) {
                setGeneratedPassword(response.data.generated_password);
                setPasswordUserName(user.name);
                setPasswordModalOpen(true);
            }
        } catch (error) {
            alert('Ошибка при смене пароля');
        }
    };

    return (
        <div className="users-page">
            <UsersHeaderBlock 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                counts={{ mentors: data.mentors.length, parents: data.parents.length, children: data.children.length }}
                onAddClick={handleAddClick} 
            />
            <UsersFilterBlock search={search} onSearchChange={setSearch} />
            <UsersTableBlock 
                activeTab={activeTab} 
                data={filteredData} 
                isLoading={isLoading} 
                onEdit={handleEdit}
                onRememberPassword={handleRememberPassword}
                onDelete={handleDelete}
            />

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
            >
                <UserForm 
                    initialData={editingUser} 
                    activeTab={activeTab} 
                    mentors={data.mentors}
                    parents={data.parents}
                    onSuccess={() => { setIsModalOpen(false); fetchUsers(); }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            <PasswordModal 
                isOpen={passwordModalOpen} 
                onClose={() => setPasswordModalOpen(false)} 
                password={generatedPassword}
                userName={passwordUserName}
            />
        </div>
    );
}