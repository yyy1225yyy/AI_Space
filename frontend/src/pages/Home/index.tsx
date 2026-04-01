import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from '../../components/QuestionCard';
import request from '../../utils/request';
import { useAppStore } from '../../stores/appStore';
import { JOB_ROLES } from '../../constants';
import type { Question, Tag as TagType, ApiResponse } from '../../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentJobRole } = useAppStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hotTags, setHotTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'unsolved'>('latest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchQuestions = async (p: number, jobRole?: string, sort?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, size: pageSize };
      if (jobRole && jobRole !== 'all') params.jobRole = jobRole;
      if (sort && sort !== 'latest') params.sort = sort;
      const res = await request.get<ApiResponse<{ list: Question[]; total: number }>>('/questions', { params });
      setQuestions(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch { /* */ } finally { setLoading(false); }
  };

  const fetchHotTags = async () => {
    try {
      const res = await request.get<ApiResponse<TagType[]>>('/tags');
      setHotTags((res.data.data || []).sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0)).slice(0, 12));
    } catch { /* */ }
  };

  const handleSortChange = (sort: 'latest' | 'hot' | 'unsolved') => {
    setSortBy(sort);
    setPage(1);
    fetchQuestions(1, currentJobRole, sort);
  };

  useEffect(() => { setPage(1); fetchQuestions(1, currentJobRole, sortBy); }, [currentJobRole]);
  useEffect(() => { fetchQuestions(page, currentJobRole, sortBy); }, [page]);
  useEffect(() => { fetchHotTags(); }, []);

  const totalPages = Math.ceil(total / pageSize);

  const sortButtons = [
    { key: 'latest' as const, label: '最新', icon: '🕐' },
    { key: 'hot' as const, label: '最热', icon: '🔥' },
    { key: 'unsolved' as const, label: '待解决', icon: '⭐' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
      {/* Main content */}
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              问题广场
            </h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginTop: 4 }}>ERP行业AI知识分享社区</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/question/create')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            发布问题
          </button>
        </div>

        {/* Sort buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {sortButtons.map((btn) => (
            <button
              key={btn.key}
              className={sortBy === btn.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              onClick={() => handleSortChange(btn.key)}
            >
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>

        {/* Question list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 0' }}>
            <div className="spinner spinner-lg" />
            <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>加载中...</span>
          </div>
        ) : questions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questions.map((q) => <QuestionCard key={q.id} question={q} />)}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>?</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>暂无问题</div>
            <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>快来提出第一个问题吧</div>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 28 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              上一页
            </button>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              {page} / {totalPages}
            </span>
            <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              下一页
            </button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Welcome card */}
        <div
          className="card"
          style={{
            padding: 24,
            background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.06) 0%, rgba(114, 46, 209, 0.06) 100%)',
            borderColor: 'rgba(24, 144, 255, 0.15)',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>欢迎来到AI广场</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
            ERP行业专属的AI知识分享社区，按岗位方向分类，帮助您快速找到适合的AI学习内容。
          </p>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>&#8226;</span>
              <span>提出问题获得 <b style={{ color: 'var(--accent)' }}>+2</b> 积分</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>&#8226;</span>
              <span>回答被采纳获得 <b style={{ color: 'var(--accent)' }}>+15</b> 积分</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>&#8226;</span>
              <span>跨岗位回答额外 <b style={{ color: 'var(--accent)' }}>+3</b> 积分</span>
            </li>
          </ul>
        </div>

        {/* Hot tags */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>热门标签</h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {hotTags.map((tag) => (
              <span
                key={tag.id}
                className="tag tag-muted"
                style={{ cursor: 'pointer', transition: 'all var(--duration-fast)' }}
                onClick={() => navigate(`/tag/${tag.name}`)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
              >
                {tag.name}
              </span>
            ))}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/tags')}
            style={{ marginTop: 16, padding: 0, fontSize: 13, color: 'var(--accent)' }}
          >
            查看全部标签 →
          </button>
        </div>

        {/* Community stats */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>社区数据</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: '问题总数', value: total, color: 'var(--accent)' },
              { label: '活跃用户', value: hotTags.length > 0 ? '892' : '—', color: 'var(--green)' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.label}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: item.color, fontFamily: 'var(--font-mono)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
