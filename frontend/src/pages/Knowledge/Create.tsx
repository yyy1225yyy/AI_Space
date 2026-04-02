import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RichEditor from '../../components/RichEditor';
import request from '../../utils/request';
import { JOB_ROLES, ARTICLE_CATEGORIES } from '../../constants';
import { useUserStore } from '../../stores/userStore';
import { toast } from '../../utils/toast';
import type { JobRole } from '../../types';

const CreateArticle: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [jobRole, setJobRole] = useState<JobRole>(user?.jobRole || 'rd');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await request.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCoverImage(res.data.data?.url || res.data.data || '');
    } catch { /* */ }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('请输入标题'); return; }
    if (!content.trim() || content === '<p></p>') { toast.error('请输入文章内容'); return; }
    setSubmitting(true);
    try {
      await request.post('/articles', { title, summary, coverImage, content, jobRole, category, readTime });
      toast.success('发布成功');
      navigate('/knowledge');
    } catch { toast.error('发布失败'); } finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>📖 发布文章</h1>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>标题 *</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入文章标题" style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>摘要</label>
          <textarea className="input" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="简要概括文章内容" rows={2} style={{ width: '100%', resize: 'vertical' }} />
        </div>

        {/* Cover Image */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>封面图</label>
          {coverImage ? (
            <div style={{ position: 'relative', width: '100%', maxWidth: 400, height: 200, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 8 }}>
              <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => setCoverImage('')}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
              >
                移除
              </button>
            </div>
          ) : (
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 400, height: 120, border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 13 }}>
              <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
              📷 点击上传封面图
            </label>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>岗位方向 *</label>
            <select className="input" value={jobRole} onChange={(e) => setJobRole(e.target.value as JobRole)} style={{ width: '100%' }}>
              {Object.entries(JOB_ROLES).map(([key, info]) => (
                <option key={key} value={key}>{info.icon} {info.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>分类</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%' }}>
              <option value="">请选择</option>
              {ARTICLE_CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                <option key={c.key} value={c.key}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>预估阅读(分钟)</label>
            <input className="input" type="number" min={1} max={120} value={readTime} onChange={(e) => setReadTime(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>文章内容 *</label>
          <RichEditor
            content={content}
            onChange={(val) => setContent(val)}
            placeholder="请输入文章内容，支持富文本格式..."
            height={400}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/knowledge')}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !title.trim() || !content.trim()}>
            {submitting ? '发布中...' : '发布文章'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
