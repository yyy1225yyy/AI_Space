import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Article } from '../../types';
import { JOB_ROLES, ARTICLE_CATEGORIES } from '../../constants';
import { formatDate, formatNumber } from '../../utils/helpers';

interface Props {
  article: Article;
  variant?: 'default' | 'featured';
}

const ArticleCard: React.FC<Props> = ({ article, variant = 'default' }) => {
  const navigate = useNavigate();
  const jobRoleInfo = JOB_ROLES[article.jobRole as keyof typeof JOB_ROLES];
  const categoryInfo = ARTICLE_CATEGORIES.find((c) => c.key === article.category);

  // 精选卡片样式（带封面图）
  if (variant === 'featured' && article.coverImage) {
    return (
      <div
        className="card card-hover animate-fade-up"
        onClick={() => navigate(`/article/${article.id}`)}
        style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}
      >
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <img
            src={article.coverImage}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {article.isFeatured && (
            <span style={{
              position: 'absolute', top: 12, right: 12,
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 10px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(250, 173, 20, 0.9)', color: '#fff',
              fontSize: 11, fontWeight: 600,
            }}>⭐ 精选</span>
          )}
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <span className="tag tag-cyan">{jobRoleInfo.icon} {jobRoleInfo.name}</span>
            {categoryInfo && categoryInfo.key !== 'all' && (
              <span className="tag tag-muted">{categoryInfo.icon} {categoryInfo.name}</span>
            )}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.title}
          </h3>
          {article.summary && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {article.summary}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-tertiary)' }}>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{article.user?.username}</span>
            <div style={{ display: 'flex', gap: 12 }}>
              <span>{article.readTime || 5} 分钟</span>
              <span>{formatNumber(article.viewCount || 0)} 阅读</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 默认列表卡片
  return (
    <div
      className="card card-hover animate-fade-up"
      onClick={() => navigate(`/article/${article.id}`)}
      style={{ display: 'flex', cursor: 'pointer', padding: '20px 24px', gap: 16 }}
    >
      {/* User Avatar */}
      <div
        className="avatar"
        onClick={(e) => { e.stopPropagation(); navigate(`/user/${article.user?.id}`); }}
        style={{
          width: 48, height: 48, fontSize: 18,
          background: 'var(--accent-glow)', color: 'var(--accent)',
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        {article.user?.username?.charAt(0)?.toUpperCase()}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          {article.isFeatured && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 2,
              padding: '1px 8px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(250, 173, 20, 0.12)', color: '#faad14',
              border: '1px solid rgba(250, 173, 20, 0.25)',
              fontSize: 11, fontWeight: 600, flexShrink: 0,
            }}>⭐ 精选</span>
          )}
          <span style={{ flex: 1 }}>{article.title}</span>
        </h3>

        {article.summary && (
          <p style={{
            fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px',
            lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {article.summary}
          </p>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span className="tag tag-cyan">{jobRoleInfo.icon} {jobRoleInfo.name}</span>
          {categoryInfo && categoryInfo.key !== 'all' && (
            <span className="tag tag-muted">{categoryInfo.icon} {categoryInfo.name}</span>
          )}
          <span className="tag tag-muted">⏱ {article.readTime || 5}分钟</span>
        </div>

        {/* Meta info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{article.user?.username}</span>
          <span>&#183;</span>
          <span>{formatDate(article.createdAt)}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, minWidth: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-tertiary)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>{formatNumber(article.viewCount || 0)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: article.voteCount > 0 ? 'var(--accent)' : 'var(--text-tertiary)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
          <span style={{ fontWeight: 600 }}>{formatNumber(article.voteCount || 0)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-tertiary)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
          <span>{article.commentCount || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
