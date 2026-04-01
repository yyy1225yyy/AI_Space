import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleCard from '../../components/ArticleCard';
import request from '../../utils/request';
import { JOB_ROLES, ARTICLE_CATEGORIES } from '../../constants';
import type { Article, ApiResponse } from '../../types';

const Knowledge: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'hot' | 'featured'>('latest');
  const [selectedJobRole, setSelectedJobRole] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchArticles = async (p: number, sort: string, jobRole: string, category: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, size: pageSize };
      if (sort !== 'latest') params.sort = sort;
      if (jobRole !== 'all') params.jobRole = jobRole;
      if (category !== 'all') params.category = category;
      const res = await request.get<ApiResponse<{ list: Article[]; total: number }>>('/articles', { params });
      setArticles(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchArticles(page, sortBy, selectedJobRole, selectedCategory);
    // 加载精选文章
    request.get<ApiResponse<Article[]>>('/articles/featured').then(res => {
      setFeaturedArticles(res.data.data || []);
    }).catch(() => {});
  }, [page]);

  const handleSortChange = (sort: 'latest' | 'hot' | 'featured') => {
    setSortBy(sort);
    setPage(1);
    fetchArticles(1, sort, selectedJobRole, selectedCategory);
  };

  const handleJobRoleChange = (role: string) => {
    setSelectedJobRole(role);
    setPage(1);
    fetchArticles(1, sortBy, role, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    fetchArticles(1, sortBy, selectedJobRole, cat);
  };

  const totalPages = Math.ceil(total / pageSize);

  // 热门文章
  const hotArticles = [...articles].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 28 }}>📖</span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>知识广场</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>探索AI领域的深度知识和前沿技术</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/article/create')}>
          + 发布文章
        </button>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && sortBy === 'latest' && selectedJobRole === 'all' && selectedCategory === 'all' && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⭐ 精选文章
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {featuredArticles.slice(0, 3).map((a) => <ArticleCard key={a.id} article={a} variant="featured" />)}
          </div>
        </div>
      )}

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
        {ARTICLE_CATEGORIES.map((cat) => (
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
          ) : articles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ color: 'var(--text-tertiary)' }}>暂无相关文章，快来发布第一篇</div>
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
          {/* Writing Guide */}
          <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.06), rgba(102, 51, 255, 0.06))', border: '1px solid rgba(24, 144, 255, 0.15)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>📖 创作指南</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px' }}>分享您的知识和见解，帮助社区成员共同成长</p>
            <ul style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, paddingLeft: 16 }}>
              <li style={{ marginBottom: 4 }}>选择合适的文章类型和主题</li>
              <li style={{ marginBottom: 4 }}>内容结构清晰，逻辑严谨</li>
              <li style={{ marginBottom: 4 }}>配合代码示例和图表说明</li>
              <li>注明参考资料和延伸阅读</li>
            </ul>
          </div>

          {/* Hot Articles */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>🔥 热门文章</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hotArticles.map((a, idx) => (
                <div
                  key={a.id}
                  onClick={() => navigate(`/article/${a.id}`)}
                  style={{ cursor: 'pointer', display: 'flex', gap: 8 }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-tertiary)', width: 18, flexShrink: 0 }}>{idx + 1}.</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {a.viewCount || 0} 阅读 · {a.readTime || 5} 分钟
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Stats */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>📊 文章分类</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ARTICLE_CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                <div
                  key={cat.key}
                  onClick={() => handleCategoryChange(cat.key)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{cat.icon} {cat.name}</span>
                  <span className="tag tag-muted" style={{ fontSize: 11 }}>{articles.filter((a) => a.category === cat.key).length}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
