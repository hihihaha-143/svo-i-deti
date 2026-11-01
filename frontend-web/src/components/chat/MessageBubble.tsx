import { FC } from 'react';

export interface MessageBubbleMessage {
  id: number;
  sender_id: number;
  body: string;
  is_urgent: boolean;
  is_flagged: boolean;
  created_at: string;
}

interface MessageBubbleProps {
  message: MessageBubbleMessage;
  currentUserId: number;
  showFlag: boolean;
  showUrgent: boolean;
}

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble: FC<MessageBubbleProps> = ({
  message,
  currentUserId,
  showFlag,
  showUrgent,
}) => {
  const isOwn = message.sender_id === currentUserId;

  const classes = ['message-bubble'];
  if (isOwn) {
    classes.push('message-bubble--own');
  }
  if (showFlag && message.is_flagged) {
    classes.push('message-bubble--flagged');
  }
  if (showUrgent && message.is_urgent) {
    classes.push('message-bubble--urgent');
  }

  return (
    <div className={classes.join(' ')}>
      <div className="message-bubble__body">{message.body}</div>
      <div className="message-bubble__meta">
        {showUrgent && message.is_urgent && (
          <span className="message-bubble__badge message-bubble__badge--urgent">
            Срочно
          </span>
        )}
        {showFlag && message.is_flagged && (
          <span className="message-bubble__badge message-bubble__badge--flag">
            Требует внимания
          </span>
        )}
        <span className="message-bubble__time">{formatTime(message.created_at)}</span>
      </div>
    </div>
  );
};

export default MessageBubble;