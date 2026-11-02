import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import ChatList from './ChatList';
import type { ChatListItemData } from './ChatListItem';
import ChatWindow from './ChatWindow';
import { echo } from '../../lib/echo';
import type { MessageBubbleMessage } from './MessageBubble';

interface MessagesResponse {
  data: MessageBubbleMessage[];
}

interface DashboardChatPageProps {
  role: 'psychologist' | 'mentor';
}

const DashboardChatPage: FC<DashboardChatPageProps> = ({ role }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatListItemData[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageBubbleMessage[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const currentUserId = user?.id ?? 0;

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
  const interlocutor = activeChat?.interlocutor ?? null;

  const channelRef = useRef<any>(null);

  const isPsychologist = role === 'psychologist';
  const showFlag = isPsychologist;
  const showUrgent = isPsychologist;
  const allowUrgentInput = false;

  const loadChats = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const res = await apiClient.get<{ data: ChatListItemData[] }>('/conversations');
      setChats(res.data.data);
    } catch {
      setError('Не удалось загрузить список чатов');
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (!user || !isPsychologist) return;
    const channel = echo.private(`user.${user.id}`);
    channel.listen('.UrgentNotificationCreated', () => {
      loadChats();
    });

    return () => {
      echo.leave(`user.${user.id}`);
    };
  }, [user, loadChats, isPsychologist]);

  const loadMessages = useCallback(async (conversationId: number, beforeId?: number) => {
    setIsLoadingMessages(true);
    try {
      const url = beforeId
        ? `/conversations/${conversationId}/messages?before_id=${beforeId}&limit=50`
        : `/conversations/${conversationId}/messages?limit=50`;
      const response = await apiClient.get<MessagesResponse>(url);
      const loaded = response.data.data;

      if (beforeId) {
        setMessages((prev) => [...loaded, ...prev]);
        setShouldScrollToBottom(false);
      } else {
        setMessages(loaded);
        setShouldScrollToBottom(true);
      }
      setHasMore(loaded.length === 50);
    } catch {
      setError('Не удалось загрузить сообщения');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const handleSelectChat = useCallback(
    async (chatId: number) => {
      if (activeChatId === chatId) return;
      setActiveChatId(chatId);
      setMessages([]);
      setError(null);

      if (channelRef.current) {
        echo.leave(channelRef.current);
        channelRef.current = null;
      }

      await loadMessages(chatId);

      if (messages.length > 0) {
        await apiClient.post(`/conversations/${chatId}/read`, {
          last_message_id: messages[messages.length - 1].id,
        }).catch(() => {});
      }

      const channel = echo.private(`conversation.${chatId}`);
      channel.listen('.MessageSent', (payload: { message: MessageBubbleMessage }) => {
        const incoming = payload.message;
        if (incoming.sender_id === currentUserId) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
        setShouldScrollToBottom(true);
        loadChats();
      });
      channelRef.current = channel;
    },
    [activeChatId, currentUserId, loadChats, loadMessages, messages],
  );

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        echo.leave(channelRef.current);
      }
    };
  }, []);

  const handleLoadMore = async () => {
    if (!activeChatId || messages.length === 0) return;
    const firstId = messages[0].id;
    await loadMessages(activeChatId, firstId);
  };

  const handleSend = async (body: string, _isUrgent: boolean) => {
    if (!activeChatId) return;
    const res = await apiClient.post<{ data: MessageBubbleMessage }>(
      `/conversations/${activeChatId}/messages`,
      { body },
    );
    setMessages((prev) => [...prev, res.data.data]);
    setShouldScrollToBottom(true);
    await apiClient.post(`/conversations/${activeChatId}/read`, {
      last_message_id: res.data.data.id,
    });
    loadChats();
  };

  const hasActiveChat = activeChatId !== null;

  return (
    <div className={`dashboard-chat ${hasActiveChat ? 'dashboard-chat--has-active' : ''}`}>
      <div className="dashboard-chat__sidebar">
        <ChatList
          chats={chats}
          activeId={activeChatId}
          onSelect={handleSelectChat}
          isLoading={isLoadingChats}
        />
      </div>

      <div className="dashboard-chat__window">
        {error && <div className="dashboard-chat__error">{error}</div>}

        {hasActiveChat && (
          <button
            className="dashboard-chat__back"
            onClick={() => setActiveChatId(null)}
          >
            <ChevronLeft size={24} />
            <span>Назад</span>
          </button>
        )}

        <ChatWindow
          interlocutor={interlocutor}
          messages={messages}
          currentUserId={currentUserId}
          showFlag={showFlag}
          showUrgent={showUrgent}
          allowUrgentInput={allowUrgentInput}
          isLoadingMessages={isLoadingMessages}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onSend={handleSend}
          shouldScrollToBottom={shouldScrollToBottom}
        />
      </div>
    </div>
  );
};

export default DashboardChatPage;