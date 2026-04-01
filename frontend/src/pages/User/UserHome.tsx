import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import { JOB_ROLES, LEVEL_CONFIG } from '../../constants';
import { formatDate } from '../../utils/helpers';
import type { User, Question, Answer, ApiResponse } from '../../types';

const UserHomePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [pointRecords, setPointRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers' | 'points'>('questions');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await request.get<ApiResponse<User>>(`/users/${id}`);
        setUserInfo(res.data.data);
      } catch (err) {
        console.error('获取用户信息失败:', id, err);
      }
      try {
        const res = await request.get<ApiResponse<Question[]>>(`/users/${id}/questions`);
        setQuestions(res.data.data || []);
      } catch (err) {
        console.error('获取用户问题失败:', id, err);
      }
      try {
        const res = await request.get<ApiResponse<Answer[]>>(`/users/${id}/answers`);
        setAnswers(res.data.data || []);
      } catch (err) {
        console.error('获取用户回答失败:', id, err);
      }
      try {
        const res = await request.get<ApiResponse<any[]>>(`/users/${id}/point-records`);
        setPointRecords(res.data.data || []);
      } catch (err) {
        console.error('获取积分记录失败:', id, err);
      }
      finally { setLoading(false); }
    };
    if (id && id !== 'undefined') fetchUser();
    else {
      setLoading(false);
      console.error('UserHome: 无效的用户ID', id);
    }
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner spinner-lg" />
    </div>
  );
  if (!userInfo) return (
    <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>用户不存在</div>
  );

  const jobRoleInfo = JOB_ROLES[userInfo.jobRole as keyof typeof JOB_ROLES] || JOB_ROLES.rd;
  const currentLevel = LEVEL_CONFIG.find(l => l.level === userInfo.level);
  const nextLevel = LEVEL_CONFIG.find(l => l.level === userInfo.level + 1);
  const progressPercent = nextLevel && currentLevel
    ? Math.round(((userInfo.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  const statCards = [
    { label: '总积分', value: userInfo.points, icon: '📈', color: 'var(--accent)', bg: 'rgba(24, 144, 255, 0.06)', border: 'rgba(24, 144, 255, 0.15)' },
    { label: '发布问题', value: questions.length, icon: '💬', color: 'var(--green)', bg: 'var(--green-glow)', border: 'rgba(82, 196, 26, 0.15)' },
    { label: '获得点赞', value: questions.reduce((sum, q) => sum + (q.voteCount || 0), 0), icon: '⭐', color: 'var(--purple)', bg: 'rgba(114, 46, 209, 0.06)', border: 'rgba(114, 46, 209, 0.15)' },
    { label: '已解决', value: questions.filter(q => q.status === 'solved').length, icon: '🏆', color: 'var(--orange)', bg: 'var(--orange-glow)', border: 'rgba(250, 140, 22, 0.15)' },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Profile Card */}
      <div className="card animate-fade-up" style={{ padding: 36 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Avatar + Stats on the right */}
          <div className="avatar" style={{
            width: 120, height: 120, fontSize: 44,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
            color: '#fff', flexShrink: 0, border: '4px solid var(--border)',
          }}>
            {userInfo.username?.charAt(0)?.toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
                  {userInfo.username}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="tag tag-cyan" style={{ fontSize: 12, padding: '4px 12px' }}>{jobRoleInfo.icon} {jobRoleInfo.name}</span>
                  <span className="tag" style={{
                    background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(114, 46, 209, 0.1))',
                    color: 'var(--accent)', border: '1px solid rgba(24, 144, 255, 0.2)',
                    fontSize: 12, padding: '4px 12px',
                  }}>
                    🏅 {userInfo.levelName || `Lv${userInfo.level}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Meta info */}
            <div style={{ display: 'flex', gap: 24, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
              {userInfo.department && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
                  {userInfo.department}
                </span>
              )}
            </div>

            {/* Level progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  当前等级: {userInfo.levelName || `Lv${userInfo.level}`}
                </span>
                {nextLevel ? (
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    距离下一级还需 {nextLevel.minPoints - userInfo.points} 积分
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>已达到最高等级!</span>
                )}
              </div>
              <div style={{ width: '100%', height: 10, background: 'var(--bg-base)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(progressPercent, 100)}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--purple))',
                  borderRadius: 5,
                  transition: 'width 0.5s var(--ease-out)',
                }} />
              </div>
            </div>
          </div>

          {/* Stat Cards on the right */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flexShrink: 0 }}>
            {statCards.map((card) => (
              <div key={card.label} className="card" style={{
                padding: 16,
                textAlign: 'center',
                background: card.bg,
                borderColor: card.border,
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{card.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: card.color, fontFamily: 'var(--font-mono)' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{card.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        {userInfo.bio && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
            {userInfo.bio}
          </div>
        )}
      </div>

      {/* Activity Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'questions' as const, label: '发布的问题' },
          { key: 'answers' as const, label: '回答的问题' },
          { key: 'points' as const, label: '积分记录' },
        ].map((tab) => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 400,
              color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all var(--duration-fast)',
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Tab Content: Questions */}
      {activeTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.length > 0 ? questions.map((q) => (
            <div
              key={q.id}
              className="card card-hover"
              onClick={() => navigate(`/question/${q.id}`)}
              style={{ padding: '18px 24px', cursor: 'pointer', display: 'flex', gap: 16 }}
            >
              {/* Avatar */}
              <div className="avatar" style={{
                width: 44, height: 44, fontSize: 17,
                background: 'var(--accent-glow)', color: 'var(--accent)',
                flexShrink: 0,
              }}>
                {userInfo.username?.charAt(0)?.toUpperCase()}
              </div>
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                  {q.title}
                  {q.status === 'solved' && <span style={{ color: 'var(--green)', marginLeft: 8, fontSize: 13 }}>✓</span>}
                </h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  {q.tags?.slice(0, 3).map((tag) => (
                    <span key={tag.id} className="tag tag-muted" style={{ fontSize: 11 }}>{tag.name}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  <span>{formatDate(q.createdAt)}</span>
                  <span>💬 {q.answerCount || 0}</span>
                  <span>👍 {q.voteCount || 0}</span>
                  <span>👀 {q.viewCount || 0}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
              暂无发布的问题
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Answers */}
      {activeTab === 'answers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {answers.length > 0 ? answers.map((a) => (
            <div
              key={a.id}
              className="card card-hover"
              onClick={() => navigate(`/question/${a.questionId}`)}
              style={{ padding: '18px 24px', cursor: 'pointer', display: 'flex', gap: 16 }}
            >
              <div className="avatar" style={{
                width: 44, height: 44, fontSize: 17,
                background: 'var(--accent-glow)', color: 'var(--accent)',
                flexShrink: 0,
              }}>
                {userInfo.username?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>回答了问题</span>
                  {a.isAccepted && <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>✓ 已采纳</span>}
                </div>
                <div style={{
                  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {a.content.replace(/<[^>]*>/g, '')}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
                  <span>{formatDate(a.createdAt)}</span>
                  <span>👍 {a.voteCount || 0}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
              暂无回答记录
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Points */}
      {activeTab === 'points' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {pointRecords.length > 0 ? pointRecords.map((record, idx) => {
            const isPositive = (record.points || 0) > 0;
            const icon = isPositive ? '📈' : '📉';
            const iconColor = isPositive ? 'var(--green)' : 'var(--red)';
            const iconBg = isPositive ? 'var(--green-glow)' : 'var(--red-glow)';
            return (
              <div
                key={record.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderBottom: idx < pointRecords.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: iconBg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {record.description || record.actionType || '积分变动'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {record.createdAt ? formatDate(record.createdAt) : '—'}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 800,
                  color: isPositive ? 'var(--green)' : 'var(--red)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {isPositive ? '+' : ''}{record.points || 0}
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
              暂无积分记录
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserHomePage;
