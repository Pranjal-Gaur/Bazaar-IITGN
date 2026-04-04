'use client';

import { useEffect, useRef, useCallback } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

export function useSocket(roomId: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const socket = connectSocket();
    socketRef.current = socket;
    socket.emit('join-room', roomId);

    return () => {
      socket.emit('leave-room', roomId);
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (data: { content: string; senderId: string; senderName: string; senderImage?: string }) => {
      if (!roomId) return;
      const socket = getSocket();
      socket.emit('send-message', { roomId, ...data });
    },
    [roomId]
  );

  const emitTyping = useCallback(
    (userId: string, name: string) => {
      if (!roomId) return;
      getSocket().emit('typing', { roomId, userId, name });
    },
    [roomId]
  );

  const emitStopTyping = useCallback(
    (userId: string) => {
      if (!roomId) return;
      getSocket().emit('stop-typing', { roomId, userId });
    },
    [roomId]
  );

  return { socketRef, sendMessage, emitTyping, emitStopTyping };
}
