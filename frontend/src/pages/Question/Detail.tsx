import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RichEditor from '../../components/RichEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import request from '../../utils/request';
import { useUserStore } from '../../stores/userStore';
import { JOB_ROLES, QUESTION_STATUS_MAP, QUESTION_LEVELS } from '../../constants';
import { formatDate } from '../../utils/helpers';
import { toast } from '../../utils/toast';
import type { Question, Answer, Comment, ApiResponse } from '../../types';

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [answerContent, setAnswerContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentImageUrl, setCommentImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [solutionType, setSolutionType] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentShowCount, setCommentShowCount] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const qRes = await request.get<ApiResponse<Question>>(`/questions/${id}`);
        setQuestion(qRes.data.data);
        const aRes = await request.get<ApiResponse<Answer[]>>(`/questions/${id}/answers`);
        setAnswers(aRes.data.data || []);
        const cRes = await request.get<ApiResponse<Comment[]>>('/comments', { params: { targetId: id, targetType: 'question' } });
        setComments(cRes.data.data || []);
      } catch { /* */ } finally { setLoading(false); }
    };
    if (id) fetchData();
  }, [id]);

  const handleAnswer = async () => {
    if (!answerContent.trim()) return;
    try {
      await request.post(`/questions/${id}/answers`, { content: answerContent, solutionType: solutionType || undefined });
      toast.success('回答成功');
      setAnswerContent(''); setSolutionType('');
      const aRes = await request.get<ApiResponse<Answer[]>>(`/questions/${id}/answers`);
      setAnswers(aRes.data.data || []);
    } catch (err: unknown) { toast.error((err as Error).message || '回答失败'); }
  };

  const handleAccept = async (answerId: number) => {
    try {
      await request.put(`/answers/${answerId}/accept`);
      toast.success('已采纳');
      const aRes = await request.get<ApiResponse<Answer[]>>(`/questions/${id}/answers`);
      setAnswers(aRes.data.data || []);
      const qRes = await request.get<ApiResponse<Question>>(`/questions/${id}`);
      setQuestion(qRes.data.data);
    } catch (err: unknown) { toast.error((err as Error).message || '操作失败'); }
  };

  const handleComment = async () => {
    if (!commentContent.trim() && !commentImageUrl) return;
    try {
      const content = commentContent + (commentImageUrl ? `\n<img src="${commentImageUrl}" style="max-width:100%;border-radius:4px;margin-top:4px" />` : '');
      await request.post('/comments', { targetId: id, targetType: 'question', content });
      toast.success('评论成功');
      setCommentContent('');
      setCommentImageUrl('');
      const cRes = await request.get<ApiResponse<Comment[]>>('/comments', { params: { targetId: id, targetType: 'question' } });
      setComments(cRes.data.data || []);
    } catch (err: unknown) { toast.error((err as Error).message || '评论失败'); }
  };

  const handleVote = async (targetId: number, targetType: string, voteType: string) => {
    if (!isLoggedIn) { toast.error('请先登录'); return; }
    try {
      await request.post('/votes', { targetId, targetType, voteType });
      // Refresh question or answers
      if (targetType === 'question') {
        const qRes = await request.get<ApiResponse<Question>>(`/questions/${id}`, { params: { incrementView: false } });
        setQuestion(qRes.data.data);
      } else {
        const aRes = await request.get<ApiResponse<Answer[]>>(`/questions/${id}/answers`);
        setAnswers(aRes.data.data || []);
      }
    } catch (err: unknown) { toast.error((err as Error).message || '操作失败'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 0' }}>
      <div className="spinner spinner-lg" />
    </div>
  );
  if (!question) return (
    <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>问题不存在</div>
  );

  const statusInfo = QUESTION_STATUS_MAP[question.status as keyof typeof QUESTION_STATUS_MAP];
  const jobRoleInfo = JOB_ROLES[question.jobRole as keyof typeof JOB_ROLES] || JOB_ROLES.rd;
  const levelInfo = QUESTION_LEVELS.find((l) => l.key === question.level);

  const statusColors: Record<string, string> = {
    open: 'var(--accent)', answered: 'var(--green)', solved: 'var(--green)', closed: 'var(--text-tertiary)',
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* Question */}
      <div className="card animate-fade-up" style={{ padding: '28px 32px', marginBottom: 16 }}>
        {/* Question content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0, flex: '1 1 auto', lineHeight: 1.4 }}>
              {question.title}
            </h1>
            {statusInfo && (
              <span className="tag" style={{ background: `${statusColors[question.status]}15`, color: statusColors[question.status], border: `1px solid ${statusColors[question.status]}30` }}>
                {statusInfo.name}
              </span>
            )}
            {question.bountyPoints > 0 && (
              <span className="tag tag-orange">悬赏 {question.bountyPoints}pts</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span className="tag tag-cyan">{jobRoleInfo.icon} {jobRoleInfo.name}</span>
            {levelInfo && <span style={{ fontSize: 12, fontWeight: 600, color: levelInfo.color }}>{levelInfo.name}</span>}
            {question.tags?.map((tag) => <span key={tag.id} className="tag tag-muted">{tag.name}</span>)}
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{question.viewCount || 0} views · {formatDate(question.createdAt)}</span>
          </div>

          <div className="markdown-body" style={{ lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: 20 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{question.content}</ReactMarkdown>
          </div>

          {question.user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
              <div className="avatar" style={{ width: 28, height: 28, fontSize: 12, background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                {question.user.username?.charAt(0)?.toUpperCase()}
              </div>
              <span style={{ fontWeight: 600 }}>{question.user.username}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>提问于 {formatDate(question.createdAt)}</span>
            </div>
          )}

          {/* Action bar: like, dislike, views, answers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }} onClick={() => handleVote(question.id, 'question', 'up')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
              点赞 ({question.likeCount || 0})
            </button>
            <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }} onClick={() => handleVote(question.id, 'question', 'down')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14v2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>
              踩 ({question.dislikeCount || 0})
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-tertiary)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              {question.viewCount || 0} 浏览
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-tertiary)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
              {question.answerCount || 0} 回答
            </span>
          </div>
        </div>

        {/* Comments */}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 24, paddingTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 }}>
            评论 ({comments.length})
          </h3>
          <div style={{ maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
            {comments.slice(0, commentShowCount).map((c) => (
              <div key={c.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="avatar" style={{ width: 24, height: 24, fontSize: 10, background: 'var(--bg-hover)', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {c.user?.username?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{c.user?.username}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>{formatDate(c.createdAt)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, wordBreak: 'break-word' }}>{c.content.replace(/<img\s[^>]*src="([^"]*)"[^>]*\/?>/g, '')}</p>
                  {(() => {
                    const imgRegex = /<img\s[^>]*src="([^"]*)"[^>]*\/?>/g;
                    const imgs: string[] = [];
                    let match;
                    while ((match = imgRegex.exec(c.content)) !== null) {
                      imgs.push(match[1]);
                    }
                    return imgs.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="评论图片"
                        onClick={() => setPreviewImage(src)}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', margin: '4px 0 0', display: 'block' }}
                      />
                    ));
                  })()}
                </div>
              </div>
            ))}
          </div>
          {commentShowCount < comments.length && (
            <div style={{ textAlign: 'center', paddingTop: 10 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCommentShowCount((n) => n + 10)}
                style={{ fontSize: 12, color: 'var(--accent)' }}
              >
                加载更多评论（还有 {comments.length - commentShowCount} 条）
              </button>
            </div>
          )}
          {isLoggedIn && (
            <div style={{ marginTop: 14 }}>
              {commentImageUrl && (
                <div style={{ marginBottom: 8, position: 'relative', display: 'inline-block' }}>
                  <img src={commentImageUrl} alt="preview" style={{ maxWidth: 200, maxHeight: 120, borderRadius: 4, border: '1px solid var(--border)' }} />
                  <button
                    onClick={() => setCommentImageUrl('')}
                    style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'var(--red)', color: '#fff', fontSize: 12, cursor: 'pointer', lineHeight: '18px', textAlign: 'center' }}
                  >×</button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-ghost btn-icon"
                  title="插入图片"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async () => {
                      const file = input.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const res = await request.post<{ code: number; data: { url: string } }>('/upload/image', formData);
                        if (res.data.data?.url) setCommentImageUrl(res.data.data.url);
                      } catch { toast.error('上传失败'); }
                    };
                    input.click();
                  }}
                  style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </button>
                <input
                  className="input"
                  placeholder="发表评论..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  style={{ flex: 1, height: 38 }}
                />
                <button className="btn btn-primary btn-sm" onClick={handleComment}>评论</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Answers */}
      <div className="card animate-fade-up" style={{ padding: '28px 32px', marginBottom: 16, animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
          回答 ({answers.length})
        </h2>

        {answers.map((answer) => (
          <div
            key={answer.id}
            style={{
              padding: '20px 0',
              borderBottom: '1px solid var(--border)',
              background: answer.isAccepted ? 'rgba(0, 229, 160, 0.03)' : 'transparent',
              borderRadius: answer.isAccepted ? 'var(--radius-md)' : 0,
            }}
          >
            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div className="avatar" style={{ width: 26, height: 26, fontSize: 11, background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                  {answer.user?.username?.charAt(0)?.toUpperCase()}
                </div>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{answer.user?.username}</span>
                {answer.user?.levelName && <span className="tag tag-cyan" style={{ fontSize: 10 }}>{answer.user.levelName}</span>}
                {answer.solutionType && <span className="tag tag-muted" style={{ fontSize: 10 }}>{answer.solutionType}</span>}
                {answer.isAccepted && (
                  <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    已采纳
                  </span>
                )}
              </div>
              <div className="markdown-body" style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{answer.content}</ReactMarkdown>
              </div>
              {/* Answer action bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }} onClick={() => handleVote(answer.id, 'answer', 'up')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                  点赞 ({answer.likeCount || 0})
                </button>
                <button className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }} onClick={() => handleVote(answer.id, 'answer', 'down')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14v2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>
                  踩 ({answer.dislikeCount || 0})
                </button>
                <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{formatDate(answer.createdAt)}</span>
                {question?.userId === user?.id && !answer.isAccepted && question.status !== 'solved' && (
                  <button className="btn btn-success btn-sm" onClick={() => handleAccept(answer.id)} style={{ marginLeft: 'auto' }}>采纳此回答</button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Answer form */}
        {isLoggedIn && question.status !== 'closed' && (
          <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>撰写回答</h3>
            <div style={{ marginBottom: 12 }}>
              <select className="select" value={solutionType} onChange={(e) => setSolutionType(e.target.value)} style={{ maxWidth: 220 }}>
                <option value="">解决方案类型（选填）</option>
                <option value="skill">Skill方案</option>
                <option value="file">项目文件</option>
                <option value="feasibility">可行性方案</option>
                <option value="experience">经验分享</option>
              </select>
            </div>
            <RichEditor
              content={answerContent}
              onChange={(val) => setAnswerContent(val)}
              placeholder="请输入您的回答，支持 Markdown 格式..."
              height={200}
            />
            <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleAnswer}>提交回答</button>
          </div>
        )}
      </div>

      {/* 图片预览弹窗 */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage('')}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <img src={previewImage} alt="预览" style={{ display: 'block', maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }} />
            <button onClick={() => setPreviewImage('')} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', color: '#333', fontSize: 18, cursor: 'pointer', lineHeight: '28px', textAlign: 'center' }}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetail;
