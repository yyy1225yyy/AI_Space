import React from 'react';
import { JOB_ROLES } from '../../constants';
import { useAppStore } from '../../stores/appStore';
import type { JobRole } from '../../types';

interface Props {
  onChange?: (role: JobRole | 'all') => void;
}

const JobRoleTab: React.FC<Props> = ({ onChange }) => {
  const { currentJobRole, setCurrentJobRole } = useAppStore();

  const items = [
    { key: 'all', label: '全部' },
    ...Object.values(JOB_ROLES).map((role) => ({
      key: role.key,
      label: `${role.icon} ${role.name}`,
    })),
  ];

  const handleChange = (key: string) => {
    setCurrentJobRole(key as JobRole | 'all');
    onChange?.(key as JobRole | 'all');
  };

  return (
    <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
      {items.map((item) => {
        const isActive = currentJobRole === item.key;
        return (
          <div
            key={item.key}
            onClick={() => handleChange(item.key)}
            className={`tab-underline ${isActive ? 'active' : ''}`}
            style={{
              padding: '10px 18px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-subtle)' : 'transparent',
              transition: 'all var(--duration-fast) var(--ease-out)',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = 'var(--bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

export default JobRoleTab;
