import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';

interface Lesson {
    id: number;
    lesson_number: number;
    lesson_date: string;
}

interface ChildRow {
    id: number;
    name: string;
}

interface EventData {
    id: number;
    title: string;
    type: string;
    lessons_count: number;
    start_date: string;
}

interface MentorEventAttendancePageProps {
    eventId: number;
    onBack: () => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function MentorEventAttendancePage({ eventId, onBack }: MentorEventAttendancePageProps) {
    const { showToast } = useToast();

    const [event, setEvent] = useState<EventData | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [children, setChildren] = useState<ChildRow[]>([]);
    const [attendance, setAttendance] = useState<Record<number, Record<number, boolean>>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

    const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestStateRef = useRef<{ lessons: Lesson[]; attendance: Record<number, Record<number, boolean>> }>({
        lessons: [],
        attendance: {},
    });

    useEffect(() => {
        latestStateRef.current = { lessons, attendance };
    }, [lessons, attendance]);

    useEffect(() => {
        const fetchAttendance = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get(`/mentor/events/${eventId}/attendance`);
                setEvent(response.data.event);
                setLessons(response.data.lessons);
                setChildren(response.data.children);
                setAttendance(response.data.attendance || {});
                setSaveStatus('idle');
            } catch (error) {
                console.error('Ошибка загрузки посещаемости:', error);
                showToast('Не удалось загрузить данные', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendance();
    }, [eventId]);

    const doSave = useCallback(async (silent = false) => {
        const { lessons: currentLessons, attendance: currentAttendance } = latestStateRef.current;
        if (!currentLessons.length) return;

        setSaveStatus('saving');
        try {
            const lessonsPayload = currentLessons.map(l => ({
                id: l.id,
                lesson_date: l.lesson_date,
            }));

            const attendancePayload: Array<{ lesson_id: number; child_id: number; attended: boolean }> = [];
            for (const lesson of currentLessons) {
                for (const child of children) {
                    attendancePayload.push({
                        lesson_id: lesson.id,
                        child_id: child.id,
                        attended: !!currentAttendance[lesson.id]?.[child.id],
                    });
                }
            }

            await apiClient.post(`/mentor/events/${eventId}/attendance`, {
                lessons: lessonsPayload,
                attendance: attendancePayload,
            });

            setSaveStatus('saved');
            if (!silent) {
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            setSaveStatus('error');
            showToast('Ошибка сохранения', 'error');
        }
    }, [eventId, children, showToast]);

    const scheduleSave = useCallback(() => {
        if (pendingSaveRef.current) {
            clearTimeout(pendingSaveRef.current);
        }
        pendingSaveRef.current = setTimeout(() => {
            doSave();
        }, 600);
    }, [doSave]);

    useEffect(() => {
        return () => {
            if (pendingSaveRef.current) {
                clearTimeout(pendingSaveRef.current);
                pendingSaveRef.current = null;
                doSave(true);
            }
        };
    }, [doSave]);

    const handleDateChange = (lessonId: number, newDate: string) => {
        setLessons(prev =>
            prev.map(l => (l.id === lessonId ? { ...l, lesson_date: newDate } : l))
        );
        scheduleSave();
    };

    const toggleAttendance = (lessonId: number, childId: number) => {
        setAttendance(prev => {
            const lessonMap = prev[lessonId] || {};
            return {
                ...prev,
                [lessonId]: {
                    ...lessonMap,
                    [childId]: !lessonMap[childId],
                },
            };
        });
        scheduleSave();
    };

    const actualLessonId = useMemo(() => {
        if (lessons.length === 0) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const withDiff = lessons.map(l => {
            const d = new Date(l.lesson_date);
            d.setHours(0, 0, 0, 0);
            return { id: l.id, diff: d.getTime() - today.getTime() };
        });

        const upcoming = withDiff.filter(x => x.diff >= 0).sort((a, b) => a.diff - b.diff);
        if (upcoming.length > 0) return upcoming[0].id;

        const past = withDiff.filter(x => x.diff < 0).sort((a, b) => b.diff - a.diff);
        return past.length > 0 ? past[0].id : null;
    }, [lessons]);

    const sortedLessons = useMemo(() => {
        const hasAnyAttendance = (lessonId: number) => {
            const map = attendance[lessonId];
            if (!map) return false;
            return Object.values(map).some(v => v);
        };

        return [...lessons].sort((a, b) => {
            const aHas = hasAnyAttendance(a.id) ? 1 : 0;
            const bHas = hasAnyAttendance(b.id) ? 1 : 0;
            if (aHas !== bHas) return bHas - aHas;
            return a.lesson_date.localeCompare(b.lesson_date);
        });
    }, [lessons, attendance]);

    if (isLoading) {
        return <div className="users-table__loading">Загрузка...</div>;
    }

    if (!event) {
        return <div className="users-table__empty">Мероприятие не найдено</div>;
    }

    return (
        <div className="users-page">
            <div className="attendance-header">
                <button className="attendance-header__back" onClick={onBack}>
                    <ArrowLeft size={20} /> Назад
                </button>
                <div className="attendance-header__info">
                    <h2 className="attendance-header__title">Посещаемость: {event.title}</h2>
                    <div className="attendance-header__subtitle">
                        Дата начала: {event.start_date} · Всего занятий: {event.lessons_count}
                    </div>
                </div>

                <div className={`attendance-status attendance-status--${saveStatus}`}>
                    {saveStatus === 'saving' && (
                        <>
                            <Loader2 size={16} className="attendance-status__spinner" />
                            <span>Сохранение...</span>
                        </>
                    )}
                    {saveStatus === 'saved' && (
                        <>
                            <Check size={16} />
                            <span>Сохранено</span>
                        </>
                    )}
                    {saveStatus === 'error' && (
                        <>
                            <AlertCircle size={16} />
                            <span>Ошибка сохранения</span>
                        </>
                    )}
                </div>
            </div>

            <div className="attendance-cards">
                {sortedLessons.map(lesson => {
                    const hasAny = Object.values(attendance[lesson.id] || {}).some(v => v);
                    const isActual = lesson.id === actualLessonId;
                    return (
                        <div
                            key={lesson.id}
                            className={[
                                'attendance-card',
                                hasAny ? 'attendance-card--marked' : '',
                                isActual ? 'attendance-card--actual' : '',
                            ].filter(Boolean).join(' ')}
                        >
                            <div className="attendance-card__header">
                                <span className="attendance-card__title">
                                    Занятие {lesson.lesson_number}
                                    {isActual && <span className="attendance-card__actual-badge">Сейчас</span>}
                                </span>
                                <input
                                    type="date"
                                    className="attendance-card__date"
                                    value={lesson.lesson_date}
                                    onChange={(e) => handleDateChange(lesson.id, e.target.value)}
                                />
                            </div>
                            <div className="attendance-card__children">
                                {children.map(child => (
                                    <label key={child.id} className="attendance-card__child">
                                        <input
                                            type="checkbox"
                                            checked={!!attendance[lesson.id]?.[child.id]}
                                            onChange={() => toggleAttendance(lesson.id, child.id)}
                                        />
                                        <span>{child.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}