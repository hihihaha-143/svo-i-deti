import { FC, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import type { MessageBubbleMessage } from './MessageBubble';

interface MessageListProps {
  messages: MessageBubbleMessage[];
  currentUserId: number;
  showFlag: boolean;
  showUrgent: boolean;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  shouldScrollToBottom?: boolean;
}

const MessageList: FC<MessageListProps> = ({
  messages,
  currentUserId,
  showFlag,
  showUrgent,
  isLoading,
  hasMore,
  onLoadMore,
  shouldScrollToBottom = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldScrollToBottom && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length, shouldScrollToBottom]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || !hasMore || isLoading) {
      return;
    }
    if (el.scrollTop === 0) {
      onLoadMore();
    }
  };

  return (
    <div className="message-list" ref={containerRef} onScroll={handleScroll}>
      {hasMore && (
        <button
          type="button"
          className="message-list__load-more"
          onClick={onLoadMore}
          disabled={isLoading}
        >
          {isLoading ? 'Загрузка…' : 'Загрузить ещё'}
        </button>
      )}

      {messages.length === 0 && !isLoading && (
        <div className="message-list__empty">Сообщений пока нет</div>
      )}

      <div className="message-list__items">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            showFlag={showFlag}
            showUrgent={showUrgent}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageList;