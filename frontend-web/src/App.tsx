import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import PsychologistDashboard from './pages/PsychologistDashboard/PsychologistDashboard'; // <-- импорт

// Временная заглушка для остальных ролей
function RoleStub({ title }: { title: string }) {
    const { user } = useAuth();
    if (!user) return null;
    return (
        <div style={{ padding: '20px' }}>
            <h1>{title}</h1>
            <p>Привет, <strong>{user.name}</strong>!</p>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<LoginPage />} />
                    
                    <Route element={<ProtectedRoute allowedRole="psychologist" />}>
                        <Route path="/psychologist" element={<PsychologistDashboard />} />
                    </Route>
                    
                    <Route element={<ProtectedRoute allowedRole="mentor" />}>
                        <Route path="/mentor" element={<RoleStub title="Дашборд Наставника" />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRole="parent" />}>
                        <Route path="/parent" element={<RoleStub title="Дашборд Родителя" />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRole="child" />}>
                        <Route path="/child" element={<RoleStub title="Дашборд Ребенка" />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;