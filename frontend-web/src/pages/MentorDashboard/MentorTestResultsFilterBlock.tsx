import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

interface ChildOption {
    id: number;
    user_id?: number;
    name: string;
    login: string;
}

interface MentorTestResultsFilterBlockProps {
    childId: number | '';
    testId: number | '';
    onChangeChild: (value: number | '') => void;
    onChangeTest: (value: number | '') => void;
}

export default function MentorTestResultsFilterBlock({
    childId,
    onChangeChild,
}: MentorTestResultsFilterBlockProps) {
    const [children, setChildren] = useState<ChildOption[]>([]);

    useEffect(() => {
        let cancelled = false;

        apiClient
            .get('/mentor/children')
            .then((res) => {
                if (cancelled) return;
                const payload = res.data?.data ?? res.data;
                setChildren(Array.isArray(payload) ? payload : []);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке детей:', error);
                if (!cancelled) setChildren([]);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="users-filter">
            <select
                className="users-filter__select"
                value={childId}
                onChange={(e) =>
                    onChangeChild(e.target.value ? Number(e.target.value) : '')
                }
            >
                <option value="">Все дети</option>
                {children.map((child) => (
                    <option key={child.id} value={child.user_id ?? child.id}>
                        {child.name}{child.login ? ` (${child.login})` : ''}
                    </option>
                ))}
            </select>
        </div>
    );
}
