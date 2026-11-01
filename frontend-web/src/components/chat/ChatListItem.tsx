import { FC } from 'react';

export interface ChatListItemData {
  id: number;
  type: string;
  interlocutor: {
    id: number;
    name: string;
    role: string;
  } | null;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  has_urgent: boolean;
  is_archived: boolean;
}

interface ChatListItemProps {
  chat: ChatListItemData;
  isActive: boolean;
  onClick: (id: number) => void;
}

const formatTime = (iso: string | null): string => {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
};

const ChatListItem: FC<ChatListItemProps> = ({ chat, isActive, onClick }) => {
  const classes = ['chat-list-item'];
  if (isActive) {
    classes.push('chat-list-item--active');
  }
  if (chat.has_urgent) {
    classes.push('chat-list-item--urgent');
  }

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={() => onClick(chat.id)}
    >
      <div className="chat-list-item__top">
        <span className="chat-list-item__name">
          {chat.interlocutor?.name ?? 'Диалог'}
        </span>
        <span className="chat-list-item__time">{formatTime(chat.last_message_at)}</span>
      </div>

      <div className="chat-list-item__bottom">
        <span className="chat-list-item__preview">
          {chat.last_message_preview ?? 'Нет сообщений'}
        </span>
        {chat.unread_count > 0 && (
          <span className="chat-list-item__unread">{chat.unread_count}</span>
        )}
      </div>

      {chat.has_urgent && (
        <span className="chat-list-item__urgent-badge">Срочно</span>
      )}
    </button>
  );
};

export default ChatListItem;