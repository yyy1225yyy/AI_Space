import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import JobZone from './pages/JobZone';
import CreateQuestion from './pages/Question/Create';
import QuestionDetail from './pages/Question/Detail';
import ProfilePage from './pages/User/Profile';
import UserHomePage from './pages/User/UserHome';
import TagsPage from './pages/Tags';
import RankingPage from './pages/Ranking';
import SearchPage from './pages/Search';
import SignInPage from './pages/SignIn';
import NotificationPage from './pages/Notification';
import PointsPage from './pages/User/Points';
import { useUserStore } from './stores/userStore';
import './App.css';

// 路由守卫：需要登录才能访问
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

// 路由守卫：已登录时跳转首页
function GuestRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  return isLoggedIn ? <Navigate to="/" replace /> : <>{children}</>;
}

// 404 页面
function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ fontSize: 80, fontWeight: 900, color: 'var(--text-tertiary)', opacity: 0.2, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>404</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>页面不存在</div>
      <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>您访问的页面不存在或已被移除</div>
      <a href="/" className="btn btn-primary" style={{ fontSize: 14 }}>返回首页</a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登录注册 - 已登录则跳转首页 */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* 主应用 - 有Layout */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/rd" element={<JobZone jobRole="rd" />} />
          <Route path="/pm-ops" element={<JobZone jobRole="pm_ops" />} />
          <Route path="/qa" element={<JobZone jobRole="qa" />} />
          <Route path="/question/create" element={<PrivateRoute><CreateQuestion /></PrivateRoute>} />
          <Route path="/question/:id" element={<QuestionDetail />} />
          <Route path="/user/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/user/:id" element={<UserHomePage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/tag/:name" element={<TagsPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/sign-in" element={<PrivateRoute><SignInPage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationPage /></PrivateRoute>} />
          <Route path="/user/points" element={<PrivateRoute><PointsPage /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
