import { useState, useEffect, FormEvent } from 'react';
import { RefreshCw } from 'lucide-react';
import apiClient from '../../api/client';

interface UserData {
    id?: number;
    name: string;
    login: string;
    password?: string;
    organization?: string;
    mentor_id?: number;
    parent_id?: number;
    role: 'mentor' | 'parent' | 'child';
}

interface UserFormProps {
    initialData?: UserData | null;
    activeTab: 'mentors' | 'parents' | 'children';
    mentors: UserData[];
    parents: UserData[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UserForm({ initialData, activeTab, mentors, parents, onSuccess, onCancel }: UserFormProps) {
    const role = activeTab === 'mentors' ? 'mentor' : activeTab === 'parents' ? 'parent' : 'child';
    
    const [formData, setFormData] = useState<UserData>({
        name: '',
        login: '',
        password: '',
        role: role,
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let pass = '';
        for (let i = 0; i < 8; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password: pass }));
    };

    useEffect(() => {
        if (initialData) {
            setFormData({ ...initialData, password: '', role: role });
        } else {
            generatePassword();
            setFormData(prev => ({ ...prev, name: '', login: '', role: role }));
        }
    }, [initialData, role]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (initialData?.id) {
                // Используем POST с _method = PUT для обновления
                await apiClient.post(`/psychologist/users/${initialData.id}`, {
                    ...formData,
                    _method: 'PUT'
                });
            } else {
                await apiClient.post('/psychologist/users', formData);
            }
            onSuccess();
        } catch (err: any) {
            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0] as string[];
                setError(firstError[0]);
            } else {
                setError('Произошла ошибка при сохранении.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="user-form" onSubmit={handleSubmit}>
            <div className="user-form__field">
                <label>Имя</label>
                <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                />
            </div>
            <div className="user-form__field">
                <label>Логин</label>
                <input 
                    type="text" 
                    value={formData.login} 
                    onChange={e => setFormData({...formData, login: e.target.value})} 
                    required 
                />
            </div>
            <div className="user-form__field">
                <label>{initialData ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}</label>
                <div className="user-form__password-wrapper">
                    <input 
                        type="text" 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        required={!initialData}
                    />
                    <button type="button" className="user-form__generate-btn" onClick={generatePassword} title="Сгенерировать пароль">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {role === 'mentor' && (
                <div className="user-form__field">
                    <label>Организация</label>
                    <input 
                        type="text" 
                        value={formData.organization || ''} 
                        onChange={e => setFormData({...formData, organization: e.target.value})} 
                        required 
                    />
                </div>
            )}

            {role === 'parent' && (
                <div className="user-form__field">
                    <label>Наставник</label>
                    <select 
                        value={formData.mentor_id || ''} 
                        onChange={e => setFormData({...formData, mentor_id: Number(e.target.value)})} 
                        required
                    >
                        <option value="">Выберите наставника</option>
                        {mentors.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {role === 'child' && (
                <>
                    <div className="user-form__field">
                        <label>Наставник</label>
                        <select 
                            value={formData.mentor_id || ''} 
                            onChange={e => setFormData({...formData, mentor_id: Number(e.target.value)})} 
                            required
                        >
                            <option value="">Выберите наставника</option>
                            {mentors.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="user-form__field">
                        <label>Родитель</label>
                        <select 
                            value={formData.parent_id || ''} 
                            onChange={e => setFormData({...formData, parent_id: Number(e.target.value)})} 
                            required
                        >
                            <option value="">Выберите родителя</option>
                            {parents.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </>
            )}

            {error && <div className="user-form__error">{error}</div>}

            <div className="user-form__actions">
                <button type="button" className="user-form__btn user-form__btn--cancel" onClick={onCancel}>Отмена</button>
                <button type="submit" className="user-form__btn user-form__btn--submit" disabled={isLoading}>
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}