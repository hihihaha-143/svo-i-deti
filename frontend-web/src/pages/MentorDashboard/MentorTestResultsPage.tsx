import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import MentorTestResultsFilterBlock from './MentorTestResultsFilterBlock';
import MentorTestResultsTableBlock from './MentorTestResultsTableBlock';

export interface MentorTestResult {
    id: number;
    child: { id: number; name: string; login: string };
    test: { id: number; title: string };
    completed_at: string | null;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function MentorTestResultsPage() {
    const [childId, setChildId] = useState<number | ''>('');
    const [testId, setTestId] = useState<number | ''>('');
    const [page, setPage] = useState(1);
    const [data, setData] = useState<Paginated<MentorTestResult> | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        apiClient
            .get<Paginated<MentorTestResult>>('/mentor/test-results', {
                params: {
                    child_id: childId || undefined,
                    test_id: testId || undefined,
                    page,
                },
            })
            .then((res) => {
                if (!cancelled) setData(res.data);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке результатов тестов:', error);
                if (!cancelled) setData(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [childId, testId, page]);

    return (
        <div className="users-page">
            <h1 className="users-page__title">Результаты тестов</h1>

            <MentorTestResultsFilterBlock
                childId={childId}
                testId={testId}
                onChangeChild={(v) => {
                    setChildId(v);
                    setPage(1);
                }}
                onChangeTest={(v) => {
                    setTestId(v);
                    setPage(1);
                }}
            />

            <MentorTestResultsTableBlock
                rows={data?.data ?? []}
                loading={loading}
                currentPage={data?.current_page ?? 1}
                lastPage={data?.last_page ?? 1}
                onPageChange={setPage}
            />
        </div>
    );
}
