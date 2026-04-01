import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import request from '../../utils/request';
import { JOB_ROLES, PRACTICE_CATEGORIES } from '../../constants';
import { useUserStore } from '../../stores/userStore';
import type { JobRole } from '../../types';

const CreateBestPractice: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [jobRole, setJobRole] = useState<JobRole>(user?.jobRole || 'rd');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await request.post('/best-practices', { title, description, content, jobRole, category });
      navigate('/practices');
    } catch { /* */ } finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>💡 分享最佳实践</h1>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>标题 *</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="请输入实践标题" style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>简要描述</label>
          <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简要描述这个实践解决的问题和效果" rows={2} style={{ width: '100%', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
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
              {PRACTICE_CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                <option key={c.key} value={c.key}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>详细内容 *</label>
          <div data-color-mode="light">
            <MDEditor value={content} onChange={(v) => setContent(v || '')} height={400} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/practices')}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !title.trim() || !content.trim()}>
            {submitting ? '发布中...' : '发布实践'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBestPractice;
