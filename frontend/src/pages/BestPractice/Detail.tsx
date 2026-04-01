import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import { JOB_ROLES, PRACTICE_CATEGORIES } from '../../constants';
import { formatDate } from '../../utils/helpers';
import type { BestPractice, Comment, ApiResponse } from '../../types';
import ReactMarkdown from 'react-markdown';

const BestPracticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [practice, setPractice] = useState<BestPractice | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    if (!id) return;
    request.get<ApiResponse<BestPractice>>(`/best-practices/${id}`).then(res => {
      setPractice(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    request.get<ApiResponse<Comment[]>>('/comments', { params: { targetId: id, targetType: 'practice' } }).then(res => {
      setComments(res.data.data || []);
    }).catch(() => {});
  }, [id]);

  const handleComment = async () => {
    if (!commentContent.trim() || !id) return;
    try {
      await request.post('/comments', { targetId: id, targetType: 'practice', content: commentContent });
      setCommentContent('');
      const res = await request.get<ApiResponse<Comment[]>>('/comments', { params: { targetId: id, targetType: 'practice' } });
      setComments(res.data.data || []);
    } catch { /* */ }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner spinner-lg" /></div>;
  }

  if (!practice) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
        <div style={{ color: 'var(--text-secondary)' }}>实践案例不存在</div>
      </div>
    );
  }

  const jobRoleInfo = JOB_ROLES[practice.jobRole as keyof typeof JOB_ROLES];
  const categoryInfo = PRACTICE_CATEGORIES.find((c) => c.key === practice.category);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <div className="card" style={{ padding: 32 }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {practice.isFeatured && (
            <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(250, 173, 20, 0.12)', color: '#faad14', border: '1px solid rgba(250, 173, 20, 0.25)', fontSize: 12, fontWeight: 600 }}>⭐ 精选</span>
          )}
          <span className="tag tag-cyan">{jobRoleInfo.icon} {jobRoleInfo.name}</span>
          {categoryInfo && categoryInfo.key !== 'all' && (
            <span className="tag tag-muted">{categoryInfo.icon} {categoryInfo.name}</span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.4 }}>
          {practice.title}
        </h1>

        {/* Description */}
        {practice.description && (
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.6 }}>
            {practice.description}
          </p>
        )}

        {/* Author + Stats */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => navigate(`/user/${practice.user?.id}`)}
          >
            <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: 'var(--accent-glow)', color: 'var(--accent)' }}>
              {practice.user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{practice.user?.username}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{practice.user?.department} · {formatDate(practice.createdAt)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-tertiary)' }}>
            <span>👁 {practice.viewCount || 0}</span>
            <span>👍 {practice.voteCount || 0}</span>
            <span>💬 {practice.commentCount || 0}</span>
          </div>
        </div>

        {/* Content (Markdown) */}
        <div className="markdown-body" style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)' }}>
          <ReactMarkdown>{practice.content}</ReactMarkdown>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-primary btn-sm">👍 点赞 ({practice.voteCount || 0})</button>
          <button className="btn btn-ghost btn-sm">🔖 收藏</button>
          <button className="btn btn-ghost btn-sm">↗ 分享</button>
        </div>
      </div>

      {/* Comments */}
      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          💬 评论 ({comments.length})
        </h3>
        <div style={{ marginBottom: 16 }}>
          <textarea
            className="input"
            placeholder="分享您的看法..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={3}
            style={{ width: '100%', resize: 'vertical', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-sm" onClick={handleComment}>发布评论</button>
          </div>
        </div>
        {comments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.map((c) => (
              <div key={c.id} style={{ display: 'flex', gap: 10, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 14, background: 'var(--accent-glow)', color: 'var(--accent)', flexShrink: 0 }}>
                  {c.user?.username?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.user?.username}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatDate(c.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.content}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)', fontSize: 13 }}>暂无评论</div>
        )}
      </div>
    </div>
  );
};

export default BestPracticeDetail;
