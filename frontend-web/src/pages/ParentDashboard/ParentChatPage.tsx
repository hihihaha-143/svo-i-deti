import { FC, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import ChatWindow from '../../components/chat/ChatWindow';
import { useChatChannel } from '../../hooks/useChatChannel';
import type { MessageBubbleMessage } from '../../components/chat/MessageBubble';

interface MessagesResponse {
  data: MessageBubbleMessage[];
}

interface ConversationResponse {
  id: number;
  type: string;
  interlocutor: { id: number; name: string; role: string } | null;
}

const ParentChatPage: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageBubbleMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const currentUserId = user?.id ?? 0;

  // Загрузка чата при монтировании
  useEffect(() => {
    const openChat = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get<{ data: any[] }>('/conversations');
        const parentChat = res.data.data.find((c) => c.type === 'parent_psychologist');

        if (!parentChat) {
          setError('Чат с психологом ещё не создан. Обратитесь к психологу.');
          setIsLoading(false);
          return;
        }

        setConversation(parentChat);

        const msgRes = await apiClient.get<MessagesResponse>(
          `/conversations/${parentChat.id}/messages?limit=50`
        );
        setMessages(msgRes.data.data);
        setShouldScrollToBottom(true);

        if (msgRes.data.data.length > 0) {
          await apiClient.post(`/conversations/${parentChat.id}/read`, {
            last_message_id: msgRes.data.data[msgRes.data.data.length - 1].id,
          });
        }
      } catch {
        setError('Не удалось открыть чат');
      } finally {
        setIsLoading(false);
      }
    };

    openChat();
  }, []);

  // Реалтайм через хук
  useChatChannel({
    conversationId: conversation?.id ?? null,
    currentUserId,
    onMessage: useCallback((incoming: MessageBubbleMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        return [...prev, incoming];
      });
      setShouldScrollToBottom(true);
      if (conversation) {
        apiClient.post(`/conversations/${conversation.id}/read`, {
          last_message_id: incoming.id,
        }).catch(() => {});
      }
    }, [conversation]),
  });

  const handleSend = async (body: string, _isUrgent: boolean) => {
    if (!conversation) return;
    const res = await apiClient.post<{ data: MessageBubbleMessage }>(
      `/conversations/${conversation.id}/messages`,
      { body },
    );
    setMessages((prev) => [...prev, res.data.data]);
    setShouldScrollToBottom(true);
    await apiClient.post(`/conversations/${conversation.id}/read`, {
      last_message_id: res.data.data.id,
    });
  };

  if (isLoading) {
    return <div className="parent-chat__loading">Загрузка чата…</div>;
  }

  if (error || !conversation) {
    return (
      <div className="parent-chat">
        <button className="parent-chat__back" onClick={() => navigate('/parent')}>
          <ChevronLeft size={24} />
          <span>Назад</span>
        </button>
        <div className="parent-chat__error">{error ?? 'Чат не найден'}</div>
      </div>
    );
  }

  return (
    <div className="parent-chat">
      <button className="parent-chat__back" onClick={() => navigate('/parent')}>
        <ChevronLeft size={24} />
        <span>Назад</span>
      </button>
      <ChatWindow
        interlocutor={conversation.interlocutor}
        messages={messages}
        currentUserId={currentUserId}
        showFlag={false}
        showUrgent={false}
        allowUrgentInput={false}
        isLoadingMessages={false}
        hasMore={false}
        onLoadMore={() => {}}
        onSend={handleSend}
        shouldScrollToBottom={shouldScrollToBottom}
      />
    </div>
  );
};

export default ParentChatPage;