import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import PsychologistDashboard from './pages/PsychologistDashboard/PsychologistDashboard';
import MentorDashboard from './pages/MentorDashboard/MentorDashboard';
import ParentDashboard from './pages/ParentDashboard/ParentDashboard';
import ParentHomePage from './pages/ParentDashboard/ParentHomePage';
import ParentDiaryPage from './pages/ParentDashboard/ParentDiaryPage';
import ParentLibraryPage from './pages/ParentDashboard/ParentLibraryPage';
import ParentLibraryArticlePage from './pages/ParentDashboard/ParentLibraryArticlePage';
import ParentTestPassingPage from './pages/ParentDashboard/ParentTestPassingPage';
import ChildDashboard from './pages/ChildDashboard/ChildDashboard';
import ChildHomePage from './pages/ChildDashboard/ChildHomePage';
import ChildAchievementsPage from './pages/ChildDashboard/ChildAchievementsPage';

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
            <Route path="/mentor" element={<MentorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRole="parent" />}>
            <Route path="/parent" element={<ParentDashboard />}>
              <Route index element={<ParentHomePage />} />
              <Route path="diary" element={<ParentDiaryPage />} />
              <Route path="library" element={<ParentLibraryPage />} />
              <Route path="library/:id" element={<ParentLibraryArticlePage />} />
              <Route path="test/:testId" element={<ParentTestPassingPage />} />
              <Route path="chat" element={<div>Чат с психологом (в разработке)</div>} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRole="child" />}>
            <Route path="/child" element={<ChildDashboard />}>
              <Route index element={<ChildHomePage />} />
              <Route path="achievements" element={<ChildAchievementsPage />} />
              <Route path="stats" element={<div>Статистика (в разработке)</div>} />
              <Route path="events" element={<div>Мероприятия (в разработке)</div>} />
              <Route path="memo" element={<div>Памятка (в разработке)</div>} />
              <Route path="test/:testId" element={<div>Прохождение теста (в разработке)</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;