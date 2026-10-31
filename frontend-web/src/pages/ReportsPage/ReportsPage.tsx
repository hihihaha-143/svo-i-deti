import { useCallback, useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import ReportsFilterBlock, { type ReportsFilters } from './ReportsFilterBlock';
import ReportsTableBlock from './ReportsTableBlock';
import ReportChildModal from './ReportChildModal';

interface ReportChildRow {
    id: number;
    name: string;
    login: string;
    moods_total: number;
    moods_good: number;
    moods_normal: number;
    moods_bad: number;
    tests_completed: number;
    is_active: boolean;
    is_risk: boolean;
}

interface ReportSummary {
    total_children: number;
    active_children: number;
    children_with_tests: number;
    children_in_risk: number;
}

interface ReportResponse {
    period: { from: string; to: string };
    summary: ReportSummary;
    children: ReportChildRow[];
}

function toISODate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

const INITIAL_FILTERS: ReportsFilters = (() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { date_from: toISODate(from), date_to: toISODate(to) };
})();

export default function ReportsPage() {
    const { showToast } = useToast();

    const [filters, setFilters] = useState<ReportsFilters>(INITIAL_FILTERS);
    const [data, setData] = useState<ReportResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [childId, setChildId] = useState<number | null>(null);
    const [isChildOpen, setIsChildOpen] = useState(false);

    const fetchReport = useCallback(() => {
        setIsLoading(true);
        apiClient.get('/psychologist/reports/children', {
            params: {
                date_from: filters.date_from,
                date_to: filters.date_to,
            },
        })
            .then(res => setData(res.data))
            .catch(() => showToast('Не удалось загрузить отчёт', 'error'))
            .finally(() => setIsLoading(false));
    }, [filters]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
            const res = await apiClient.get('/psychologist/reports/children/export', {
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
            link.download = `report-children-${filters.date_from}_${filters.date_to}.pdf`;
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

    const handleOpenChild = (row: ReportChildRow) => {
        setChildId(row.id);
        setIsChildOpen(true);
    };

    return (
        <div className="users-page">
            <ReportsFilterBlock filters={filters} onChange={setFilters} />

            {data && (
                <div className="stats-cards">
                    <div className="stats-cards__item">
                        <div className="stats-cards__label">Всего детей</div>
                        <div className="stats-cards__value">{data.summary.total_children}</div>
                    </div>
                    <div className="stats-cards__item">
                        <div className="stats-cards__label">Активных</div>
                        <div className="stats-cards__value">{data.summary.active_children}</div>
                    </div>
                    <div className="stats-cards__item">
                        <div className="stats-cards__label">Прошли тесты</div>
                        <div className="stats-cards__value">{data.summary.children_with_tests}</div>
                    </div>
                    <div className="stats-cards__item">
                        <div className="stats-cards__label">В зоне риска</div>
                        <div className="stats-cards__value">{data.summary.children_in_risk}</div>
                    </div>
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

            <ReportsTableBlock
                items={data?.children ?? []}
                isLoading={isLoading}
                onOpenChild={handleOpenChild}
            />

            <ReportChildModal
                isOpen={isChildOpen}
                onClose={() => setIsChildOpen(false)}
                childId={childId}
                filters={filters}
            />
        </div>
    );
}