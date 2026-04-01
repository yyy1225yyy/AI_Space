import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore';
import { useAppStore } from '../../stores/appStore';
import { notificationService } from '../../services/notificationService';
import { JOB_ROLES } from '../../constants';
import type { JobRole } from '../../types';

const navTabs = [
  { path: '/', label: '广场首页', icon: '🏠' },
  { path: '/rd', label: '研发专区', icon: JOB_ROLES.rd.icon },
  { path: '/pm-ops', label: '产品运营专区', icon: JOB_ROLES.pm_ops.icon },
  { path: '/qa', label: '测试专区', icon: JOB_ROLES.qa.icon },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const isLoginPage = location.pathname === '/login' || location.pathname === '/register';
  const { user, isLoggedIn, logout } = useUserStore();
  const { setCurrentJobRole } = useAppStore();
  const [searchValue, setSearchValue] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) { setUnreadCount(0); return; }
    notificationService.getUnreadCount().then(res => {
      setUnreadCount(res.data.data?.count || 0);
    }).catch(() => {});
  }, [isLoggedIn]);

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleNavClick = (path: string) => {
    if (path === '/') {
      setCurrentJobRole('all');
    } else if (path === '/rd') {
      setCurrentJobRole('rd');
    } else if (path === '/pm-ops') {
      setCurrentJobRole('pm_ops');
    } else if (path === '/qa') {
      setCurrentJobRole('qa');
    }
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowMenu(false);
  };

  const isTabActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // 登录/注册页不显示导航栏
  if (isLoginPage) return null;

  return (
    <>
      {/* Top Header */}
      <header
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => { setCurrentJobRole('all'); navigate('/'); }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 13,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            AI
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            AI广场
          </span>
        </div>

        {/* Search */}
        {!isSearchPage && (
          <div style={{ flex: 1, maxWidth: 480, margin: '0 32px' }}>
            <div style={{ position: 'relative' }}>
              <input
                placeholder="搜索问题、标签、用户..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input"
                style={{
                  height: 38,
                  borderRadius: 100,
                  paddingLeft: 38,
                  paddingRight: 70,
                  fontSize: 13,
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                }}
              />
              <svg
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', opacity: 0.35, pointerEvents: 'none' }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <button
                onClick={handleSearch}
                style={{
                  position: 'absolute',
                  right: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: 30,
                  padding: '0 16px',
                  borderRadius: 100,
                  border: 'none',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                搜索
              </button>
            </div>
          </div>
        )}

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/ranking')}
            style={{ fontSize: 13, gap: 5 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            排行榜
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/tags')}
            style={{ fontSize: 13, gap: 5 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
            标签
          </button>

          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => navigate('/notifications')}
                style={{ position: 'relative' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: 'var(--red)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    display: unreadCount > 0 ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </button>

              {/* User menu */}
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 8px 4px 4px',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 13, background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))', color: '#fff' }}>
                    {user?.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.username}</span>
                  <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Lv{user?.level}</span>
                </div>

                {showMenu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setShowMenu(false)} />
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: 8,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        minWidth: 160,
                        overflow: 'hidden',
                        zIndex: 999,
                      }}
                    >
                      {[
                        { label: '每日签到', action: () => { navigate('/sign-in'); setShowMenu(false); } },
                        { label: '个人主页', action: () => {
                          if (user?.id) {
                            navigate(`/user/${user.id}`);
                          } else {
                            // user.id 可能未存储（旧版登录），先从 /users/me 获取
                            fetch('/api/users/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                              .then(r => r.json())
                              .then(res => { if (res.data?.id) navigate(`/user/${res.data.id}`); })
                              .catch(() => navigate('/user/profile'));
                          }
                          setShowMenu(false);
                        }},
                        { label: '个人资料', action: () => { navigate('/user/profile'); setShowMenu(false); } },
                        { label: '积分明细', action: () => { navigate('/user/points'); setShowMenu(false); } },
                      ].map((item) => (
                        <div
                          key={item.label}
                          onClick={item.action}
                          style={{
                            padding: '10px 16px',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            fontSize: 13,
                            transition: 'all var(--duration-fast)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                          {item.label}
                        </div>
                      ))}
                      <div
                        onClick={handleLogout}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          color: 'var(--red)',
                          fontSize: 13,
                          borderTop: '1px solid var(--border)',
                          transition: 'background var(--duration-fast)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--red-glow)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        退出登录
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => navigate('/login')}>登录</button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>注册</button>
            </div>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav
        style={{
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 'var(--header-height)',
          zIndex: 99,
        }}
      >
        <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', padding: '0 40px', display: 'flex', gap: 32 }}>
          {navTabs.map((tab) => {
            const active = isTabActive(tab.path);
            const activeColor = tab.path === '/pm-ops' ? 'var(--green)' : tab.path === '/qa' ? 'var(--orange)' : 'var(--accent)';
            return (
              <div
                key={tab.path}
                onClick={() => handleNavClick(tab.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 0',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? activeColor : 'var(--text-secondary)',
                  borderBottom: active ? `2px solid ${activeColor}` : '2px solid transparent',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.borderBottomColor = 'var(--border)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: 14 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Header;
