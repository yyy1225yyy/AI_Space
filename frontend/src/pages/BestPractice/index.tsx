import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BestPracticeCard from '../../components/BestPracticeCard';
import request from '../../utils/request';
import { JOB_ROLES, PRACTICE_CATEGORIES } from '../../constants';
import type { BestPractice, ApiResponse } from '../../types';

const BestPractices: React.FC = () => {
  const navigate = useNavigate();
  const [practices, setPractices] = useState<BestPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'featured'>('latest');
  const [selectedJobRole, setSelectedJobRole] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchPractices = async (p: number, sort: string, jobRole: string, category: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, size: pageSize };
      if (sort !== 'latest') params.sort = sort;
      if (jobRole !== 'all') params.jobRole = jobRole;
      if (category !== 'all') params.category = category;
      const res = await request.get<ApiResponse<{ list: BestPractice[]; total: number }>>('/best-practices', { params });
      setPractices(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPractices(page, sortBy, selectedJobRole, selectedCategory);
  }, [page]);

  const handleSortChange = (sort: 'latest' | 'hot' | 'featured') => {
    setSortBy(sort);
    setPage(1);
    fetchPractices(1, sort, selectedJobRole, selectedCategory);
  };

  const handleJobRoleChange = (role: string) => {
    setSelectedJobRole(role);
    setPage(1);
    fetchPractices(1, sortBy, role, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    fetchPractices(1, sortBy, selectedJobRole, cat);
  };

  const totalPages = Math.ceil(total / pageSize);

  // 热门实践（取当前列表按voteCount排序前5）
  const hotPractices = [...practices].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>💡</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>最佳实践广场</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>分享和学习AI在ERP领域的最佳实践案例</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/practice/create')}>
          + 分享实践
        </button>
      </div>

      {/* Job Role Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([
          { key: 'all', label: '🌐 全部' },
          { key: 'rd', label: `${JOB_ROLES.rd.icon} 研发` },
          { key: 'pm_ops', label: `${JOB_ROLES.pm_ops.icon} 产品运营` },
          { key: 'qa', label: `${JOB_ROLES.qa.icon} 测试` },
        ]).map((tab) => (
          <button
            key={tab.key}
            className={selectedJobRole === tab.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => handleJobRoleChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginRight: 4 }}>分类:</span>
        {PRACTICE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={selectedCategory === cat.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => handleCategoryChange(cat.key)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Sort Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([
          { key: 'latest' as const, label: '最新', icon: '🕐' },
          { key: 'hot' as const, label: '最热', icon: '🔥' },
          { key: 'featured' as const, label: '精选', icon: '⭐' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28 }}>
        {/* Main content */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : practices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {practices.map((p) => <BestPracticeCard key={p.id} practice={p} />)}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ color: 'var(--text-tertiary)' }}>暂无相关实践案例，快来分享第一个</div>
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
          {/* Guide Card */}
          <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(250, 173, 20, 0.06), rgba(250, 140, 22, 0.06))', border: '1px solid rgba(250, 173, 20, 0.15)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>💡 最佳实践指南</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px' }}>分享您在AI应用过程中的成功经验，帮助他人少走弯路</p>
            <ul style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, paddingLeft: 16 }}>
              <li style={{ marginBottom: 4 }}>清晰描述问题背景和解决方案</li>
              <li style={{ marginBottom: 4 }}>提供具体的实施步骤和代码示例</li>
              <li style={{ marginBottom: 4 }}>分享实践效果和经验总结</li>
              <li>标注适用场景和注意事项</li>
            </ul>
          </div>

          {/* Hot Practices */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>🔥 热门实践</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hotPractices.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/practice/${p.id}`)}
                  style={{ cursor: 'pointer', display: 'flex', gap: 8 }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', width: 18, flexShrink: 0 }}>{idx + 1}.</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {p.voteCount || 0} 赞 · {p.viewCount || 0} 浏览
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestPractices;
