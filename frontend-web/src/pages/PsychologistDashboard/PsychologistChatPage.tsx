import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { ChevronLeft } from 'lucide-react'; // Иконка для кнопки "назад"
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import ChatList from '../../components/chat/ChatList';
import type { ChatListItemData } from '../../components/chat/ChatListItem';
import ChatWindow from '../../components/chat/ChatWindow';
import { echo } from '../../lib/echo';
import type { MessageBubbleMessage } from '../../components/chat/MessageBubble';

interface MessagesResponse {
  data: MessageBubbleMessage[];
}

const PsychologistChatPage: FC = () => {
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
    if (!user) return;
    const channel = echo.private(`user.${user.id}`);
    channel.listen('.UrgentNotificationCreated', () => {
      loadChats();
    });

    return () => {
      echo.leave(`user.${user.id}`);
    };
  }, [user, loadChats]);

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

  // Добавляем класс, если чат выбран (для мобильной адаптации)
  const hasActiveChat = activeChatId !== null;

  return (
    <div className={`psychologist-chat ${hasActiveChat ? 'psychologist-chat--has-active' : ''}`}>
      <div className="psychologist-chat__sidebar">
        <ChatList
          chats={chats}
          activeId={activeChatId}
          onSelect={handleSelectChat}
          isLoading={isLoadingChats}
        />
      </div>

      <div className="psychologist-chat__window">
        {error && <div className="psychologist-chat__error">{error}</div>}
        
        {/* Кнопка "Назад" для мобильных */}
        {hasActiveChat && (
          <button 
            className="psychologist-chat__back" 
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
          showFlag={true}
          showUrgent={true}
          allowUrgentInput={false}
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

export default PsychologistChatPage;