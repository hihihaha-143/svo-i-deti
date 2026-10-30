import { useEffect, useState } from 'react';
import apiClient from '../../api/client';

interface ChildOption {
    id: number;
    name: string;
    login: string;
}

interface TestOption {
    id: number;
    title: string;
}

export interface TestResultsFilters {
    child_id: number | null;
    test_id: number | null;
    date_from: string;
    date_to: string;
}

interface TestResultsFilterBlockProps {
    filters: TestResultsFilters;
    onChange: (filters: TestResultsFilters) => void;
}

export default function TestResultsFilterBlock({ filters, onChange }: TestResultsFilterBlockProps) {
    const [children, setChildren] = useState<ChildOption[]>([]);
    const [tests, setTests] = useState<TestOption[]>([]);

    useEffect(() => {
        apiClient.get('/psychologist/users', { params: { role: 'child', per_page: 500 } })
            .then(res => {
                const items = res.data.data || res.data;
                setChildren(items.map((u: any) => ({
                    id: u.id,
                    name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.login,
                    login: u.login,
                })));
            })
            .catch(() => {});

        apiClient.get('/psychologist/tests', { params: { per_page: 500 } })
            .then(res => {
                const items = res.data.data || res.data;
                setTests(items.map((t: any) => ({ id: t.id, title: t.title })));
            })
            .catch(() => {});
    }, []);

    const update = (patch: Partial<TestResultsFilters>) => {
        onChange({ ...filters, ...patch });
    };

    return (
        <div className="users-filter">
            <div className="users-filter__field">
                <label className="users-filter__label">Ребёнок</label>
                <select
                    className="users-filter__select"
                    value={filters.child_id ?? ''}
                    onChange={(e) => update({ child_id: e.target.value ? Number(e.target.value) : null })}
                >
                    <option value="">Все дети</option>
                    {children.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Тест</label>
                <select
                    className="users-filter__select"
                    value={filters.test_id ?? ''}
                    onChange={(e) => update({ test_id: e.target.value ? Number(e.target.value) : null })}
                >
                    <option value="">Все тесты</option>
                    {tests.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                </select>
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Дата от</label>
                <input
                    type="date"
                    className="users-filter__input"
                    value={filters.date_from}
                    onChange={(e) => update({ date_from: e.target.value })}
                />
            </div>

            <div className="users-filter__field">
                <label className="users-filter__label">Дата до</label>
                <input
                    type="date"
                    className="users-filter__input"
                    value={filters.date_to}
                    onChange={(e) => update({ date_to: e.target.value })}
                />
            </div>
        </div>
    );
}