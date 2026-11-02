import { useEffect, useRef } from 'react';
import { echo } from '../lib/echo';
import type { MessageBubbleMessage } from '../components/chat/MessageBubble';

interface UseChatChannelOptions {
  conversationId: number | null;
  currentUserId: number;
  onMessage: (message: MessageBubbleMessage) => void;
  onRead?: (payload: any) => void;
}

export function useChatChannel({
  conversationId,
  currentUserId,
  onMessage,
  onRead,
}: UseChatChannelOptions) {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    if (channelRef.current) {
      echo.leave(`conversation.${channelRef.current.id}`);
      channelRef.current = null;
    }

    const channel = echo.private(`conversation.${conversationId}`);
    channelRef.current = channel;

    channel.listen('.MessageSent', (payload: { message: MessageBubbleMessage }) => {
      if (payload.message.sender_id === currentUserId) return;
      onMessage(payload.message);
    });

    channel.listen('.ConversationRead', (payload: any) => {
      if (onRead) onRead(payload);
    });

    return () => {
      echo.leave(`conversation.${conversationId}`);
    };
  }, [conversationId, currentUserId, onMessage, onRead]);
}