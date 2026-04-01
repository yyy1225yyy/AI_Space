import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import request from '../../utils/request';
import { JOB_ROLES, QUESTION_STATUS_MAP } from '../../constants';
import { formatDate } from '../../utils/helpers';
import type { Tag, Question, ApiResponse } from '../../types';

const TagsPage: React.FC = () => {
  const navigate = useNavigate();
  const { name: tagName } = useParams<{ name: string }>();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJobRole, setActiveJobRole] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // 按标签查问题
  const [tagQuestions, setTagQuestions] = useState<Question[]>([]);
  const [tagLoading, setTagLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (activeJobRole) params.jobRole = activeJobRole;
        const res = await request.get<ApiResponse<Tag[]>>('/tags', { params });
        setTags(res.data.data || []);
      } catch { /* */ } finally { setLoading(false); }
    };
    fetchTags();
  }, [activeJobRole]);

  useEffect(() => {
    if (!tagName) { setTagQuestions([]); return; }
    const fetchQuestions = async () => {
      setTagLoading(true);
      try {
        const res = await request.get<ApiResponse<Question[]>>(`/tags/${encodeURIComponent(tagName)}/questions`);
        setTagQuestions(res.data.data || []);
      } catch { /* */ } finally { setTagLoading(false); }
    };
    fetchQuestions();
  }, [tagName]);

  const filteredTags = searchQuery
    ? tags.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : tags;

  const groupedTags = filteredTags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const cat = tag.category || '其他';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tag);
    return acc;
  }, {});

  // 如果有 tagName 参数，显示标签下的问题列表
  if (tagName) {
    const currentTag = tags.find(t => t.name === tagName);
    return (
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        {/* 面包屑 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13 }}>
          <span
            style={{ color: 'var(--accent)', cursor: 'pointer' }}
            onClick={() => navigate('/tags')}
          >标签</span>
          <span style={{ color: 'var(--text-tertiary)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tagName}</span>
          {currentTag && (
            <span className="tag tag-muted" style={{ fontSize: 11, marginLeft: 8 }}>
              {currentTag.questionCount || 0} 个问题
            </span>
          )}
        </div>

        {tagLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : tagQuestions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
            该标签下暂无问题
          </div>
        ) : (
          tagQuestions.map((q) => {
            const statusInfo = QUESTION_STATUS_MAP[q.status as keyof typeof QUESTION_STATUS_MAP];
            const jobRoleInfo = JOB_ROLES[q.jobRole as keyof typeof JOB_ROLES] || JOB_ROLES.rd;
            return (
              <div
                key={q.id}
                className="card card-hover"
                onClick={() => navigate(`/question/${q.id}`)}
                style={{ padding: '18px 20px', marginBottom: 10, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0, flex: 1 }}>
                    {q.title}
                  </h3>
                  {statusInfo && <span className="tag" style={{ fontSize: 10 }}>{statusInfo.name}</span>}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  <span>{jobRoleInfo.icon} {jobRoleInfo.name}</span>
                  <span>{q.voteCount || 0} 投票</span>
                  <span>{q.answerCount || 0} 回答</span>
                  <span>{q.viewCount || 0} 浏览</span>
                  <span>{formatDate(q.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  // 默认：显示所有标签
  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>标签广场</h1>
        </div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 15 }}>
          按岗位方向浏览AI技术标签，找到您感兴趣的话题
        </p>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 560, margin: '0 auto 32px', position: 'relative' }}>
        <svg
          style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.35, pointerEvents: 'none' }}
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          className="input"
          placeholder="搜索标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ height: 46, paddingLeft: 48, fontSize: 15, borderRadius: 'var(--radius-lg)' }}
        />
      </div>

      {/* Job role filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          className={activeJobRole === '' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
          onClick={() => setActiveJobRole('')}
        >🌐 全部标签</button>
        {Object.values(JOB_ROLES).map((r) => (
          <button
            key={r.key}
            className={activeJobRole === r.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => setActiveJobRole(r.key)}
          >{r.icon} {r.name}</button>
        ))}
      </div>

      {/* Tags by category */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : Object.keys(groupedTags).length > 0 ? (
        Object.entries(groupedTags).map(([category, catTags]) => (
          <div key={category} className="card" style={{ padding: '24px 28px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
              {category}
            </h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {catTags.map((tag) => (
                <span
                  key={tag.id}
                  className="tag tag-muted"
                  style={{ cursor: 'pointer', padding: '6px 14px', fontSize: 13 }}
                  onClick={() => navigate(`/tag/${tag.name}`)}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
                >
                  {tag.name}
                  <span style={{ marginLeft: 6, opacity: 0.5, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    {tag.questionCount || 0}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>
          未找到匹配的标签
        </div>
      )}
    </div>
  );
};

export default TagsPage;
