import React from 'react';
import type { User } from '../../types';
import { JOB_ROLES } from '../../constants';

interface Props {
  user: User;
  showPoints?: boolean;
}

const UserCard: React.FC<Props> = ({ user, showPoints = true }) => {
  const jobRoleInfo = JOB_ROLES[user.jobRole as keyof typeof JOB_ROLES] || JOB_ROLES.rd;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div className="avatar" style={{ width: 40, height: 40, fontSize: 16, background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))', color: '#fff' }}>
        {user.username?.charAt(0)?.toUpperCase()}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{user.username}</span>
          {user.levelName && <span className="tag tag-cyan">{user.levelName}</span>}
        </div>
        <div style={{ color: 'var(--text-tertiary)', fontSize: 12, marginTop: 3 }}>
          <span>{jobRoleInfo.icon} {jobRoleInfo.name}</span>
          {showPoints && (
            <span style={{ marginLeft: 12, fontFamily: 'var(--font-mono)' }}>
              {user.points} pts
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
