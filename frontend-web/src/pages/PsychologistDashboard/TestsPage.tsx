import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import TestsFilterBlock from './TestsFilterBlock';
import TestsTableBlock from './TestsTableBlock';
import TestsFormModal from './TestsFormModal';
import QuestionsModal from './QuestionsModal';

interface TestRow {
    id: number;
    title: string;
    for_whom: string;
    for_whom_label: string;
    description: string | null;
    age_restrictions: { min?: number; max?: number } | null;
    motivation_text: string | null;
    coloring_file: string | null;
    coloring_file_url: string | null;
    is_active: boolean;
    is_monthly: boolean;
    questions_count: number;
    created_at: string;
}

export default function TestsPage() {
    const { showToast } = useToast();

    const [search, setSearch] = useState('');
    const [forWhom, setForWhom] = useState('all');
    const [isActive, setIsActive] = useState('all');
    const [isMonthly, setIsMonthly] = useState('all');
    const [page, setPage] = useState(1);

    const [data, setData] = useState<TestRow[]>([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTestId, setEditingTestId] = useState<number | null>(null);

    const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
    const [questionsTestId, setQuestionsTestId] = useState<number | null>(null);

    const fetchTests = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/psychologist/tests', {
                params: {
                    search: search || undefined,
                    for_whom: forWhom,
                    is_active: isActive,
                    is_monthly: isMonthly,
                    page,
                },
            });
            setData(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            console.error('Ошибка загрузки тестов:', error);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [search, forWhom, isActive, isMonthly]);

    useEffect(() => {
        fetchTests();
    }, [search, forWhom, isActive, isMonthly, page]);

    const handleReset = () => {
        setSearch('');
        setForWhom('all');
        setIsActive('all');
        setIsMonthly('all');
        setPage(1);
    };

    const handleAdd = () => {
        setEditingTestId(null);
        setIsFormOpen(true);
    };

    const handleEdit = (test: TestRow) => {
        setEditingTestId(test.id);
        setIsFormOpen(true);
    };

    const handleDelete = async (test: TestRow) => {
        if (!window.confirm(`Удалить тест «${test.title}»?`)) return;

        try {
            await apiClient.delete(`/psychologist/tests/${test.id}`);
            showToast('Тест удалён', 'success');
            fetchTests();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Ошибка при удалении';
            showToast(msg, 'error');
        }
    };

    const handleToggleActive = async (test: TestRow) => {
        try {
            const res = await apiClient.get(`/psychologist/tests/${test.id}`);
            const fullTest = res.data.data;

            await apiClient.put(`/psychologist/tests/${test.id}`, {
                ...fullTest,
                is_active: !test.is_active,
            });

            showToast(test.is_active ? 'Тест скрыт' : 'Тест опубликован', 'success');
            fetchTests();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Ошибка при изменении статуса';
            showToast(msg, 'error');
        }
    };

    const handleManageQuestions = (test: TestRow) => {
        setQuestionsTestId(test.id);
        setIsQuestionsOpen(true);
    };

    return (
        <div className="users-page">
            <div className="event-page-header">
                <button className="event-page-header__add-btn" onClick={handleAdd}>
                    + Создать тест
                </button>
            </div>

            <TestsFilterBlock
                search={search}
                forWhom={forWhom}
                isActive={isActive}
                isMonthly={isMonthly}
                onSearchChange={setSearch}
                onForWhomChange={setForWhom}
                onIsActiveChange={setIsActive}
                onIsMonthlyChange={setIsMonthly}
                onReset={handleReset}
            />

            <TestsTableBlock
                data={data}
                isLoading={isLoading}
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                total={meta.total}
                onPageChange={setPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onManageQuestions={handleManageQuestions}
            />

            <TestsFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                testId={editingTestId}
                onSuccess={fetchTests}
            />

            <QuestionsModal
                isOpen={isQuestionsOpen}
                onClose={() => setIsQuestionsOpen(false)}
                testId={questionsTestId}
                onSuccess={fetchTests}
            />
        </div>
    );
}