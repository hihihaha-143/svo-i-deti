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

        if (question.type === 'single') {
            if (typeof value === 'string') return value;
            if (typeof value === 'object') {
                if (typeof value.text === 'string' && value.text !== '') return value.text;

                const options = Array.isArray(question.options) ? question.options : [];
                const idx = value.index;
                const optionId = value.option_id;

                if (typeof idx === 'number' && options[idx]?.text) return options[idx].text;
                if (typeof optionId === 'number' && options[optionId - 1]?.text) return options[optionId - 1].text;

                return `Вариант #${optionId ?? '?'}`;
            }
            return String(value);
        }

        if (question.type === 'scale') {
            if (typeof value === 'object' && 'value' in value) return String(value.value);
            return String(value);
        }

        if (question.type === 'luscher') {
            if (typeof value === 'object' && 'order' in value && Array.isArray(value.order)) {
                return value.order.join(' → ');
            }
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
                        className="compare-empty__btn"
                        onClick={() => showToast('Функция прохождения в разработке', 'info')}
                    >
                        <RotateCcw size={16} />
                        Пройти ещё раз
                    </button>
                </div>
            ) : (
                <div className="compare-view">
                    <div className="compare-view__meta">
                        Предыдущая попытка: {formatDate(data.previous_attempt?.completed_at ?? null)}
                    </div>
                    <div className="compare-view__table-wrap">
                        <table className="users-table__table compare-view__table">
                            <thead>
                                <tr>
                                    <th>Вопрос</th>
                                    <th className="compare-view__col">Прошлый ответ</th>
                                    <th className="compare-view__col">Текущий ответ</th>
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
                    </div>
                </div>
            )}
        </Modal>
    );
}