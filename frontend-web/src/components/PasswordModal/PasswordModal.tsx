import { Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Modal from '../Modal/Modal';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    password: string;
    userName: string;
}

export default function PasswordModal({ isOpen, onClose, password, userName }: PasswordModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Новый пароль">
            <div className="password-modal">
                <p className="password-modal__text">
                    Для пользователя <strong>{userName}</strong> сгенерирован новый пароль. 
                    Обязательно скопируйте его и передайте пользователю, после закрытия окна он больше не будет показан.
                </p>
                
                <div className="password-modal__box">
                    <span className="password-modal__value">{password}</span>
                    <button className="password-modal__copy" onClick={handleCopy}>
                        {copied ? <CheckCircle size={20} color="var(--right)" /> : <Copy size={20} />}
                    </button>
                </div>

                <div className="password-modal__actions">
                    <button className="password-modal__btn" onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </Modal>
    );
}