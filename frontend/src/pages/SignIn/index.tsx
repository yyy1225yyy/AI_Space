import React, { useState, useEffect } from 'react';
import request from '../../utils/request';
import { toast } from '../../utils/toast';
import { useUserStore } from '../../stores/userStore';
import type { User as UserType } from '../../types';

interface SignInStatus {
  signedToday: boolean;
  continuousDays: number;
}

interface SignInResult {
  signDate: string;
  continuousDays: number;
  pointsEarned: number;
}

const SignInPage: React.FC = () => {
  const { setUser } = useUserStore();
  const [status, setStatus] = useState<SignInStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [justSigned, setJustSigned] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await request.get<{ code: number; data: SignInStatus }>('/sign-in/status');
      setStatus(res.data.data);
    } catch { /* */ }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const res = await request.post<{ code: number; data: SignInResult }>('/sign-in');
      const result = res.data.data;
      toast.success(`签到成功！连续${result.continuousDays}天，获得 ${result.pointsEarned} 积分`);
      setJustSigned(true);
      fetchStatus();
      // 刷新用户信息以更新积分
      try {
        const meRes = await request.get<{ code: number; data: UserType }>('/users/me');
        if (meRes.data.data) setUser(meRes.data.data);
      } catch { /* */ }
    } catch (err: unknown) {
      toast.error((err as Error).message || '签到失败');
    } finally {
      setLoading(false);
    }
  };

  const milestones = [
    { day: 1, label: '第1天', bonus: '+1' },
    { day: 7, label: '7天连签', bonus: '+4' },
    { day: 14, label: '14天连签', bonus: '+1' },
    { day: 30, label: '30天连签', bonus: '+11' },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="card animate-fade-up" style={{ padding: '32px 36px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
          每日签到
        </h1>

        {/* Status card */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
            borderRadius: 'var(--radius-md)',
            padding: '28px 24px',
            marginBottom: 24,
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 6 }}>连续签到</div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                {status?.continuousDays || 0}
                <span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>天</span>
              </div>
            </div>
            <button
              className="btn"
              disabled={status?.signedToday || loading}
              onClick={handleSignIn}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 28px',
                fontSize: 15,
                fontWeight: 600,
                cursor: status?.signedToday ? 'not-allowed' : 'pointer',
                opacity: status?.signedToday ? 0.7 : 1,
              }}
            >
              {loading ? '签到中...' : status?.signedToday ? '今日已签到' : '立即签到'}
            </button>
          </div>
          {justSigned && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
              签到成功！明天记得再来哦
            </div>
          )}
        </div>

        {/* Milestones */}
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
          签到奖励规则
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {milestones.map((m) => {
            const reached = (status?.continuousDays || 0) >= m.day;
            return (
              <div
                key={m.day}
                style={{
                  textAlign: 'center',
                  padding: '16px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${reached ? 'var(--accent)' : 'var(--border)'}`,
                  background: reached ? 'var(--accent-subtle)' : 'transparent',
                }}
              >
                <div style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: reached ? 'var(--accent)' : 'var(--text-tertiary)',
                  marginBottom: 6,
                }}>
                  {m.label}
                </div>
                <div style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: reached ? 'var(--accent)' : 'var(--text-secondary)',
                }}>
                  {m.bonus}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>积分</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
