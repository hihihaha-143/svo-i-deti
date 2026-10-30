import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';

interface CompareQuestion {
    id: number;
    text: string;
    type: string;
    options: any;
}

interface CompareRow {
    question: CompareQuestion;
    current: any;
    previous: any;
}

interface CompareResponse {
    has_previous: boolean;
    attempt: {
        id: number;
        child: { id: number; name: string; login: string };
        test: { id: number; title: string };
    };
    previous_attempt?: {
        id: number;
        completed_at: string | null;
    };
    rows?: CompareRow[];
}

interface TestResultCompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    attemptId: number | null;
}

export default function TestResultCompareModal({
    isOpen,
    onClose,
    attemptId,
}: TestResultCompareModalProps) {
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<CompareResponse | null>(null);

    useEffect(() => {
        if (!isOpen || attemptId === null) return;

        setIsLoading(true);
        setData(null);

        apiClient.get(`/psychologist/test-results/${attemptId}/compare`)
            .then(res => setData(res.data))
            .catch(() => showToast('Не удалось загрузить сравнение', 'error'))
            .finally(() => setIsLoading(false));
    }, [isOpen, attemptId]);

    const formatDate = (iso: string | null): string => {
        if (!iso) return '—';
        const d = new Date(iso);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hh}:${mm}`;
    };

    const formatAnswer = (value: any, question: CompareQuestion): string => {
        if (value === null || value === undefined || value === '') return 'skipped';

        if (question.type === 'single' && value && typeof value === 'object' && 'option_id' in value) {
            const options = Array.isArray(question.options) ? question.options : [];
            const found = options.find((o: any) => Number(o.id) === Number(value.option_id));
            return found ? String(found.text) : `Вариант #${value.option_id}`;
        }

        if (question.type === 'scale' && value && typeof value === 'object' && 'value' in value) {
            return String(value.value);
        }

        if (question.type === 'luscher' && value && typeof value === 'object' && 'order' in value) {
            return Array.isArray(value.order) ? value.order.join(' → ') : String(value.order);
        }

        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') {
            if ('value' in value) return String(value.value);
            return JSON.stringify(value);
        }
        return String(value);
    };

    const title = data?.attempt
        ? `Сравнение: ${data.attempt.child.name || data.attempt.child.login} — ${data.attempt.test.title}`
        : 'Сравнение';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            {isLoading ? (
                <div className="users-table__loading">Загрузка...</div>
            ) : !data ? (
                <div className="users-table__empty">Нет данных для сравнения</div>
            ) : !data.has_previous ? (
                <div className="compare-empty">
                    <p className="compare-empty__text">Нет предыдущей попытки для сравнения.</p>
                    <button
                        type="button"
                        className="users-header__add-btn"
                        onClick={() => showToast('Функция прохождения в разработке', 'info')}
                    >
                        <RotateCcw size={16} />
                        Пройти ещё раз
                    </button>
                </div>
            ) : (
                <>
                    <div className="compare-meta">
                        Предыдущая попытка: {formatDate(data.previous_attempt?.completed_at ?? null)}
                    </div>
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Вопрос</th>
                                <th>Прошлый ответ</th>
                                <th>Текущий ответ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.rows ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan={3}>Ответов нет</td>
                                </tr>
                            ) : (
                                (data.rows ?? []).map(row => (
                                    <tr key={row.question.id}>
                                        <td data-label="Вопрос">{row.question.text}</td>
                                        <td data-label="Прошлый ответ">{formatAnswer(row.previous, row.question)}</td>
                                        <td data-label="Текущий ответ">{formatAnswer(row.current, row.question)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </>
            )}
        </Modal>
    );
}