import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RichEditor from '../../components/RichEditor';
import request from '../../utils/request';
import { JOB_ROLES, QUESTION_LEVELS } from '../../constants';
import { toast } from '../../utils/toast';
import type { Tag as TagType, ApiResponse } from '../../types';

const CreateQuestion: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', jobRole: '', level: 'medium', content: '', bountyPoints: 0 });
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'jobRole' && typeof value === 'string') {
      fetchTags(value);
    }
  };

  const fetchTags = async (jobRole: string) => {
    try {
      const res = await request.get<ApiResponse<TagType[]>>('/tags', { params: { jobRole } });
      setTags(res.data.data || []);
      setSelectedTags([]);
    } catch { /* */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || form.title.length < 5) { toast.error('标题至少5个字符'); return; }
    if (!form.jobRole) { toast.error('请选择岗位方向'); return; }
    if (!form.content) { toast.error('请输入问题描述'); return; }
    setLoading(true);
    try {
      await request.post('/questions', { ...form, bountyPoints: form.bountyPoints || 0, tags: selectedTags });
      toast.success('发布成功');
      navigate('/');
    } catch (err: unknown) {
      toast.error((err as Error).message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <div className="card" style={{ padding: '32px 36px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28 }}>
          发布问题
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">标题 *</label>
            <input
              className="input"
              placeholder="请输入问题标题，至少5个字符"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">岗位方向 *</label>
              <select
                className="select"
                value={form.jobRole}
                onChange={(e) => handleChange('jobRole', e.target.value)}
              >
                <option value="">请选择岗位方向</option>
                {Object.values(JOB_ROLES).map((r) => (
                  <option key={r.key} value={r.key}>{r.icon} {r.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">问题等级</label>
              <select
                className="select"
                value={form.level}
                onChange={(e) => handleChange('level', e.target.value)}
              >
                {QUESTION_LEVELS.map((l) => (
                  <option key={l.key} value={l.key}>{l.name}（+{l.bonusPoints}积分）</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tag selector */}
          {tags.length > 0 && (
            <div className="form-group">
              <label className="form-label">标签</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.name);
                  return (
                    <span
                      key={tag.id}
                      onClick={() => setSelectedTags((prev) =>
                        isSelected ? prev.filter((t) => t !== tag.name) : [...prev, tag.name]
                      )}
                      style={{
                        cursor: 'pointer',
                        padding: '5px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 12,
                        fontWeight: 500,
                        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                        color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                        transition: 'all var(--duration-fast)',
                        userSelect: 'none',
                      }}
                    >
                      {tag.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">悬赏积分</label>
            <input
              className="input"
              type="number"
              min={0}
              max={1000}
              placeholder="设置悬赏积分（选填）"
              value={form.bountyPoints || ''}
              onChange={(e) => handleChange('bountyPoints', parseInt(e.target.value) || 0)}
              style={{ maxWidth: 200 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">问题描述 *</label>
            <RichEditor
              content={form.content}
              onChange={(val) => handleChange('content', val)}
              placeholder="请详细描述您的问题，支持 Markdown 格式..."
              height={300}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? '发布中...' : '发布问题'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestion;
