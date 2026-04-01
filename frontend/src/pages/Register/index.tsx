import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import { useUserStore } from '../../stores/userStore';
import { JOB_ROLES } from '../../constants';
import { toast } from '../../utils/toast';
import type { ApiResponse, LoginResponse } from '../../types';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setLogin } = useUserStore();
  const [form, setForm] = useState({ username: '', password: '', email: '', jobRole: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.email || !form.jobRole) {
      toast.error('请填写所有必填项');
      return;
    }
    if (form.username.length < 3) { toast.error('用户名至少3个字符'); return; }
    if (form.password.length < 6) { toast.error('密码至少6个字符'); return; }
    setLoading(true);
    try {
      const res = await request.post<ApiResponse<LoginResponse>>('/auth/register', form);
      setLogin(res.data.data);
      toast.success('注册成功');
      navigate('/');
    } catch (err: unknown) {
      toast.error((err as Error).message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="grid-bg"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--bg-base)',
        padding: 20,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 20,
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              marginBottom: 16,
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            AI
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            加入 AI广场
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginTop: 8 }}>
            ERP 知识共享社区
          </p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: '32px 28px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">用户名</label>
              <input
                className="input input-lg"
                placeholder="3-50个字符"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">密码</label>
              <input
                className="input input-lg"
                type="password"
                placeholder="至少6个字符"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">邮箱</label>
              <input
                className="input input-lg"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">岗位方向</label>
              <select
                className="select input-lg"
                value={form.jobRole}
                onChange={(e) => handleChange('jobRole', e.target.value)}
              >
                <option value="">选择岗位方向</option>
                {Object.values(JOB_ROLES).map((role) => (
                  <option key={role.key} value={role.key}>{role.icon} {role.name}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-tertiary)', fontSize: 13 }}>
            已有账号？{' '}
            <a onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: 'var(--accent)' }}>
              立即登录
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
