import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, Eye, EyeOff, Smile } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext'; // <-- добавили импорт

export default function LoginPage() {
    const navigate = useNavigate();
    const { setAuthData } = useAuth(); // <-- достаем функцию
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiClient.post('/login', { login, password });
            const { token, user, profile } = response.data.data; // <-- берем profile

            localStorage.removeItem('auth_token');
            sessionStorage.removeItem('auth_token');

            if (rememberMe) {
                localStorage.setItem('auth_token', token);
            } else {
                sessionStorage.setItem('auth_token', token);
            }

            setAuthData(user, profile); // <-- сохраняем в контекст

            // Редирект по роли
            if (user.role === 'psychologist') {
                navigate('/psychologist');
            } else if (user.role === 'mentor') {
                navigate('/mentor');
            } else if (user.role === 'parent') {
                navigate('/parent');
            } else if (user.role === 'child') {
                navigate('/child');
            }
        } catch (err: any) {
            // ... (обработка ошибок без изменений)
            if (err.response?.status === 422) {
                setError(err.response.data.errors?.login?.[0] || 'Ошибка валидации');
            } else {
                setError('Произошла ошибка при входе. Попробуйте позже.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ... (return остается без изменений, JSX формы)
    return (
        <div className="login-page">
            <div className="login-page__card">
                <h1 className="login-page__title">
                    <LogIn size={28} strokeWidth={2.5} /> Вход в систему
                </h1>
                <p className="login-page__subtitle">
                    <Smile size={18} strokeWidth={2.5} /> Давай поиграем, чтобы узнать настроение
                </p>

                <form className="login-page__form" onSubmit={handleSubmit}>
                    <div className="login-page__field">
                        <label className="login-page__label">
                            <User size={18} strokeWidth={2.5} /> Логин
                        </label>
                        <input
                            type="text"
                            className="login-page__input"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-page__field">
                        <label className="login-page__label">
                            <Lock size={18} strokeWidth={2.5} /> Пароль
                        </label>
                        <div className="login-page__input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="login-page__input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="login-page__password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <label className="login-page__checkbox">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        Запомнить меня
                    </label>

                    {error && <div className="login-page__error">{error}</div>}

                    <button type="submit" className="login-page__submit" disabled={isLoading}>
                        {isLoading ? (
                            'Вход...'
                        ) : (
                            <>
                                <LogIn size={20} strokeWidth={2.5} /> Войти
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}