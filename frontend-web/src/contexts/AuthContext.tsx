import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';

interface User {
    id: number;
    name: string;
    login: string;
    role: 'psychologist' | 'mentor' | 'parent' | 'child';
}

interface Profile {
    external_id: string;
    organization?: string;
    psychologist_id?: number;
    mentor_id?: number;
    parent_id?: number;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    setAuthData: (user: User, profile: Profile) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Загрузка пользователя при старте (проверка токена)
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await apiClient.get('/me');
                setUser(response.data.data.user);
                setProfile(response.data.data.profile);
            } catch (error) {
                // Токен протух или неверный
                localStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_token');
                setUser(null);
                setProfile(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const setAuthData = (newUser: User, newProfile: Profile) => {
        setUser(newUser);
        setProfile(newProfile);
    };

    const logout = () => {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
    };

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, setAuthData, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}