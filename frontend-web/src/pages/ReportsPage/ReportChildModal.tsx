import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import { type ReportsFilters } from './ReportsFilterBlock';

interface MoodRow {
    id: number;
    value: 'good' | 'normal' | 'bad';
    created_at: string;
}

interface AttemptRow {
    id: number;
    test: string | null;
    is_completed: boolean;
    finished_at: string | null;
}

interface ChildReport {
    period: { from: string; to: string };
    child: { id: number; name: string; login: string };
    summary: {
        moods_total: number;
        moods_good: number;
        moods_normal: number;
        moods_bad: number;
        tests_completed: number;
        is_risk: boolean;
    };
    moods: MoodRow[];
    attempts: AttemptRow[];
}

interface ReportChildModalProps {
    isOpen: boolean;
    onClose: () => void;
    childId: number | null;
    filters: ReportsFilters;
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hh}:${mm}`;
}

const MOOD_LABEL: Record<MoodRow['value'], string> = {
    good: 'Хорошо',
    normal: 'Нейтрально',
    bad: 'Плохо',
};

export default function ReportChildModal({ isOpen, onClose, childId, filters }: ReportChildModalProps) {
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [data, setData] = useState<ChildReport | null>(null);

    useEffect(() => {
        if (!isOpen || childId === null) return;

        setIsLoading(true);
        setData(null);

        apiClient.get(`/psychologist/reports/children/${childId}`, {
            params: {
                date_from: filters.date_from,
                date_to: filters.date_to,
            },
        })
            .then(res => setData(res.data))
            .catch(() => showToast('Не удалось загрузить отчёт по ребёнку', 'error'))
            .finally(() => setIsLoading(false));
    }, [isOpen, childId, filters]);

    const handleExportPdf = async () => {
        if (childId === null) return;

        setIsExporting(true);
        try {
            const res = await apiClient.get(`/psychologist/reports/children/${childId}/export`, {
                params: {
                    date_from: filters.date_from,
                    date_to: filters.date_to,
                },
                responseType: 'blob',
            });

            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report-child-${childId}-${filters.date_from}_${filters.date_to}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            showToast('Не удалось сформировать PDF', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const title = data?.child
        ? `Отчёт: ${data.child.name} (${data.child.login})`
        : 'Отчёт по ребёнку';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            {isLoading ? (
                <div className="users-table__loading">Загрузка...</div>
            ) : !data ? (
                <div className="users-table__empty">Нет данных</div>
            ) : (
                <div className="report-child">
                    <div className="report-child__period">
                        Период: {data.period.from} — {data.period.to}
                    </div>

                    <div className="stats-cards">
                        <div className="stats-cards__item">
                            <div className="stats-cards__label">Настроений</div>
                            <div className="stats-cards__value">{data.summary.moods_total}</div>
                        </div>
                        <div className="stats-cards__item">
                            <div className="stats-cards__label">Хорошо</div>
                            <div className="stats-cards__value">{data.summary.moods_good}</div>
                        </div>
                        <div className="stats-cards__item">
                            <div className="stats-cards__label">Нейтрально</div>
                            <div className="stats-cards__value">{data.summary.moods_normal}</div>
                        </div>
                        <div className="stats-cards__item">
                            <div className="stats-cards__label">Плохо</div>
                            <div className="stats-cards__value">{data.summary.moods_bad}</div>
                        </div>
                        <div className="stats-cards__item">
                            <div className="stats-cards__label">Тестов</div>
                            <div className="stats-cards__value">{data.summary.tests_completed}</div>
                        </div>
                    </div>

                    {data.summary.is_risk && (
                        <div className="report-child__risk">
                            Ребёнок в зоне риска: 3 дня подряд плохое настроение
                        </div>
                    )}

                    <div className="users-header">
                        <div className="users-header__actions">
                            <button
                                type="button"
                                className="users-header__export-btn"
                                onClick={handleExportPdf}
                                disabled={isExporting}
                            >
                                <Download size={16} />
                                {isExporting ? 'Формирование...' : 'Экспорт PDF'}
                            </button>
                        </div>
                    </div>

                    <div className="report-section-title">Настроения</div>
                    {data.moods.length === 0 ? (
                        <div className="users-table__empty">Отметок настроения за период нет</div>
                    ) : (
                        <div className="users-table">
                            <table className="users-table__table">
                                <thead>
                                    <tr>
                                        <th>Дата</th>
                                        <th>Настроение</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.moods.map(m => (
                                        <tr key={m.id}>
                                            <td data-label="Дата">{formatDate(m.created_at)}</td>
                                            <td data-label="Настроение">
                                                <span className={`login-role-badge login-role-badge--${m.value === 'good' ? 'parent' : m.value === 'bad' ? 'child' : 'mentor'}`}>
                                                    {MOOD_LABEL[m.value]}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="report-section-title">Пройденные тесты</div>
                    {data.attempts.length === 0 ? (
                        <div className="users-table__empty">Попыток прохождения тестов за период нет</div>
                    ) : (
                        <div className="users-table">
                            <table className="users-table__table">
                                <thead>
                                    <tr>
                                        <th>Тест</th>
                                        <th>Статус</th>
                                        <th>Дата</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.attempts.map(a => (
                                        <tr key={a.id}>
                                            <td data-label="Тест">{a.test}</td>
                                            <td data-label="Статус">
                                                {a.is_completed ? (
                                                    <span className="login-role-badge login-role-badge--parent">Завершён</span>
                                                ) : (
                                                    <span className="login-role-badge login-role-badge--unknown">В процессе</span>
                                                )}
                                            </td>
                                            <td data-label="Дата">{formatDate(a.finished_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}