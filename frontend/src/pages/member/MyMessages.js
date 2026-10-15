import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, CheckCheck, Check, Phone,
  Sparkles, RefreshCw
} from 'lucide-react';
import MemberPage from '../../components/MemberPage';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import API, { apiError } from '../../utils/api';
import toast from 'react-hot-toast';

export default function MyMessages() {
  const { user } = useAuth();
  const {
    isConnected,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    markAsRead,
    setActiveConversationId,
  } = useSocket();

  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load available staff contacts (Admins & Trainers)
  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/chat/contacts');
      const list = res.data || [];
      setContacts(list);
      // Automatically select first contact (usually admin or trainer)
      if (list.length > 0 && !activeContact) {
        setActiveContact(list[0]);
      }
    } catch (err) {
      toast.error(apiError(err, 'Failed to load coaches & support'));
    } finally {
      setLoading(false);
    }
  }, [activeContact]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Load messages with activeContact
  useEffect(() => {
    if (!activeContact) {
      setMessages([]);
      setActiveConversationId(null);
      return;
    }

    const contactId = activeContact._id;
    setActiveConversationId(`conv:${contactId}`);
    setLoadingMessages(true);

    API.get(`/chat/messages/${contactId}`)
      .then((res) => {
        setMessages(res.data || []);
        markAsRead(contactId);
      })
      .catch((err) => {
        toast.error(apiError(err, 'Could not load messages'));
      })
      .finally(() => {
        setLoadingMessages(false);
        setTimeout(scrollToBottom, 50);
      });

    return () => {
      setActiveConversationId(null);
    };
  }, [activeContact, markAsRead, setActiveConversationId]);

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (e) => {
      const newMsg = e.detail;
      const senderId = String(newMsg.sender?._id || newMsg.sender);
      const recipientId = String(newMsg.recipient?._id || newMsg.recipient);
      const myId = String(user?._id);

      if (
        activeContact &&
        (senderId === String(activeContact._id) || (senderId === myId && recipientId === String(activeContact._id)))
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);

        if (senderId === String(activeContact._id)) {
          markAsRead(activeContact._id);
        }
      }
    };

    const handleReadReceipt = (e) => {
      const { readerId } = e.detail;
      if (activeContact && String(activeContact._id) === String(readerId)) {
        setMessages((prev) =>
          prev.map((m) => (String(m.sender?._id || m.sender) === String(user?._id) ? { ...m, isRead: true } : m))
        );
      }
    };

    window.addEventListener('app:new_message', handleNewMessage);
    window.addEventListener('app:messages_read', handleReadReceipt);
    return () => {
      window.removeEventListener('app:new_message', handleNewMessage);
      window.removeEventListener('app:messages_read', handleReadReceipt);
    };
  }, [activeContact, user, markAsRead]);

  // Handle typing input
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!activeContact) return;

    startTyping(activeContact._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(activeContact._id);
    }, 2000);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeContact || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    stopTyping(activeContact._id);
    setSending(true);

    try {
      const sentMsg = await sendMessage({
        recipientId: activeContact._id,
        text: textToSend,
      });

      setMessages((prev) => {
        if (prev.some((m) => m._id === sentMsg._id)) return prev;
        return [...prev, sentMsg];
      });
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      toast.error(apiError(err, 'Failed to send message'));
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const isContactOnline = (id) => onlineUsers.includes(String(id));
  const isTyping = activeContact && typingUsers[activeContact._id];

  const presets = [
    'Can you please review my workout split routine?',
    'I have a question about my diet nutrition intake.',
    'Could I schedule a session for form correction?',
  ];

  return (
    <MemberPage
      title="Coach & Support Chat"
      subtitle="Chat directly with your trainers and gym managers in real time"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-230px)] min-h-[520px]">
        {/* Contact List Sidebar */}
        <div
          className={`md:col-span-4 flex flex-col rounded-2xl border overflow-hidden ${
            activeContact ? 'hidden md:flex' : 'flex'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--p-border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--p-muted)]">
              Trainers & Management
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-semibold">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {isConnected ? 'Online' : 'Offline'}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--p-border)]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[var(--p-muted)]">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2 opacity-50" />
                Loading coaches...
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--p-muted)]">
                No coaches or admins found at this time.
              </div>
            ) : (
              contacts.map((contact) => {
                const isOnline = isContactOnline(contact._id);
                const isSelected = activeContact?._id === contact._id;

                return (
                  <div
                    key={contact._id}
                    onClick={() => setActiveContact(contact)}
                    className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-500/10' : 'hover:bg-[var(--p-bg)]'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-white font-bold text-sm">
                        {contact.name?.[0]?.toUpperCase() || 'C'}
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--p-surface)]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[var(--p-text)] truncate">{contact.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            contact.role === 'admin'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                              : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {contact.role === 'admin' ? 'Support' : 'Trainer'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--p-muted)] truncate mt-0.5">
                        {isOnline ? 'Online now' : 'Replies shortly'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`md:col-span-8 flex flex-col rounded-2xl border overflow-hidden ${
            !activeContact ? 'hidden md:flex' : 'flex'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          {activeContact ? (
            <>
              {/* Header */}
              <div
                className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
                style={{ borderColor: 'var(--p-border)', background: 'var(--p-surface)' }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveContact(null)}
                    className="md:hidden p-1.5 -ml-1 text-[var(--p-muted)] hover:text-[var(--p-text)]"
                  >
                    ←
                  </button>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-white font-bold text-sm">
                      {activeContact.name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    {isContactOnline(activeContact._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--p-surface)]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-[var(--p-text)] leading-none">{activeContact.name}</h2>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          activeContact.role === 'admin'
                            ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {activeContact.role === 'admin' ? 'Gym Support' : 'Coach'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--p-muted)]">
                      {isContactOnline(activeContact._id) ? (
                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live on WebSockets
                        </span>
                      ) : (
                        <span>Offline • Messages delivered instantly</span>
                      )}
                    </div>
                  </div>
                </div>

                {activeContact.phone && (
                  <a
                    href={`tel:${activeContact.phone}`}
                    className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                    title="Call"
                  >
                    <Phone size={18} />
                  </a>
                )}
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--p-bg)]">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-[var(--p-muted)]">
                    <RefreshCw size={20} className="animate-spin mr-2" /> Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-xs text-[var(--p-muted)] space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-1">
                      <Sparkles size={24} />
                    </div>
                    <p className="font-semibold text-sm text-[var(--p-text)]">
                      Say hello to {activeContact.name}!
                    </p>
                    <p className="max-w-xs">
                      Ask about your workout, get meal plan tips, or check on gym timings.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = String(msg.sender?._id || msg.sender) === String(user?._id);
                    const timeStr = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                            isMine
                              ? 'bg-emerald-600 text-white rounded-br-xs'
                              : 'bg-[var(--p-surface)] text-[var(--p-text)] border border-[var(--p-border)] rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>

                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-[var(--p-muted)]">
                          <span>{timeStr}</span>
                          {isMine && (
                            <span>
                              {msg.isRead ? (
                                <CheckCheck size={12} className="text-emerald-400 inline" />
                              ) : (
                                <Check size={12} className="inline opacity-70" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-emerald-500 italic pl-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                    <span>{typeof isTyping === 'string' ? `${isTyping} is typing...` : 'Coach is typing...'}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Presets */}
              <div
                className="px-4 py-2 border-t overflow-x-auto flex gap-2 flex-shrink-0"
                style={{ borderColor: 'var(--p-border)', background: 'var(--p-surface)' }}
              >
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap bg-[var(--p-bg)] text-[var(--p-text-2)] hover:border-emerald-500 border border-[var(--p-border)] transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t flex items-center gap-2 flex-shrink-0"
                style={{ borderColor: 'var(--p-border)', background: 'var(--p-surface)' }}
              >
                <input
                  type="text"
                  placeholder={`Message ${activeContact.name}...`}
                  value={inputText}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border outline-none bg-[var(--p-bg)] border-[var(--p-border)] text-[var(--p-text)] focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-all text-xs sm:text-sm"
                >
                  <Send size={15} />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-xs text-[var(--p-muted)]">
              <MessageSquare size={32} className="opacity-40 mb-2" />
              Select a coach or gym support staff to start chatting.
            </div>
          )}
        </div>
      </div>
    </MemberPage>
  );
}
