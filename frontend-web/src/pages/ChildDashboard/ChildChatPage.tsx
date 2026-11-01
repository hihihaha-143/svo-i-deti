import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import ChatWindow from '../../components/chat/ChatWindow';
import { echo } from '../../lib/echo';
import type { MessageBubbleMessage } from '../../components/chat/MessageBubble';

type ChatTab = 'psychologist' | 'mentor';

interface ConversationResponse {
  id: number;
  type: string;
  interlocutor: { id: number; name: string; role: string } | null;
}

interface MessagesResponse {
  data: MessageBubbleMessage[];
}

const ChildChatPage: FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<ChatTab>('psychologist');
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageBubbleMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const currentUserId = user?.id ?? 0;
  const psychologistId = profile?.psychologist_id ?? null;
  const mentorId = profile?.mentor_id ?? null;

  const participantId = activeTab === 'psychologist' ? psychologistId : mentorId;
  const participantName =
    activeTab === 'psychologist' ? profile?.psychologist_name : profile?.mentor_name;

  const conversationIdRef = useRef<number | null>(null);

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

  const openConversation = useCallback(
    async (tab: ChatTab) => {
      const pid = tab === 'psychologist' ? psychologistId : mentorId;
      if (!pid) {
        setConversation(null);
        setMessages([]);
        return;
      }
      setError(null);
      setMessages([]);
      setConversation(null);
      try {
        const res = await apiClient.post<{ data: ConversationResponse }>('/conversations', {
          type: tab === 'psychologist' ? 'child_psychologist' : 'child_mentor',
          participant_id: pid,
        });
        setConversation(res.data.data);
        conversationIdRef.current = res.data.data.id;
        await loadMessages(res.data.data.id);
      } catch {
        setError('Не удалось открыть чат');
      }
    },
    [psychologistId, mentorId, loadMessages],
  );

  useEffect(() => {
    openConversation(activeTab);
  }, [activeTab, openConversation]);

  useEffect(() => {
    if (!conversation) return;
    const channel = echo.private(`conversation.${conversation.id}`);

    channel.listen('.MessageSent', (payload: { message: MessageBubbleMessage }) => {
      const incoming = payload.message;
      if (incoming.sender_id === currentUserId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        return [...prev, incoming];
      });
      setShouldScrollToBottom(true);
      apiClient.post(`/conversations/${conversation.id}/read`, {
        last_message_id: incoming.id,
      }).catch(() => {});
    });

    return () => {
      echo.leave(`conversation.${conversation.id}`);
    };
  }, [conversation, currentUserId]);

  const handleLoadMore = async () => {
    if (!conversation || messages.length === 0) return;
    const firstId = messages[0].id;
    await loadMessages(conversation.id, firstId);
  };

  const handleSend = async (body: string, isUrgent: boolean) => {
    if (!conversation) return;
    const res = await apiClient.post<{ data: MessageBubbleMessage }>(
      `/conversations/${conversation.id}/messages`,
      { body, is_urgent: isUrgent },
    );
    setMessages((prev) => [...prev, res.data.data]);
    setShouldScrollToBottom(true);
    await apiClient.post(`/conversations/${conversation.id}/read`, {
      last_message_id: res.data.data.id,
    });
  };

  if (!participantId) {
    return (
      <div className="child-chat__wrapper">
        <div className="child-chat">
          <div className="child-chat__tabs">
            <button
              type="button"
              className={`child-chat__tab ${activeTab === 'psychologist' ? 'child-chat__tab--active' : ''}`}
              onClick={() => setActiveTab('psychologist')}
            >
              Психолог
            </button>
            <button
              type="button"
              className={`child-chat__tab ${activeTab === 'mentor' ? 'child-chat__tab--active' : ''}`}
              onClick={() => setActiveTab('mentor')}
            >
              Наставник
            </button>
          </div>
          <div className="child-chat__empty">
            {activeTab === 'psychologist' ? 'Психолог не назначен' : 'Наставник не назначен'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="child-chat__wrapper">
      <div className="child-chat">
        <div className="child-chat__tabs">
          <button
            type="button"
            className={`child-chat__tab ${activeTab === 'psychologist' ? 'child-chat__tab--active' : ''}`}
            onClick={() => setActiveTab('psychologist')}
          >
            Психолог
          </button>
          <button
            type="button"
            className={`child-chat__tab ${activeTab === 'mentor' ? 'child-chat__tab--active' : ''}`}
            onClick={() => setActiveTab('mentor')}
          >
            Наставник
          </button>
        </div>

        {error && <div className="child-chat__error">{error}</div>}

        <div className="child-chat__window">
          {conversation ? (
            <ChatWindow
              interlocutor={
                conversation.interlocutor ?? {
                  id: participantId,
                  name: participantName ?? (activeTab === 'psychologist' ? 'Психолог' : 'Наставник'),
                  role: activeTab,
                }
              }
              messages={messages}
              currentUserId={currentUserId}
              showFlag={false}
              showUrgent={true}
              allowUrgentInput={activeTab === 'psychologist'}
              isLoadingMessages={isLoadingMessages}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              onSend={handleSend}
              shouldScrollToBottom={shouldScrollToBottom}
            />
          ) : (
            <div className="child-chat__loading">Открываем чат…</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildChatPage;