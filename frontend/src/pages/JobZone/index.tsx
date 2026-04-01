import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '../../components/QuestionCard';
import request from '../../utils/request';
import { JOB_ROLES } from '../../constants';
import type { Question, Tag as TagType, User, ApiResponse } from '../../types';

interface JobZoneProps {
  jobRole?: string;
}

const JobZone: React.FC<JobZoneProps> = ({ jobRole: propJobRole }) => {
  const navigate = useNavigate();
  const jobRole = propJobRole || 'rd';
  const jobRoleInfo = JOB_ROLES[jobRole as keyof typeof JOB_ROLES] || JOB_ROLES.rd;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'unsolved'>('latest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchQuestions = async (p: number, sort: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, size: pageSize, jobRole };
      if (sort && sort !== 'latest') params.sort = sort;
      const [qRes, tRes, rRes] = await Promise.all([
        request.get<ApiResponse<{ list: Question[]; total: number }>>('/questions', { params }),
        request.get<ApiResponse<TagType[]>>('/tags', { params: { jobRole } }),
        request.get<ApiResponse<User[]>>('/rankings', { params: { jobRole } }),
      ]);
      setQuestions(qRes.data.data?.list || []);
      setTotal(qRes.data.data?.total || 0);
      setTags((tRes.data.data || []).slice(0, 15));
      setTopUsers((rRes.data.data || []).slice(0, 5));
    } catch { /* */ } finally { setLoading(false); }
  };

  const handleSortChange = (sort: 'latest' | 'hot' | 'unsolved') => {
    setSortBy(sort);
    setPage(1);
    fetchQuestions(1, sort);
  };

  useEffect(() => { fetchQuestions(page, sortBy); }, [jobRole, page]);

  const totalPages = Math.ceil(total / pageSize);

  const roleColor = jobRole === 'pm_ops' ? 'var(--green)' : jobRole === 'qa' ? 'var(--orange)' : 'var(--accent)';
  const roleBg = jobRole === 'pm_ops' ? 'var(--green-glow)' : jobRole === 'qa' ? 'var(--orange-glow)' : 'var(--accent-glow)';

  return (
    <div>
      {/* Header Banner */}
      <div
        style={{
          padding: '32px 36px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 28,
          background: roleBg,
          border: `1px solid ${roleColor}20`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 40 }}>{jobRoleInfo.icon}</span>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              {jobRoleInfo.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>{jobRoleInfo.name}方向的AI知识问答</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>👥 {topUsers.length} 位活跃成员</span>
          <span>📈 {total} 个问题</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28 }}>
        {/* Main content */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {sortBy === 'hot' ? '最热问题' : sortBy === 'unsolved' ? '待解决问题' : '最新问题'}
            </h2>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/question/create')}>
              + 发布问题
            </button>
          </div>

          {/* Sort buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {([
              { key: 'latest' as const, label: '最新', icon: '🕐' },
              { key: 'hot' as const, label: '最热', icon: '🔥' },
              { key: 'unsolved' as const, label: '待解决', icon: '⭐' },
            ]).map((btn) => (
              <button
                key={btn.key}
                className={sortBy === btn.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                onClick={() => handleSortChange(btn.key)}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : questions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ color: 'var(--text-tertiary)' }}>暂无问题，快来发布第一个</div>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{page} / {totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top contributors */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🏅 岗位排行榜</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/ranking')} style={{ padding: 0, fontSize: 12 }}>查看全部 →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topUsers.map((user, idx) => (
                <div
                  key={user.id}
                  onClick={() => navigate(`/user/${user.id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'background var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' : idx === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : idx === 2 ? 'linear-gradient(135deg, #fb923c, #ea580c)' : 'var(--bg-base)',
                    color: idx < 3 ? '#fff' : 'var(--text-tertiary)',
                  }}>
                    {idx + 1}
                  </div>
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                    {user.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{user.points} 积分</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              {jobRoleInfo.name}标签
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="tag tag-muted"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tag/${tag.name}`)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobZone;
