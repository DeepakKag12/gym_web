import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, MessageCircle, Mail } from 'lucide-react';
import API, { bustCache } from '../../utils/api';
import toast from 'react-hot-toast';
import MemberPage from '../../components/MemberPage';
import { Card, Button, EmptyState, SkeletonList, timeAgo } from '../../components/ui';

export default function MyNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/notifications')
      .then(r => setItems(r.data))
      .catch(() => toast.error('Could not load your notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    // Optimistic: the dot disappears immediately, and is restored if the call fails.
    setItems(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
    try {
      await API.put(`/notifications/${id}/read`);
      bustCache('notifications');
    } catch {
      setItems(prev => prev.map(n => (n._id === id ? { ...n, isRead: false } : n)));
    }
  };

  const markAllRead = async () => {
    const before = items;
    setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await API.put('/notifications/read-all');
      bustCache('notifications');
      toast.success('All marked as read');
    } catch (err) {
      setItems(before);
      toast.error(err.response?.data?.message || 'Could not update');
    }
  };

  const unread = items.filter(n => !n.isRead).length;

  return (
    <MemberPage
      title="Notifications"
      subtitle={unread ? `${unread} unread` : 'You are all caught up'}
      width="max-w-2xl"
      actions={unread > 0 && <Button icon={CheckCheck} size="sm" onClick={markAllRead}>Mark all read</Button>}
    >
      {loading ? (
        <SkeletonList rows={5} h={80} />
      ) : items.length === 0 ? (
        <Card>
          <EmptyState icon={Bell} title="No notifications yet" hint="Reminders and messages from your gym appear here." />
        </Card>
      ) : (
        <Card padded={false}>
          <ul>
            {items.map((n, i) => (
              <li
                key={n._id}
                onClick={() => !n.isRead && markRead(n._id)}
                className={`px-4 sm:px-5 py-4 ${n.isRead ? '' : 'cursor-pointer'}`}
                style={{
                  borderTop: i ? '1px solid var(--p-border)' : 'none',
                  background: n.isRead ? 'transparent' : 'var(--p-accent-soft)',
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ background: n.isRead ? 'var(--p-border-2)' : 'var(--p-accent)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold" style={{ color: 'var(--p-text)' }}>{n.title}</p>
                    <p className="text-[14px] mt-1 leading-relaxed whitespace-pre-line" style={{ color: 'var(--p-text-2)' }}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[12px]" style={{ color: 'var(--p-muted)' }}>
                      <span>{timeAgo(n.createdAt)}</span>
                      {n.sentVia?.includes('whatsapp') && <span className="inline-flex items-center gap-1"><MessageCircle size={12} /> WhatsApp</span>}
                      {n.sentVia?.includes('email') && <span className="inline-flex items-center gap-1"><Mail size={12} /> Email</span>}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </MemberPage>
  );
}
