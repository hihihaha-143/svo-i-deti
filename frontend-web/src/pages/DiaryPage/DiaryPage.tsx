import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import DiaryHeaderBlock from './DiaryHeaderBlock';
import DiaryFilterBlock from './DiaryFilterBlock';
import DiaryTableBlock from './DiaryTableBlock';
import DiaryViewModal from './DiaryViewModal';

interface DiaryRow {
    id: number;
    child_id: number;
    child_name: string;
    parent_id: number;
    parent_name: string;
    event: string;
    event_label: string;
    text: string;
    date: string;
}

interface ChildOption {
    id: number;
    name: string;
}

interface ParentOption {
    id: number;
    name: string;
}

interface EventOption {
    value: string;
    label: string;
}

export default function DiaryPage() {
    const { showToast } = useToast();

    const [childId, setChildId] = useState<string>('all');
    const [parentId, setParentId] = useState<string>('all');
    const [event, setEvent] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);

    const [data, setData] = useState<DiaryRow[]>([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [children, setChildren] = useState<ChildOption[]>([]);
    const [parents, setParents] = useState<ParentOption[]>([]);
    const [events, setEvents] = useState<EventOption[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const [viewEntry, setViewEntry] = useState<DiaryRow | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    useEffect(() => {
        setPage(1);
    }, [childId, parentId, event, dateFrom, dateTo]);

    useEffect(() => {
        const fetchDiaries = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get('/psychologist/diaries', {
                    params: {
                        child_id: childId,
                        parent_id: parentId,
                        event,
                        date_from: dateFrom || undefined,
                        date_to: dateTo || undefined,
                        page,
                    },
                });
                setData(response.data.data);
                setMeta(response.data.meta);
                setChildren(response.data.children);
                setParents(response.data.parents);
                setEvents(response.data.events);
            } catch (error) {
                console.error('Ошибка загрузки дневников:', error);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDiaries();
    }, [childId, parentId, event, dateFrom, dateTo, page]);

    const handleReset = () => {
        setChildId('all');
        setParentId('all');
        setEvent('all');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    const handleView = (entry: DiaryRow) => {
        setViewEntry(entry);
        setIsViewOpen(true);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await apiClient.get('/psychologist/diaries/export', {
                params: {
                    child_id: childId,
                    parent_id: parentId,
                    event,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `diaries-${new Date().toISOString().slice(0, 10)}.pdf`;
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
            <DiaryHeaderBlock onExport={handleExport} isExporting={isExporting} />
            <DiaryFilterBlock
                childId={childId}
                parentId={parentId}
                event={event}
                dateFrom={dateFrom}
                dateTo={dateTo}
                children={children}
                parents={parents}
                events={events}
                onChildChange={setChildId}
                onParentChange={setParentId}
                onEventChange={setEvent}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onReset={handleReset}
            />
            <DiaryTableBlock
                data={data}
                isLoading={isLoading}
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                total={meta.total}
                onPageChange={setPage}
                onView={handleView}
            />
            <DiaryViewModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                entry={viewEntry}
            />
        </div>
    );
}