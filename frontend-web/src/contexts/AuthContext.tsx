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

const TOKEN_KEY = 'auth_token';

function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = getToken();
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await apiClient.get('/me');
                setUser(response.data.data.user);
                setProfile(response.data.data.profile);
            } catch (error) {
                clearToken();
                setUser(null);
                setProfile(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Синхронизация между вкладками
        const handleStorage = (e: StorageEvent) => {
            if (e.key !== TOKEN_KEY) return;
            if (e.newValue === null) {
                // Токен удалён в другой вкладке — разлогиниваемся
                setUser(null);
                setProfile(null);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const setAuthData = (newUser: User, newProfile: Profile) => {
        setUser(newUser);
        setProfile(newProfile);
    };

    const logout = () => {
        // best-effort: удаляем токен на бэкенде, не блокируя UI
        apiClient.post('/logout').catch(() => {});

        clearToken();
        setUser(null);
        setProfile(null);
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