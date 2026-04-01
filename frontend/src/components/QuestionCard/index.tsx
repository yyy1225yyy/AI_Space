import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '../../types';
import { QUESTION_STATUS_MAP, JOB_ROLES } from '../../constants';
import { formatDate, formatNumber, getQuestionLevelInfo } from '../../utils/helpers';

interface Props {
  question: Question;
}

const QuestionCard: React.FC<Props> = ({ question }) => {
  const navigate = useNavigate();
  const statusInfo = QUESTION_STATUS_MAP[question.status as keyof typeof QUESTION_STATUS_MAP];
  const levelInfo = getQuestionLevelInfo(question.level);
  const jobRoleInfo = JOB_ROLES[question.jobRole as keyof typeof JOB_ROLES] || JOB_ROLES.rd;

  // 从 content 中提取纯文本预览（去掉 HTML 标签）
  const plainContent = question.content?.replace(/<[^>]*>/g, '').slice(0, 120) || '';

  // 从 content 中提取图片 URL
  const imageUrls: string[] = [];
  if (question.content) {
    const imgRegex = /<img\s[^>]*src="([^"]*)"[^>]*\/?>/g;
    let match;
    while ((match = imgRegex.exec(question.content)) !== null) {
      imageUrls.push(match[1]);
    }
  }

  return (
    <div
      className="card card-hover animate-fade-up"
      onClick={() => navigate(`/question/${question.id}`)}
      style={{ display: 'flex', cursor: 'pointer', padding: '20px 24px', gap: 16 }}
    >
      {/* User Avatar */}
      <div
        className="avatar"
        onClick={(e) => { e.stopPropagation(); navigate(`/user/${question.user?.id}`); }}
        style={{
          width: 48,
          height: 48,
          fontSize: 18,
          background: 'var(--accent-glow)',
          color: 'var(--accent)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {question.user?.username?.charAt(0)?.toUpperCase()}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ flex: 1 }}>{question.title}</span>
          {question.status === 'solved' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 10px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 200, 83, 0.1)', color: 'var(--green)',
              border: '1px solid rgba(0, 200, 83, 0.25)',
              fontSize: 12, fontWeight: 600, flexShrink: 0,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              已解决
            </span>
          )}
        </h3>

        {/* Content preview */}
        {plainContent && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {plainContent}
          </p>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span className="tag tag-cyan">{jobRoleInfo.icon} {jobRoleInfo.name}</span>
          {levelInfo && (
            <span className="tag" style={{ background: `${levelInfo.color}10`, color: levelInfo.color, border: `1px solid ${levelInfo.color}25`, fontSize: 11 }}>
              {levelInfo.name}
            </span>
          )}
          {question.tags?.map((tag) => (
            <span key={tag.id} className="tag tag-muted">{tag.name}</span>
          ))}
          {question.bountyPoints > 0 && (
            <span className="tag tag-orange">悬赏 {question.bountyPoints}pts</span>
          )}
        </div>

        {/* Meta info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{question.user?.username}</span>
          <span>&#183;</span>
          <span>{formatDate(question.createdAt)}</span>
        </div>

        {/* Image thumbnails */}
        {imageUrls.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            {imageUrls.slice(0, 3).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                }}
              />
            ))}
            {imageUrls.length > 3 && (
              <div style={{
                width: 60, height: 60, borderRadius: 6, border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: 'var(--text-tertiary)', background: 'var(--bg-elevated)',
              }}>
                +{imageUrls.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, minWidth: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-tertiary)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>{formatNumber(question.viewCount || 0)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-tertiary)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
          <span>{question.answerCount || 0}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: question.voteCount > 0 ? 'var(--accent)' : 'var(--text-tertiary)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
          <span style={{ fontWeight: 600 }}>{question.voteCount || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
