import Modal from '../../components/Modal/Modal';

interface DiaryRow {
    id: number;
    child_name: string;
    parent_name: string;
    event_label: string;
    text: string;
    date: string;
}

interface DiaryViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: DiaryRow | null;
}

export default function DiaryViewModal({ isOpen, onClose, entry }: DiaryViewModalProps) {
    if (!entry) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Запись дневника">
            <div className="diary-view">
                <div className="diary-view__meta">
                    <div className="diary-view__meta-row">
                        <span className="diary-view__meta-label">Ребёнок:</span>
                        <span className="diary-view__meta-value">{entry.child_name}</span>
                    </div>
                    <div className="diary-view__meta-row">
                        <span className="diary-view__meta-label">Родитель:</span>
                        <span className="diary-view__meta-value">{entry.parent_name}</span>
                    </div>
                    <div className="diary-view__meta-row">
                        <span className="diary-view__meta-label">Событие:</span>
                        <span className="diary-view__badge">{entry.event_label}</span>
                    </div>
                    <div className="diary-view__meta-row">
                        <span className="diary-view__meta-label">Дата:</span>
                        <span className="diary-view__meta-value">{entry.date}</span>
                    </div>
                </div>
                <div className="diary-view__text">{entry.text}</div>
            </div>
        </Modal>
    );
}