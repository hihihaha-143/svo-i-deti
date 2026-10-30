import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import UsersFilterBlock from '../PsychologistDashboard/UsersFilterBlock';
import PasswordModal from '../../components/PasswordModal/PasswordModal';
import MentorChildrenTableBlock, { type MentorChildData } from './MentorChildrenTableBlock';
import useToast from '../../hooks/useToast';

export default function MentorChildrenPage() {
    const [data, setData] = useState<MentorChildData[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [passwordUserName, setPasswordUserName] = useState('');

    const { showToast } = useToast();

    const fetchChildren = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/mentor/children');
            setData(response.data.data);
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChildren();
    }, []);

    const filteredData = data.filter(child =>
        child.name.toLowerCase().includes(search.toLowerCase()) ||
        child.login.toLowerCase().includes(search.toLowerCase())
    );

    const handleResetPassword = async (child: MentorChildData) => {
        if (!window.confirm(`Сгенерировать новый пароль для ${child.name}?`)) {
            return;
        }

        try {
            const response = await apiClient.post(`/mentor/children/${child.id}/reset-password`);

            if (response.data.data?.generated_password) {
                setGeneratedPassword(response.data.data.generated_password);
                setPasswordUserName(response.data.data.name);
                setPasswordModalOpen(true);
            }
        } catch (error) {
            console.error('Ошибка при смене пароля:', error);
            showToast('Ошибка при смене пароля', 'error');
        }
    };

    return (
        <div className="users-page">
            <UsersFilterBlock search={search} onSearchChange={setSearch} />
            <MentorChildrenTableBlock
                data={filteredData}
                isLoading={isLoading}
                onResetPassword={handleResetPassword}
            />

            <PasswordModal
                isOpen={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                password={generatedPassword}
                userName={passwordUserName}
            />
        </div>
    );
}