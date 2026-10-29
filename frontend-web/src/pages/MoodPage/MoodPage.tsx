import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import MoodHeaderBlock from './MoodHeaderBlock';
import MoodFilterBlock from './MoodFilterBlock';
import MoodStatsBlock from './MoodStatsBlock';
import MoodChartBlock from './MoodChartBlock';
import MoodTableBlock from './MoodTableBlock';

interface MoodRow {
    id: number;
    child_id: number;
    child_name: string;
    mood: string;
    mood_label: string;
    date: string;
    risk: boolean;
}

interface ChartPoint {
    date: string;
    date_full: string;
    mood: string;
    mood_label: string;
    value: number;
    child_name: string;
}

interface ChildOption {
    id: number;
    name: string;
}

interface Summary {
    good: number;
    normal: number;
    bad: number;
}

export default function MoodPage() {
    const { showToast } = useToast();

    const [childId, setChildId] = useState<string>('all');
    const [mood, setMood] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);

    const [data, setData] = useState<MoodRow[]>([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [summary, setSummary] = useState<Summary>({ good: 0, normal: 0, bad: 0 });
    const [chart, setChart] = useState<ChartPoint[]>([]);
    const [children, setChildren] = useState<ChildOption[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Сброс страницы при смене фильтров
    useEffect(() => {
        setPage(1);
    }, [childId, mood, dateFrom, dateTo]);

    useEffect(() => {
        const fetchMoods = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get('/psychologist/moods', {
                    params: {
                        child_id: childId,
                        mood,
                        date_from: dateFrom || undefined,
                        date_to: dateTo || undefined,
                        page,
                    },
                });
                setData(response.data.data);
                setMeta(response.data.meta);
                setSummary(response.data.summary);
                setChart(response.data.chart);
                setChildren(response.data.children);
            } catch (error) {
                console.error('Ошибка загрузки настроений:', error);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMoods();
    }, [childId, mood, dateFrom, dateTo, page]);

    const handleReset = () => {
        setChildId('all');
        setMood('all');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await apiClient.get('/psychologist/moods/export', {
                params: {
                    child_id: childId,
                    mood,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `moods-${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            showToast('Файл выгружен', 'success');
        } catch (error: any) {
            if (error.response?.status === 404) {
                showToast('Нет данных для выгрузки', 'error');
            } else {
                console.error('Ошибка при экспорте:', error);
                showToast('Ошибка при выгрузке файла', 'error');
            }
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="users-page">
            <MoodHeaderBlock onExport={handleExport} isExporting={isExporting} />
            <MoodFilterBlock
                childId={childId}
                mood={mood}
                dateFrom={dateFrom}
                dateTo={dateTo}
                children={children}
                onChildChange={setChildId}
                onMoodChange={setMood}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onReset={handleReset}
            />
            <MoodStatsBlock summary={summary} />
            <MoodChartBlock data={chart} />
            <MoodTableBlock
                data={data}
                isLoading={isLoading}
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                total={meta.total}
                onPageChange={setPage}
            />
        </div>
    );
}