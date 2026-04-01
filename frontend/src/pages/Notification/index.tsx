import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { formatDate } from '../../utils/helpers';
import type { Notification, ApiResponse, PageResponse } from '../../types';

const NotificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (p: number) => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(p, 20);
      const data = res.data.data as PageResponse<Notification>;
      setNotifications(data?.list || []);
      setTotal(data?.total || 0);
    } catch { /* */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(page); }, [page]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications(page);
    } catch { /* */ }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications(page);
    } catch { /* */ }
  };

  const typeIcons: Record<string, string> = {
    ANSWER: '💬',
    ACCEPTED: '✅',
    COMMENT: '🗨️',
    SYSTEM: '🔔',
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <div className="card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>通知</h1>
          <button className="btn btn-ghost btn-sm" onClick={handleMarkAllAsRead}>全部已读</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>加载中...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>暂无通知</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) handleMarkAsRead(n.id);
                if (n.relatedType === 'question') navigate(`/question/${n.relatedId}`);
              }}
              style={{
                display: 'flex',
                gap: 14,
                padding: '14px 0',
                borderBottom: '1px solid var(--border)',
                cursor: n.relatedType === 'question' ? 'pointer' : 'default',
                opacity: n.isRead ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{ fontSize: 20, flexShrink: 0, width: 32, textAlign: 'center', lineHeight: '32px' }}>
                {typeIcons[n.type] || '🔔'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {n.title}
                  {!n.isRead && (
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginLeft: 8, verticalAlign: 'middle' }} />
                  )}
                </div>
                {n.content && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{n.content}</div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatDate(n.createdAt)}</div>
              </div>
            </div>
          ))
        )}

        {total > 20 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: '32px' }}>{page} / {Math.ceil(total / 20)}</span>
            <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>下一页</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
