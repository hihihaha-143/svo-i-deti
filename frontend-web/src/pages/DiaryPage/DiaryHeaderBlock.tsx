import { FileDown } from 'lucide-react';

interface DiaryHeaderBlockProps {
    onExport: () => void;
    isExporting: boolean;
}

export default function DiaryHeaderBlock({ onExport, isExporting }: DiaryHeaderBlockProps) {
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