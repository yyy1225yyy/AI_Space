import React, { useState, useEffect } from 'react';
import request from '../../utils/request';
import { useUserStore } from '../../stores/userStore';
import { useNavigate } from 'react-router-dom';
import { JOB_ROLES, LEVEL_CONFIG } from '../../constants';
import { toast } from '../../utils/toast';
import type { ApiResponse, User } from '../../types';

const ProfilePage: React.FC = () => {
  const { user, isLoggedIn, setUser } = useUserStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', phone: '', department: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await request.get<ApiResponse<User>>('/users/me');
        const u = res.data.data;
        setUser(u);
        setForm({ email: u.email || '', phone: u.phone || '', department: u.department || '', bio: u.bio || '' });
      } catch { /* */ } finally { setLoading(false); }
    };
    if (isLoggedIn) fetchUser();
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await request.put<ApiResponse<User>>('/users/me', form);
      setUser(res.data.data);
      toast.success('更新成功');
    } catch (err: unknown) {
      toast.error((err as Error).message || '更新失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner spinner-lg" />
    </div>
  );
  if (!user) return (
    <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-tertiary)' }}>请先登录</div>
  );

  const jobRoleInfo = JOB_ROLES[user.jobRole as keyof typeof JOB_ROLES] || JOB_ROLES.rd;
  const currentLevel = LEVEL_CONFIG.find(l => l.level === user.level);
  const nextLevel = LEVEL_CONFIG.find(l => l.level === user.level + 1);
  const progressPercent = nextLevel && currentLevel
    ? Math.round(((user.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100)
    : 100;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="card animate-fade-up" style={{ padding: 36 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {/* Avatar */}
          <div className="avatar" style={{
            width: 120, height: 120, fontSize: 44,
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
            color: '#fff', flexShrink: 0, border: '4px solid var(--border)',
          }}>
            {user.username?.charAt(0)?.toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {user.username}
              </h2>
              <span className="tag tag-cyan" style={{ fontSize: 12, padding: '4px 12px' }}>{jobRoleInfo.icon} {jobRoleInfo.name}</span>
              <span className="tag" style={{
                background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(114, 46, 209, 0.1))',
                color: 'var(--accent)', border: '1px solid rgba(24, 144, 255, 0.2)',
                fontSize: 12, padding: '4px 12px',
              }}>
                🏅 {user.levelName || `Lv${user.level}`}
              </span>
            </div>

            {/* Level progress */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  当前等级: {user.levelName || `Lv${user.level}`}
                </span>
                {nextLevel ? (
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    距离下一级还需 {nextLevel.minPoints - user.points} 积分
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>已达到最高等级!</span>
                )}
              </div>
              <div style={{ width: '100%', height: 10, background: 'var(--bg-base)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(progressPercent, 100)}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--purple))',
                  borderRadius: 5,
                  transition: 'width 0.5s var(--ease-out)',
                }} />
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', fontSize: 16 }}>{user.points}</span>
              <span>积分</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>{user.department || '未设置部门'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card" style={{ padding: 36, marginTop: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
          个人资料设置
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">邮箱</label>
              <input className="input input-lg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your.email@kingdee.com" />
            </div>
            <div className="form-group">
              <label className="form-label">手机号</label>
              <input className="input input-lg" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="请输入手机号" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">部门</label>
            <input className="input input-lg" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="请输入部门名称" />
          </div>
          <div className="form-group">
            <label className="form-label">个人简介</label>
            <textarea className="textarea" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="介绍一下自己..." style={{ fontSize: 14 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button className="btn btn-ghost" type="button" onClick={() => navigate(`/user/${user.id}`)}>
              查看主页
            </button>
            <button className="btn btn-primary btn-lg" type="submit" disabled={saving}>
              {saving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
