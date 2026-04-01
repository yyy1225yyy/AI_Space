import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import { JOB_ROLES, LEVEL_CONFIG } from '../../constants';
import type { User, ApiResponse } from '../../types';

const RankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('');

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (activeRole) params.jobRole = activeRole;
        const res = await request.get<ApiResponse<User[]>>('/rankings', { params });
        setUsers(res.data.data || []);
      } catch { /* */ } finally { setLoading(false); }
    };
    fetchRanking();
  }, [activeRole]);

  const getLevelName = (user: User) => user.levelName || `Lv${user.level}`;
  const getLevelProgress = (user: User) => {
    const current = LEVEL_CONFIG.find(l => l.level === user.level);
    const next = LEVEL_CONFIG.find(l => l.level === user.level + 1);
    if (!next) return 100;
    if (!current) return 0;
    return Math.round(((user.points - current.minPoints) / (next.minPoints - current.minPoints)) * 100);
  };

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 800, boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)' }}>
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 800, boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)' }}>
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 800, boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
          3
        </div>
      );
    }
    return (
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 16, fontWeight: 700 }}>
        {rank}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 40 }}>🏆</span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>排行榜</h1>
        </div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 15 }}>通过积分提升等级，成为AI领域专家</p>
      </div>

      {/* Role filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <button
          className={activeRole === '' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
          onClick={() => setActiveRole('')}
        >🌐 全部</button>
        {Object.values(JOB_ROLES).map((r) => (
          <button
            key={r.key}
            className={activeRole === r.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => setActiveRole(r.key)}
          >{r.icon} {r.name}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : users.length > 0 ? (
        <>
          {/* Top 3 Podium */}
          {users.length >= 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
              {/* 2nd Place */}
              <div className="card" style={{ textAlign: 'center', padding: 28, background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)' }}>
                <div style={{ marginBottom: 12 }}>{renderRankBadge(2)}</div>
                <div className="avatar" style={{ width: 72, height: 72, fontSize: 28, margin: '0 auto 12px', background: 'linear-gradient(135deg, #9ca3af, #6b7280)', color: '#fff', border: '3px solid #d1d5db' }}>
                  {users[1].username?.charAt(0)?.toUpperCase()}
                </div>
                <div
                  style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', marginBottom: 6 }}
                  onClick={() => navigate(`/user/${users[1].id}`)}
                >
                  {users[1].username}
                </div>
                <span className="tag tag-muted" style={{ marginBottom: 8, display: 'inline-flex' }}>{getLevelName(users[1])}</span>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {users[1].points.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>积分</div>
              </div>

              {/* 1st Place */}
              <div
                className="card"
                style={{
                  textAlign: 'center', padding: 28,
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.05))',
                  borderColor: 'rgba(251, 191, 36, 0.3)',
                  transform: 'scale(1.02)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div style={{ marginBottom: 12 }}>{renderRankBadge(1)}</div>
                <div className="avatar" style={{ width: 80, height: 80, fontSize: 32, margin: '0 auto 12px', background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: '#fff', border: '3px solid #fde68a' }}>
                  {users[0].username?.charAt(0)?.toUpperCase()}
                </div>
                <div
                  style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', cursor: 'pointer', marginBottom: 6 }}
                  onClick={() => navigate(`/user/${users[0].id}`)}
                >
                  {users[0].username}
                </div>
                <span className="tag tag-orange" style={{ marginBottom: 8, display: 'inline-flex' }}>{getLevelName(users[0])}</span>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                  {users[0].points.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>积分</div>
              </div>

              {/* 3rd Place */}
              <div className="card" style={{ textAlign: 'center', padding: 28, background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08), rgba(251, 146, 60, 0.03))' }}>
                <div style={{ marginBottom: 12 }}>{renderRankBadge(3)}</div>
                <div className="avatar" style={{ width: 72, height: 72, fontSize: 28, margin: '0 auto 12px', background: 'linear-gradient(135deg, #fb923c, #ea580c)', color: '#fff', border: '3px solid #fdba74' }}>
                  {users[2].username?.charAt(0)?.toUpperCase()}
                </div>
                <div
                  style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', marginBottom: 6 }}
                  onClick={() => navigate(`/user/${users[2].id}`)}
                >
                  {users[2].username}
                </div>
                <span className="tag tag-muted" style={{ marginBottom: 8, display: 'inline-flex' }}>{getLevelName(users[2])}</span>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {users[2].points.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>积分</div>
              </div>
            </div>
          )}

          {/* Full ranking list */}
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            {users.map((user, idx) => {
              const jobRoleInfo = JOB_ROLES[user.jobRole as keyof typeof JOB_ROLES];
              return (
                <div
                  key={user.id}
                  onClick={() => navigate(`/user/${user.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '14px 24px',
                    borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                >
                  {/* Rank */}
                  <div style={{ width: 48, flexShrink: 0 }}>
                    {renderRankBadge(idx + 1)}
                  </div>

                  {/* Avatar */}
                  <div className="avatar" style={{ width: 48, height: 48, fontSize: 18, background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                    {user.username?.charAt(0)?.toUpperCase()}
                  </div>

                  {/* User info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {user.username}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {jobRoleInfo && <span className="tag tag-cyan" style={{ fontSize: 11 }}>{jobRoleInfo.icon} {jobRoleInfo.name}</span>}
                      <span className="tag tag-muted" style={{ fontSize: 11 }}>{getLevelName(user)}</span>
                      {user.department && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{user.department}</span>}
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                      {user.points.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>积分</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>▲</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>暂无排行数据</div>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>积极参与社区互动即可上榜</div>
        </div>
      )}
    </div>
  );
};

export default RankingPage;
