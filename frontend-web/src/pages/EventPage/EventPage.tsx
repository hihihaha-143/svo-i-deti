import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import EventFilterBlock from './EventFilterBlock';
import EventTableBlock from './EventTableBlock';
import EventFormModal from './EventFormModal';

interface EventRow {
    id: number;
    title: string;
    type: string;
    type_label: string;
    start_date: string;
    lessons_count: number;
    children_count: number;
    children_names: string[];
    description: string | null;
    schedule_type: string;
    schedule_interval: number | null;
    schedule_day_of_week: number | null;
}

interface ChildOption {
    id: number;
    name: string;
}

interface EventPageProps {
    onOpenAttendance: (eventId: number) => void;
}

export default function EventPage({ onOpenAttendance }: EventPageProps) {
    const { showToast } = useToast();

    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [lessonsCount, setLessonsCount] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);

    const [data, setData] = useState<EventRow[]>([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [children, setChildren] = useState<ChildOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/psychologist/events', {
                params: {
                    search: search || undefined,
                    type,
                    lessons_count: lessonsCount || undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                    page,
                },
            });
            setData(response.data.data);
            setMeta(response.data.meta);
            setChildren(response.data.children);
        } catch (error) {
            console.error('Ошибка загрузки мероприятий:', error);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [search, type, lessonsCount, dateFrom, dateTo]);

    useEffect(() => {
        fetchEvents();
    }, [search, type, lessonsCount, dateFrom, dateTo, page]);

    const handleReset = () => {
        setSearch('');
        setType('all');
        setLessonsCount('');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    const handleAdd = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    const handleEdit = (event: EventRow) => {
        setEditingEvent(event);
        setIsFormOpen(true);
    };

    const handleDelete = async (event: EventRow) => {
        if (!window.confirm(`Удалить мероприятие «${event.title}»?`)) return;

        try {
            await apiClient.delete(`/psychologist/events/${event.id}`);
            showToast('Мероприятие удалено', 'success');
            fetchEvents();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Ошибка при удалении';
            showToast(msg, 'error');
        }
    };

    const handleFormSuccess = () => {
        fetchEvents();
    };

    return (
        <div className="users-page">
            <div className="event-page-header">
                <button className="event-page-header__add-btn" onClick={handleAdd}>
                    + Добавить
                </button>
            </div>

            <EventFilterBlock
                search={search}
                type={type}
                lessonsCount={lessonsCount}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onSearchChange={setSearch}
                onTypeChange={setType}
                onLessonsCountChange={setLessonsCount}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onReset={handleReset}
            />

            <EventTableBlock
                data={data}
                isLoading={isLoading}
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                total={meta.total}
                onPageChange={setPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAttendance={(event) => onOpenAttendance(event.id)}
            />

            <EventFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                event={editingEvent}
                children={children}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
}