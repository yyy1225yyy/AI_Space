import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import request from '../../utils/request';
import { QUESTION_STATUS_MAP, JOB_ROLES } from '../../constants';
import { formatDate } from '../../utils/helpers';
import type { Question, ApiResponse } from '../../types';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await request.get<ApiResponse<{ list: Question[]; total: number }>>(`/search?q=${encodeURIComponent(q.trim())}`);
      setResults(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 从首页跳转过来时自动搜索
  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery);
    }
  }, [initialQuery]);

  const jobRoleInfo = (role: string) => JOB_ROLES[role as keyof typeof JOB_ROLES] || JOB_ROLES.rd;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>
        搜索
      </h1>

      {/* 搜索框 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          className="input"
          placeholder="搜索问题、标签..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch(query)}
          style={{ flex: 1, height: 42, fontSize: 14 }}
        />
        <button className="btn btn-primary" onClick={() => doSearch(query)} style={{ height: 42, padding: '0 24px', fontSize: 14 }}>
          搜索
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>搜索中...</div>
      ) : searched ? (
        <>
          {results.length > 0 ? (
            <>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                找到 <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> 个结果
                {query && (
                  <span> 关键词「<strong style={{ color: 'var(--accent)' }}>{query}</strong>」</span>
                )}
              </div>
              {results.map((q) => {
                const jobRole = jobRoleInfo(q.jobRole);
                const keyword = (query || '').trim().toLowerCase();

                return (
                  <div
                    key={q.id}
                    className="card"
                    style={{ padding: '16px 20px', marginBottom: 12, cursor: 'pointer' }}
                    onClick={() => navigate(`/question/${q.id}`)}
                  >
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
                      {q.title}
                    </h3>
                    {/* 标签 */}
                    {Array.isArray(q.tags) && q.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                        {q.tags.map((t: any) => {
                          const matched = keyword && t.name && t.name.toLowerCase().includes(keyword);
                          return (
                            <span
                              key={t.id || t.name}
                              style={{
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: matched ? 600 : 400,
                                background: matched ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                                color: matched ? 'var(--accent)' : 'var(--text-secondary)',
                                border: matched ? '1px solid var(--accent)' : '1px solid var(--border)',
                              }}
                            >
                              {t.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
                      <span>{jobRole?.icon} {jobRole?.name}</span>
                      <span>{q.voteCount || 0} 投票</span>
                      <span>{q.answerCount || 0} 回答</span>
                      <span>{q.viewCount || 0} 浏览</span>
                      <span>{formatDate(q.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>?</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>未找到相关结果</div>
              <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>试试其他关键词</div>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>?</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>输入关键词开始搜索</div>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>搜索问题标题、内容和标签</div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
