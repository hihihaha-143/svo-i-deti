import { FileDown } from 'lucide-react';

interface MoodHeaderBlockProps {
    onExport: () => void;
    isExporting: boolean;
}

export default function MoodHeaderBlock({ onExport, isExporting }: MoodHeaderBlockProps) {
    return (
        <div className="mood-header">
            <button
                className="mood-header__export-btn"
                onClick={onExport}
                disabled={isExporting}
            >
                <FileDown size={20} /> {isExporting ? 'Формируется...' : 'Скачать PDF'}
            </button>
        </div>
    );
}