import { FC, FormEvent, useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (body: string, isUrgent: boolean) => void;
  allowUrgent: boolean;
  disabled?: boolean;
}

const MessageInput: FC<MessageInputProps> = ({ onSend, allowUrgent, disabled }) => {
  const [body, setBody] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) {
      return;
    }
    setSending(true);
    try {
      await onSend(trimmed, isUrgent);
      setBody('');
      setIsUrgent(false);
    } finally {
      setSending(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <div className="message-input__row">
        <textarea
          ref={textareaRef}
          className="message-input__field"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Напишите сообщение…"
          rows={2}
          maxLength={5000}
          disabled={disabled || sending}
        />
        <button
          type="submit"
          className="message-input__send"
          disabled={disabled || sending || body.trim().length === 0}
        >
          Отправить
        </button>
      </div>

      {allowUrgent && (
        <label className="message-input__urgent">
          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
            disabled={disabled || sending}
          />
          <span>Срочное сообщение</span>
        </label>
      )}
    </form>
  );
};

export default MessageInput;