'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { connectSocket } from '@/lib/socket';
import { useNotifications } from '@/hooks/useNotifications';

interface Message {
  _id: string;
  content: string;
  type: 'text' | 'offer' | 'system';
  sender: { id: string; name: string; email: string; image?: string };
  createdAt: string;
}

interface Props {
  listingId: string;
  roomId: string;
  otherPartyName: string;
}

export default function ChatWindow({ listingId, roomId, otherPartyName }: Props) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { notify } = useNotifications();

  // Load history
  useEffect(() => {
    fetch(`/api/messages/${listingId}?roomId=${encodeURIComponent(roomId)}`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages ?? []);
        setLoading(false);
      });
  }, [listingId, roomId]);

  // Socket listeners
  useEffect(() => {
    if (!session?.user?.id) return;
    const socket = connectSocket();
    socket.emit('join-room', roomId);

    socket.on('receive-message', (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      notify(`New message from ${msg.sender.name}`, msg.content);
    });

    socket.on('user-typing', ({ name }: { name: string }) => {
      if (name !== session.user?.name) setTyping(true);
    });

    socket.on('user-stop-typing', () => setTyping(false));

    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
      socket.emit('leave-room', roomId);
    };
  }, [roomId, session]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || !session?.user?.id) return;
    setInput('');

    const socket = connectSocket();
    const msgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const msg: Message = {
      _id: msgId,
      content,
      type: 'text',
      sender: {
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        image: session.user.image ?? '',
      },
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, msg]);

    // Emit real-time
    socket.emit('send-message', { roomId, ...msg });

    // Persist to DB
    await fetch(`/api/messages/${listingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, content }),
    });
  }, [input, session, roomId, listingId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // Typing indicator
    const socket = connectSocket();
    socket.emit('typing', { roomId, userId: session?.user?.id, name: session?.user?.name });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop-typing', { roomId, userId: session?.user?.id });
    }, 1500);
  };

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ backgroundColor: '#163850' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: '#079BD8' }}>
          {otherPartyName[0]?.toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{otherPartyName}</div>
          <div className="text-xs" style={{ color: '#B3EAF9' }}>Chat about this listing</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: '#f8fafc' }}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#079BD8', borderTopColor: 'transparent' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6 text-sm" style={{ color: '#9ca3af' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender.email === session?.user?.email;
            const isSystem = msg.type === 'system' || msg.type === 'offer';

            if (isSystem) {
              return (
                <div key={msg._id} className="flex justify-center">
                  <div className="text-xs px-3 py-1.5 rounded-full max-w-xs text-center" style={{ backgroundColor: '#e8f4fd', color: '#045F82' }}>
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  {!isMe && (
                    <span className="text-xs ml-1" style={{ color: '#9ca3af' }}>{msg.sender.name}</span>
                  )}
                  <div
                    className="px-4 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      backgroundColor: isMe ? '#163850' : 'white',
                      color: isMe ? 'white' : '#1a2e3d',
                      borderBottomRightRadius: isMe ? '4px' : '16px',
                      borderBottomLeftRadius: isMe ? '16px' : '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs px-1" style={{ color: '#9ca3af' }}>{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}

        {typing && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl text-sm" style={{ backgroundColor: 'white', color: '#9ca3af' }}>
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t bg-white flex items-center gap-2">
        {session ? (
          <>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="flex-1 px-3 py-2 rounded-lg text-sm border resize-none outline-none focus:ring-2"
              style={{ borderColor: '#e2e8f0', color: '#163850' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ backgroundColor: input.trim() ? '#079BD8' : '#e5e7eb' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </>
        ) : (
          <p className="text-sm text-center w-full py-1" style={{ color: '#9ca3af' }}>
            <a href="/auth/signin" className="font-semibold" style={{ color: '#079BD8' }}>Sign in</a> to send messages
          </p>
        )}
      </div>
    </div>
  );
}
