import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import { useUserStore } from '../../stores/userStore';
import { toast } from '../../utils/toast';
import type { ApiResponse, LoginResponse } from '../../types';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setLogin } = useUserStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('请填写用户名和密码');
      return;
    }
    setLoading(true);
    try {
      const res = await request.post<ApiResponse<LoginResponse>>('/auth/login', { username, password });
      setLogin(res.data.data);
      toast.success('登录成功');
      navigate('/');
    } catch (err: unknown) {
      toast.error((err as Error).message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(114, 46, 209, 0.08) 50%, rgba(250, 140, 22, 0.06) 100%)',
        padding: 20,
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '40px 36px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 22,
              color: '#fff',
              marginBottom: 20,
              boxShadow: '0 8px 24px rgba(79, 70, 229, 0.25)',
            }}
          >
            AI
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>
            欢迎回来
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>
            登录AI广场，开启您的AI学习之旅
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              className="input input-lg"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              className="input input-lg"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            className="btn btn-primary btn-lg"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: 8, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none' }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-tertiary)', fontSize: 13 }}>
          还没有账号？{' '}
          <a onClick={() => navigate('/register')} style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 600 }}>
            立即注册
          </a>
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            登录即表示您同意我们的服务条款和隐私政策
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
