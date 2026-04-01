import React, { useState, useEffect } from 'react';
import request from '../../utils/request';
import { formatDate } from '../../utils/helpers';
import { useUserStore } from '../../stores/userStore';
import type { PointRecord, ApiResponse, PageResponse, User } from '../../types';

const ACTION_LABELS: Record<string, string> = {
  SIGN_IN: '每日签到',
  ASK_QUESTION: '提问',
  ANSWER_QUESTION: '回答问题',
  ACCEPTED_ANSWER: '回答被采纳',
  VOTE_RECEIVED: '收到赞同',
  BOUNTY: '悬赏积分',
};

const PointsPage: React.FC = () => {
  const { user, setUser } = useUserStore();
  const [records, setRecords] = useState<PointRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentPoints, setCurrentPoints] = useState(user?.points || 0);
  const [currentLevel, setCurrentLevel] = useState(user?.level || 1);
  const [currentLevelName, setCurrentLevelName] = useState(user?.levelName || '');
  const pageSize = 20;

  const fetchRecords = async (p: number) => {
    setLoading(true);
    try {
      const res = await request.get<ApiResponse<PageResponse<PointRecord>>>('/users/me/points', {
        params: { page: p, size: pageSize },
      });
      const data = res.data.data;
      setRecords(data?.list || []);
      setTotal(data?.total || 0);
      // 用第一页第一条记录的余额作为当前积分
      if (p === 1 && data?.list?.length > 0) {
        setCurrentPoints(data.list[0].balance);
      }
      // 同时刷新用户信息
      try {
        const meRes = await request.get<ApiResponse<User>>('/users/me');
        if (meRes.data.data) {
          setUser(meRes.data.data);
          setCurrentLevel(meRes.data.data.level);
          setCurrentLevelName(meRes.data.data.levelName);
        }
      } catch { /* */ }
      setTotal(res.data.data?.total || 0);
    } catch { /* */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(page); }, [page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      {/* Summary */}
      <div className="card animate-fade-up" style={{ padding: '24px 28px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 22,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {currentLevel}
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 2 }}>当前积分</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {currentPoints}
              <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 6 }}>pts</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 2 }}>等级称谓</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>
              {currentLevelName || `Lv${currentLevel}`}
            </div>
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="card animate-fade-up" style={{ padding: '24px 28px', animationDelay: '0.05s' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
          积分明细
        </h2>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
            暂无积分记录
          </div>
        ) : (
          <>
            {records.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {ACTION_LABELS[r.actionType] || r.actionType}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {r.description} · {formatDate(r.createdAt)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: r.points > 0 ? 'var(--green)' : 'var(--red)',
                  }}>
                    {r.points > 0 ? '+' : ''}{r.points}
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>余额 {r.balance}</div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  上一页
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: '30px' }}>
                  {page} / {totalPages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PointsPage;
