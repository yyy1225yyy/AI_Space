import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { JOB_ROLES } from '../../constants';
import type { JobRole } from '../../types';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentJobRole } = useAppStore();

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/') return 'all';
    if (path.startsWith('/rd')) return 'rd';
    if (path.startsWith('/pm-ops') || path.startsWith('/pm_ops')) return 'pm_ops';
    if (path.startsWith('/qa')) return 'qa';
    if (path.startsWith('/tags')) return 'tags';
    if (path.startsWith('/ranking')) return 'ranking';
    return '';
  };

  const handleClick = (key: string) => {
    if (key === 'all') { setCurrentJobRole('all'); navigate('/'); }
    else if (['rd', 'pm_ops', 'qa'].includes(key)) {
      setCurrentJobRole(key as JobRole);
      navigate(`/${key.replace('_', '-')}`);
    }
    else if (key === 'tags') navigate('/tags');
    else if (key === 'ranking') navigate('/ranking');
  };

  const activeKey = getActiveKey();

  const mainItems = [
    { key: 'all', label: '全部岗位', icon: '◆' },
    ...Object.values(JOB_ROLES).map((role) => ({
      key: role.key,
      label: role.name,
      icon: role.icon,
    })),
  ];

  const moreItems = [
    { key: 'tags', label: '标签页', icon: '⊞' },
    { key: 'ranking', label: '排行榜', icon: '▲' },
  ];

  const navItem = (item: { key: string; label: string; icon: string }) => {
    const isActive = activeKey === item.key;
    return (
      <div
        key={item.key}
        onClick={() => handleClick(item.key)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 16px',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: isActive ? 600 : 400,
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
          background: isActive ? 'var(--accent-subtle)' : 'transparent',
          borderRight: isActive ? '2px solid var(--accent)' : '2px solid transparent',
          transition: 'all var(--duration-fast) var(--ease-out)',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
      >
        <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
        <span>{item.label}</span>
      </div>
    );
  };

  return (
    <div
      style={{
        width: 'var(--sidebar-width)',
        minHeight: `calc(100vh - var(--header-height))`,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '0 16px 10px', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        岗位专区
      </div>
      {mainItems.map(navItem)}

      <div style={{ borderTop: '1px solid var(--border)', margin: '12px 16px' }} />

      <div style={{ padding: '0 16px 10px', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        发现
      </div>
      {moreItems.map(navItem)}
    </div>
  );
};

export default Sidebar;
