import { useCallback, useEffect, useState } from 'react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import TestResultsFilterBlock, { type TestResultsFilters } from './TestResultsFilterBlock';
import TestResultsTableBlock, { type TestResultItem } from './TestResultsTableBlock';
import TestResultViewModal from './TestResultViewModal';
import TestResultCompareModal from './TestResultCompareModal';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const INITIAL_FILTERS: TestResultsFilters = {
    child_id: null,
    test_id: null,
    date_from: '',
    date_to: '',
};

export default function TestResultsPage() {
    const { showToast } = useToast();

    const [filters, setFilters] = useState<TestResultsFilters>(INITIAL_FILTERS);
    const [page, setPage] = useState(1);
    const [items, setItems] = useState<TestResultItem[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [viewAttemptId, setViewAttemptId] = useState<number | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const [compareAttemptId, setCompareAttemptId] = useState<number | null>(null);
    const [isCompareOpen, setIsCompareOpen] = useState(false);

    const fetchResults = useCallback(() => {
        setIsLoading(true);
        const params: Record<string, any> = { page, per_page: 15 };
        if (filters.child_id) params.child_id = filters.child_id;
        if (filters.test_id) params.test_id = filters.test_id;
        if (filters.date_from) params.date_from = filters.date_from;
        if (filters.date_to) params.date_to = filters.date_to;

        apiClient.get('/psychologist/test-results', { params })
            .then(res => {
                const data = res.data;
                setItems(data.data || []);
                setPagination({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    per_page: data.per_page,
                    total: data.total,
                });
            })
            .catch(() => showToast('Не удалось загрузить результаты', 'error'))
            .finally(() => setIsLoading(false));
    }, [filters, page]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const handleFiltersChange = (next: TestResultsFilters) => {
        setFilters(next);
        setPage(1);
    };

    const handleView = (item: TestResultItem) => {
        setViewAttemptId(item.id);
        setIsViewOpen(true);
    };

    const handleCompare = (item: TestResultItem) => {
        setCompareAttemptId(item.id);
        setIsCompareOpen(true);
    };

    const handleDelete = (item: TestResultItem) => {
        if (!window.confirm('Удалить результат теста?')) return;

        apiClient.delete(`/psychologist/test-results/${item.id}`)
            .then(() => {
                showToast('Результат удалён', 'success');
                fetchResults();
            })
            .catch(() => showToast('Не удалось удалить результат', 'error'));
    };

    return (
        <div className="users-page">
            <TestResultsFilterBlock filters={filters} onChange={handleFiltersChange} />

            <TestResultsTableBlock
                items={items}
                pagination={pagination}
                onPageChange={setPage}
                onView={handleView}
                onCompare={handleCompare}
                onDelete={handleDelete}
                isLoading={isLoading}
            />

            <TestResultViewModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                attemptId={viewAttemptId}
            />

            <TestResultCompareModal
                isOpen={isCompareOpen}
                onClose={() => setIsCompareOpen(false)}
                attemptId={compareAttemptId}
            />
        </div>
    );
}