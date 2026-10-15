import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Send, Search, CheckCheck, Check, Phone,
  Radio, Sparkles, User, RefreshCw, MessageCircle
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import API, { apiError } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminMessages() {
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
    broadcastAnnouncement,
  } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('chats'); // 'chats' | 'members' | 'trainers' | 'all'
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Announcement modal state
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRole, setBroadcastRole] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations & contacts
  const loadData = useCallback(async () => {
    setLoadingList(true);
    try {
      const [convRes, contactsRes] = await Promise.all([
        API.get('/chat/conversations'),
        API.get('/chat/contacts'),
      ]);
      setConversations(convRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (err) {
      toast.error(apiError(err, 'Failed to load messages'));
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load messages when activeContact changes
  useEffect(() => {
    if (!activeContact) {
      setMessages([]);
      setActiveConversationId(null);
      return;
    }

    const contactId = activeContact._id;
    setActiveConversationId(activeContact.conversationId || `conv:${contactId}`);
    setLoadingMessages(true);

    API.get(`/chat/messages/${contactId}`)
      .then((res) => {
        setMessages(res.data || []);
        markAsRead(contactId);
        // clear unread locally for this conversation
        setConversations((prev) =>
          prev.map((c) =>
            c.participant?._id === contactId ? { ...c, unreadCount: 0 } : c
          )
        );
      })
      .catch((err) => {
        toast.error(apiError(err, 'Could not load chat messages'));
      })
      .finally(() => {
        setLoadingMessages(false);
        setTimeout(scrollToBottom, 50);
      });

    return () => {
      setActiveConversationId(null);
    };
  }, [activeContact, markAsRead, setActiveConversationId]);

  // Listen for real-time messages via window event
  useEffect(() => {
    const handleNewMessage = (e) => {
      const newMsg = e.detail;
      const senderId = String(newMsg.sender?._id || newMsg.sender);
      const recipientId = String(newMsg.recipient?._id || newMsg.recipient);
      const myId = String(user?._id);

      // If active conversation matches either participant
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

      // Update conversations list with latest snippet
      setConversations((prev) => {
        const otherId = senderId === myId ? recipientId : senderId;
        const index = prev.findIndex((c) => String(c.participant?._id) === otherId);

        if (index !== -1) {
          const updated = [...prev];
          const isCurrentActive = activeContact && String(activeContact._id) === otherId;
          updated[index] = {
            ...updated[index],
            lastMessage: newMsg,
            unreadCount: isCurrentActive ? 0 : (updated[index].unreadCount || 0) + (senderId !== myId ? 1 : 0),
          };
          // Move updated conversation to top
          const [moved] = updated.splice(index, 1);
          return [moved, ...updated];
        } else {
          // New conversation — reload full list to populate properly
          loadData();
          return prev;
        }
      });
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
  }, [activeContact, user, markAsRead, loadData]);

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

      // Optimistically add to view if not already added by socket listener
      setMessages((prev) => {
        if (prev.some((m) => m._id === sentMsg._id)) return prev;
        return [...prev, sentMsg];
      });
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      toast.error(apiError(err, 'Failed to send message'));
      setInputText(textToSend); // restore on error
    } finally {
      setSending(false);
    }
  };

  // Broadcast announcement
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      toast.error('Announcement message is required');
      return;
    }
    setBroadcasting(true);
    try {
      await broadcastAnnouncement({
        targetRole: broadcastRole || undefined,
        title: broadcastTitle.trim() || 'Gym Announcement',
        message: broadcastMessage.trim(),
      });
      toast.success('Live announcement broadcasted to gym athletes!');
      setShowBroadcast(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastRole('');
    } catch (err) {
      toast.error('Failed to broadcast announcement');
    } finally {
      setBroadcasting(false);
    }
  };

  // Quick preset messages
  const quickPresets = [
    '💪 Great workout session today! Keep up the momentum.',
    '🥗 Your personalized diet plan is updated on your dashboard.',
    '📋 Reminder: Your gym membership expires soon. Tap to renew.',
    '🏋️ Don\'t forget to stay hydrated and warm up before lifting.',
  ];

  // Filtered contacts / conversations
  const filteredConversations = conversations.filter((c) => {
    const nameMatch = c.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = c.participant?.role?.toLowerCase().includes(searchQuery.toLowerCase());
    if (tab === 'members') return (nameMatch || roleMatch) && c.participant?.role === 'member';
    if (tab === 'trainers') return (nameMatch || roleMatch) && c.participant?.role === 'trainer';
    return nameMatch || roleMatch;
  });

  const filteredContacts = contacts.filter((c) => {
    const nameMatch = c.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = c.role?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || roleMatch;
    if (tab === 'members') return matchesSearch && c.role === 'member';
    if (tab === 'trainers') return matchesSearch && c.role === 'trainer';
    return matchesSearch;
  });

  const isContactOnline = (contactId) => {
    return onlineUsers.includes(String(contactId));
  };

  const isTyping = activeContact && typingUsers[activeContact._id];

  return (
    <AdminLayout
      title="Communication & Messages"
      subtitle="Real-time WebSocket chat with gym members, trainers, and staff"
      actions={
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {isConnected ? 'WebSocket Live' : 'Connecting...'}
          </div>

          <button
            onClick={() => setShowBroadcast(true)}
            className="panel-btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <Radio size={14} /> Broadcast
          </button>

          <button
            onClick={loadData}
            title="Refresh conversations"
            className="p-2 rounded-lg border border-[var(--p-border)] hover:bg-[var(--p-surface)] text-[var(--p-text-2)]"
          >
            <RefreshCw size={14} className={loadingList ? 'animate-spin' : ''} />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[580px]">
        {/* ── Left Sidebar: Conversations & Contacts ── */}
        <div
          className={`lg:col-span-5 xl:col-span-4 flex flex-col rounded-2xl border overflow-hidden ${
            activeContact ? 'hidden lg:flex' : 'flex'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          {/* Search & Tabs */}
          <div className="p-3 border-b space-y-2.5" style={{ borderColor: 'var(--p-border)' }}>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--p-muted)]" />
              <input
                type="text"
                placeholder="Search athletes & staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none bg-[var(--p-bg)] border-[var(--p-border)] text-[var(--p-text)] focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-1 bg-[var(--p-bg)] p-1 rounded-xl">
              {[
                { id: 'chats', label: 'Recent Chats' },
                { id: 'members', label: 'Members' },
                { id: 'trainers', label: 'Trainers' },
                { id: 'all', label: 'All Contacts' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    tab === t.id
                      ? 'bg-[var(--p-surface)] text-[var(--p-text)] shadow-xs font-bold'
                      : 'text-[var(--p-muted)] hover:text-[var(--p-text)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--p-border)]">
            {loadingList ? (
              <div className="p-8 text-center text-xs text-[var(--p-muted)]">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2 opacity-50" />
                Loading conversations...
              </div>
            ) : tab === 'chats' ? (
              filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--p-muted)] space-y-2">
                  <MessageSquare size={28} className="mx-auto opacity-30 text-[var(--p-muted)]" />
                  <p>No recent conversations.</p>
                  <button
                    onClick={() => setTab('members')}
                    className="text-emerald-500 hover:underline font-semibold"
                  >
                    Start a chat with a member →
                  </button>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const participant = c.participant || {};
                  const isOnline = isContactOnline(participant._id);
                  const isSelected = activeContact?._id === participant._id;
                  const lastMsg = c.lastMessage;

                  return (
                    <div
                      key={c.conversationId || participant._id}
                      onClick={() => setActiveContact({ ...participant, conversationId: c.conversationId })}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10'
                          : 'hover:bg-[var(--p-bg)]'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-white font-bold text-sm">
                          {participant.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--p-surface)]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-xs truncate text-[var(--p-text)]">
                            {participant.name}
                          </span>
                          <span className="text-[10px] text-[var(--p-muted)] flex-shrink-0">
                            {lastMsg?.createdAt
                              ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-[11px] text-[var(--p-muted)] truncate max-w-[180px]">
                            {typingUsers[participant._id] ? (
                              <span className="text-emerald-500 font-semibold italic">typing...</span>
                            ) : (
                              lastMsg?.text || 'No messages yet'
                            )}
                          </p>
                          {c.unreadCount > 0 && (
                            <span className="min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-white font-bold text-[9px] flex items-center justify-center px-1">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              // Contacts Directory View
              filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--p-muted)]">
                  No contacts found matching your query.
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isOnline = isContactOnline(contact._id);
                  const isSelected = activeContact?._id === contact._id;

                  return (
                    <div
                      key={contact._id}
                      onClick={() => setActiveContact(contact)}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-500/10' : 'hover:bg-[var(--p-bg)]'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-white font-bold text-sm">
                          {contact.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--p-surface)]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs truncate text-[var(--p-text)]">
                            {contact.name}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              contact.role === 'admin'
                                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                                : contact.role === 'trainer'
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {contact.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--p-muted)] truncate mt-0.5">
                          {contact.email || contact.phone || 'FitNation athlete'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* ── Right Panel: Active Chat View ── */}
        <div
          className={`lg:col-span-7 xl:col-span-8 flex flex-col rounded-2xl border overflow-hidden ${
            !activeContact ? 'hidden lg:flex' : 'flex'
          }`}
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          {activeContact ? (
            <>
              {/* Chat Top Header */}
              <div
                className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
                style={{ borderColor: 'var(--p-border)', background: 'var(--p-surface)' }}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveContact(null)}
                    className="lg:hidden p-1.5 -ml-1 text-[var(--p-muted)] hover:text-[var(--p-text)]"
                  >
                    ←
                  </button>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-white font-bold text-sm">
                      {activeContact.name?.[0]?.toUpperCase() || 'U'}
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
                            : activeContact.role === 'trainer'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {activeContact.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--p-muted)]">
                      {isContactOnline(activeContact._id) ? (
                        <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Active Now
                        </span>
                      ) : (
                        <span>Offline</span>
                      )}
                      {activeContact.phone && <span>• {activeContact.phone}</span>}
                    </div>
                  </div>
                </div>

                {/* Quick actions for member */}
                {activeContact.phone && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${activeContact.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl text-green-500 hover:bg-green-500/10 transition-colors"
                      title="Open WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </a>
                    <a
                      href={`tel:${activeContact.phone}`}
                      className="p-2 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-colors"
                      title="Call Member"
                    >
                      <Phone size={18} />
                    </a>
                  </div>
                )}
              </div>

              {/* Messages Body */}
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
                      Start your conversation with {activeContact.name}
                    </p>
                    <p className="max-w-xs">
                      Send training updates, workout advice, fee notices, or answer questions instantly over WebSockets.
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
                          className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs ${
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
                    <span>{typeof isTyping === 'string' ? `${isTyping} is typing...` : 'Typing...'}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Presets Strip */}
              <div
                className="px-4 py-2 border-t overflow-x-auto flex gap-2 flex-shrink-0"
                style={{ borderColor: 'var(--p-border)', background: 'var(--p-surface)' }}
              >
                {quickPresets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap bg-[var(--p-bg)] text-[var(--p-text-2)] hover:border-emerald-500 border border-[var(--p-border)] transition-colors"
                  >
                    {preset.slice(0, 36)}...
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t flex items-center gap-2 flex-shrink-0"
                style={{ borderColor: 'var(--p-border)', background: 'var(--p-surface)' }}
              >
                <input
                  type="text"
                  placeholder={`Write a message to ${activeContact.name}...`}
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
            // No chat selected empty state
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <MessageSquare size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--p-text)]">Gym Communication Hub</h3>
                <p className="text-xs text-[var(--p-muted)] max-w-sm">
                  Select a member or trainer from the sidebar to chat live with real-time WebSockets, or broadcast an urgent announcement to athletes.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setTab('members')}
                  className="panel-btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
                >
                  <User size={14} /> Browse Members
                </button>
                <button
                  onClick={() => setShowBroadcast(true)}
                  className="panel-btn-primary text-xs px-3 py-2 flex items-center gap-1.5"
                >
                  <Radio size={14} /> Send Broadcast
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Announcement Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-2xl border p-5 space-y-4 shadow-xl"
            style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 font-bold">
                  <Radio size={16} />
                </div>
                <h3 className="text-sm font-bold text-[var(--p-text)]">Live Gym Announcement</h3>
              </div>
              <button
                onClick={() => setShowBroadcast(false)}
                className="text-[var(--p-muted)] hover:text-[var(--p-text)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--p-muted)]">
              Instantly pushes a high-priority alert through WebSockets to all currently connected members or trainers.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[var(--p-text-2)] block mb-1">Target Audience</label>
                <select
                  value={broadcastRole}
                  onChange={(e) => setBroadcastRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border bg-[var(--p-bg)] border-[var(--p-border)] text-[var(--p-text)] outline-none"
                >
                  <option value="">Everyone (All Members & Trainers)</option>
                  <option value="member">Members Only</option>
                  <option value="trainer">Trainers Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--p-text-2)] block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Gym Holiday Notice, Maintenance Alert"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border bg-[var(--p-bg)] border-[var(--p-border)] text-[var(--p-text)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--p-text-2)] block mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Type your announcement text here..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border bg-[var(--p-bg)] border-[var(--p-border)] text-[var(--p-text)] outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcast(false)}
                  className="panel-btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcasting || !broadcastMessage.trim()}
                  className="panel-btn-primary text-xs px-4 py-2 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Radio size={14} />
                  {broadcasting ? 'Broadcasting...' : 'Broadcast Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
