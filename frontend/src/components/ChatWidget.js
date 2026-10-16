import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API from '../utils/api';
import { Link } from 'react-router-dom';

export default function ChatWidget() {
  const { user } = useAuth();
  const {
    isConnected,
    unreadCount,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    markAsRead,
    onlineUsers,
  } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && contacts.length === 0) {
      API.get('/chat/contacts')
        .then((res) => {
          const list = res.data || [];
          setContacts(list);
          if (list.length > 0 && !selectedContact) {
            setSelectedContact(list[0]);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, contacts.length, selectedContact]);

  // Load messages when selected contact changes
  useEffect(() => {
    if (!isOpen || !selectedContact) return;

    API.get(`/chat/messages/${selectedContact._id}`)
      .then((res) => {
        setMessages(res.data || []);
        markAsRead(selectedContact._id);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      })
      .catch(() => {});
  }, [isOpen, selectedContact, markAsRead]);

  // Real-time message listener
  useEffect(() => {
    const handleNewMessage = (e) => {
      const msg = e.detail;
      const senderId = String(msg.sender?._id || msg.sender);
      const recipientId = String(msg.recipient?._id || msg.recipient);
      const myId = String(user?._id);

      if (
        selectedContact &&
        (senderId === String(selectedContact._id) || (senderId === myId && recipientId === String(selectedContact._id)))
      ) {
        setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        if (senderId === String(selectedContact._id)) {
          markAsRead(selectedContact._id);
        }
      }
    };

    window.addEventListener('app:new_message', handleNewMessage);
    return () => window.removeEventListener('app:new_message', handleNewMessage);
  }, [selectedContact, user, markAsRead]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact || sending) return;

    const text = inputText.trim();
    setInputText('');
    stopTyping(selectedContact._id);
    setSending(true);

    try {
      const sent = await sendMessage({
        recipientId: selectedContact._id,
        text,
      });
      setMessages((prev) => (prev.some((m) => m._id === sent._id) ? prev : [...prev, sent]));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (_) {
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const isOnline = selectedContact && onlineUsers.includes(String(selectedContact._id));
  const isTyping = selectedContact && typingUsers[selectedContact._id];
  const fullChatUrl = user?.role === 'admin' ? '/admin/messages' : '/my-messages';

  if (!user) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-13 h-13 rounded-2xl bg-[#3365e2] hover:bg-[#2552ca] text-white shadow-xl shadow-[#3365e2]/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group cursor-pointer"
          aria-label="Open live gym chat"
        >
          <MessageSquare size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-white dark:border-stone-900 shadow-sm animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {isConnected && (
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 border border-emerald-700" />
          )}
        </button>
      )}

      {/* Expanded quick chat popup */}
      {isOpen && (
        <div
          className="w-[calc(100vw-32px)] sm:w-[360px] h-[480px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          style={{ background: 'var(--p-surface)', borderColor: 'var(--p-border)' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
            style={{ borderColor: 'var(--p-border)', background: 'var(--p-bg)' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#13314a] text-white font-bold text-xs flex items-center justify-center">
                  {selectedContact?.name?.[0]?.toUpperCase() || 'C'}
                </div>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-[var(--p-surface)]" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate text-[var(--p-text)]">
                    {selectedContact?.name || 'Live Gym Chat'}
                  </span>
                  {selectedContact && (
                    <span className="text-[9px] px-1 py-0.2 rounded font-bold uppercase bg-[#3365e2]/10 text-[#3365e2]">
                      {selectedContact.role}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[var(--p-muted)] truncate">
                  {isOnline ? 'Online live' : 'Instant WebSockets'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to={fullChatUrl}
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-semibold text-[#3365e2] hover:underline px-1.5 py-1"
                title="Open full page chat"
              >
                Expand
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-[var(--p-muted)] hover:text-[var(--p-text)] cursor-pointer"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Contact selector pill bar if multiple contacts available */}
          {contacts.length > 1 && (
            <div
              className="px-3 py-1.5 border-b flex items-center gap-1.5 overflow-x-auto flex-shrink-0"
              style={{ borderColor: 'var(--p-border)', background: 'var(--p-surface)' }}
            >
              <span className="text-[10px] text-[var(--p-muted)] whitespace-nowrap">To:</span>
              {contacts.slice(0, 4).map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedContact(c)}
                  className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    selectedContact?._id === c._id
                      ? 'bg-[#3365e2] text-white font-semibold'
                      : 'bg-[var(--p-bg)] text-[var(--p-text-2)] hover:border-[#3365e2] border border-[var(--p-border)]'
                  }`}
                >
                  {c.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[var(--p-bg)] text-xs">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-xs text-[var(--p-muted)] p-4 space-y-1">
                <Sparkles size={20} className="text-[#3365e2] mb-1" />
                <p className="font-semibold text-[var(--p-text)]">Live Communication</p>
                <p className="text-[11px]">Send a message to start chatting instantly.</p>
              </div>
            ) : (
              messages.map((m, i) => {
                const isMine = String(m.sender?._id || m.sender) === String(user?._id);
                return (
                  <div key={m._id || i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        isMine
                          ? 'bg-[#3365e2] text-white rounded-br-xs'
                          : 'bg-[var(--p-surface)] text-[var(--p-text)] border border-[var(--p-border)] rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
            {isTyping && (
              <p className="text-[10px] text-[#3365e2] italic pl-1">Coach is typing...</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-2 border-t flex items-center gap-1.5 flex-shrink-0"
            style={{ borderColor: 'var(--p-border)', background: 'var(--p-surface)' }}
          >
            <input
              type="text"
              placeholder="Type message..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (selectedContact) startTyping(selectedContact._id);
              }}
              className="flex-1 px-3 py-2 text-xs rounded-xl border bg-[var(--p-bg)] border-[var(--p-border)] text-[var(--p-text)] outline-none focus:border-[#3365e2]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2 rounded-xl bg-[#3365e2] hover:bg-[#2552ca] text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
