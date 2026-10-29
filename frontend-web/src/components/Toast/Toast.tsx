import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const ICONS = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
};

export default function Toast({ message, type, onClose }: ToastProps) {
    const Icon = ICONS[type];

    return (
        <div className={`toast toast--${type}`}>
            <Icon size={18} className="toast__icon" />
            <span className="toast__message">{message}</span>
            <button className="toast__close" onClick={onClose} aria-label="Закрыть">
                <X size={16} />
            </button>
        </div>
    );
}