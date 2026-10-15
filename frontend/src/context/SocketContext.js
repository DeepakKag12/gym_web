import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import API from '../utils/api';

const SocketContext = createContext(null);

/**
 * Determine WebSocket server origin from API configuration
 */
export function getSocketUrl() {
  const base = API.defaults.baseURL || 'http://localhost:5000/api';
  return base.replace(/\/api\/?$/, '');
}

/**
 * Subtle notification chime using Web Audio API (zero audio assets required)
 */
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (_) {}
}

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState({});
  const [activeConversationId, setActiveConversationId] = useState(null);

  const socketRef = useRef(null);
  const activeConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Fetch unread count initially and when user changes
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await API.get('/chat/unread-count');
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (_) {
      // safe fallback
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Connect to Socket.IO when user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      auth: { token },
      query: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('get_online_users');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      setIsConnected(false);
    });

    // ── Online presence events ──
    newSocket.on('online_users', (userIds) => {
      if (Array.isArray(userIds)) {
        setOnlineUsers(userIds);
      }
    });

    newSocket.on('user_online', ({ userId }) => {
      if (!userId) return;
      setOnlineUsers((prev) => Array.from(new Set([...prev, String(userId)])));
    });

    newSocket.on('user_offline', ({ userId }) => {
      if (!userId) return;
      setOnlineUsers((prev) => prev.filter((id) => id !== String(userId)));
    });

    // ── Real-time Chat message events ──
    newSocket.on('new_message', (message) => {
      const senderId = String(message.sender?._id || message.sender);
      const myId = String(user._id);

      // If message is from someone else
      if (senderId !== myId) {
        // If user is currently NOT viewing this conversation, alert them
        const isCurrentOpen = activeConversationIdRef.current === message.conversationId;
        if (!isCurrentOpen) {
          playNotificationSound();
          setUnreadCount((c) => c + 1);

          const senderName = message.sender?.name || 'Someone';
          toast(
            (t) => (
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  toast.dismiss(t.id);
                  const targetUrl = user.role === 'admin' ? '/admin/messages' : '/my-messages';
                  if (window.location.pathname !== targetUrl) {
                    window.location.href = targetUrl;
                  }
                }}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {senderName[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{senderName}</p>
                  <p className="text-xs opacity-90 truncate max-w-[200px]">{message.text}</p>
                </div>
              </div>
            ),
            { id: `chat-${message._id}`, duration: 4000 }
          );
        }
      }

      // Dispatch window event for open chat pages to update state instantly
      window.dispatchEvent(new CustomEvent('app:new_message', { detail: message }));
    });

    newSocket.on('conversation_updated', (payload) => {
      window.dispatchEvent(new CustomEvent('app:conversation_updated', { detail: payload }));
    });

    newSocket.on('messages_read', (readData) => {
      window.dispatchEvent(new CustomEvent('app:messages_read', { detail: readData }));
    });

    newSocket.on('user_typing', ({ userId, name, isTyping }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [userId]: isTyping ? name || true : false,
      }));
    });

    // ── Real-time System Announcements & Notifications ──
    newSocket.on('gym_announcement', (announcement) => {
      playNotificationSound();
      toast(
        () => (
          <div className="space-y-1">
            <p className="font-bold text-xs flex items-center gap-1.5 text-amber-400">
              📢 {announcement.title || 'Gym Announcement'}
            </p>
            <p className="text-xs">{announcement.message}</p>
          </div>
        ),
        { duration: 6000 }
      );
    });

    newSocket.on('notification', (notif) => {
      playNotificationSound();
      toast.success(notif.title || 'New Gym Notification', { duration: 4000 });
      window.dispatchEvent(new CustomEvent('app:notification', { detail: notif }));
    });

    // Admin-specific alerts
    if (user.role === 'admin') {
      newSocket.on('new_enquiry', (enquiry) => {
        playNotificationSound();
        toast(
          () => (
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-emerald-400">📩 New Enquiry Received</p>
              <p className="text-xs truncate">{enquiry.name} ({enquiry.phone}): {enquiry.message}</p>
            </div>
          ),
          { duration: 5000 }
        );
      });

      newSocket.on('new_order', (order) => {
        playNotificationSound();
        toast.success(`🛒 New Store Order placed (₹${order.totalAmount})`, { duration: 5000 });
      });
    }

    newSocket.on('order_status_updated', (order) => {
      toast(`📦 Order #${String(order._id).slice(-6)} status: ${order.orderStatus}`, { duration: 4000 });
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Send message method (socket with REST fallback)
  const sendMessage = useCallback(
    async ({ recipientId, text, attachments = [] }) => {
      if (!recipientId || !text?.trim()) {
        throw new Error('Recipient and message text required.');
      }

      const activeSocket = socketRef.current;
      if (activeSocket && activeSocket.connected) {
        return new Promise((resolve, reject) => {
          activeSocket.emit('send_message', { recipientId, text, attachments }, (res) => {
            if (res && res.success) {
              resolve(res.message);
            } else {
              // Fallback to REST API if socket handler rejected
              API.post('/chat/messages', { recipientId, text, attachments })
                .then((r) => resolve(r.data))
                .catch(reject);
            }
          });
        });
      }

      // If socket not connected, send directly via REST API
      const res = await API.post('/chat/messages', { recipientId, text, attachments });
      return res.data;
    },
    []
  );

  // Join a conversation room
  const joinConversation = useCallback((recipientId) => {
    if (socketRef.current && socketRef.current.connected && recipientId) {
      socketRef.current.emit('join_conversation', { recipientId });
    }
  }, []);

  // Leave a conversation room
  const leaveConversation = useCallback((recipientId) => {
    if (socketRef.current && socketRef.current.connected && recipientId) {
      socketRef.current.emit('leave_conversation', { recipientId });
    }
  }, []);

  // Start typing indicator
  const startTyping = useCallback((recipientId) => {
    if (socketRef.current && socketRef.current.connected && recipientId) {
      socketRef.current.emit('typing', { recipientId });
    }
  }, []);

  // Stop typing indicator
  const stopTyping = useCallback((recipientId) => {
    if (socketRef.current && socketRef.current.connected && recipientId) {
      socketRef.current.emit('stop_typing', { recipientId });
    }
  }, []);

  // Mark messages in conversation as read
  const markAsRead = useCallback(async (senderId) => {
    if (!senderId) return;
    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('mark_read', { senderId });
      }
      await API.put(`/chat/read/${senderId}`);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_) {}
  }, []);

  // Broadcast announcement (admins only)
  const broadcastAnnouncement = useCallback(async ({ targetRole, title, message }) => {
    if (socketRef.current && socketRef.current.connected) {
      return new Promise((resolve) => {
        socketRef.current.emit('broadcast_announcement', { targetRole, title, message }, (res) => {
          resolve(res);
        });
      });
    }
  }, []);

  // Query online users
  const refreshOnlineUsers = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('get_online_users');
    }
  }, []);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    unreadCount,
    typingUsers,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markAsRead,
    broadcastAnnouncement,
    refreshOnlineUsers,
    fetchUnreadCount,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return ctx;
};
