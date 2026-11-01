import { FC } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { MessageBubbleMessage } from './MessageBubble';

interface ChatWindowInterlocutor {
  id: number;
  name: string;
  role: string;
}

interface ChatWindowProps {
  interlocutor: ChatWindowInterlocutor | null;
  messages: MessageBubbleMessage[];
  currentUserId: number;
  showFlag: boolean;
  showUrgent: boolean;
  allowUrgentInput: boolean;
  isLoadingMessages: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSend: (body: string, isUrgent: boolean) => Promise<void>;
  shouldScrollToBottom?: boolean;
}

const roleLabel: Record<string, string> = {
  psychologist: 'Психолог',
  mentor: 'Наставник',
  parent: 'Родитель',
  child: 'Ребёнок',
};

const ChatWindow: FC<ChatWindowProps> = ({
  interlocutor,
  messages,
  currentUserId,
  showFlag,
  showUrgent,
  allowUrgentInput,
  isLoadingMessages,
  hasMore,
  onLoadMore,
  onSend,
  shouldScrollToBottom,
}) => {
  if (!interlocutor) {
    return (
      <div className="chat-window chat-window--empty">
        Выберите чат слева
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window__header">
        <div className="chat-window__name">{interlocutor.name}</div>
        <div className="chat-window__role">{roleLabel[interlocutor.role] ?? ''}</div>
      </div>

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        showFlag={showFlag}
        showUrgent={showUrgent}
        isLoading={isLoadingMessages}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        shouldScrollToBottom={shouldScrollToBottom}
      />

      <MessageInput onSend={onSend} allowUrgent={allowUrgentInput} />
    </div>
  );
};

export default ChatWindow;