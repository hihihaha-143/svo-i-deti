import { FC } from 'react';
import ChatListItem from './ChatListItem';
import type { ChatListItemData } from './ChatListItem';

interface ChatListProps {
  chats: ChatListItemData[];
  activeId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
}

const ChatList: FC<ChatListProps> = ({ chats, activeId, onSelect, isLoading }) => {
  if (isLoading) {
    return <div className="chat-list chat-list--loading">Загрузка чатов…</div>;
  }

  if (chats.length === 0) {
    return <div className="chat-list chat-list--empty">Чатов пока нет</div>;
  }

  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeId}
          onClick={onSelect}
        />
      ))}
    </div>
  );
};

export default ChatList;