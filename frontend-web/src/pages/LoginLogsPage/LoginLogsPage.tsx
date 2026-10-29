import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import LoginLogsFilterBlock from './LoginLogsFilterBlock';
import LoginLogsTableBlock from './LoginLogsTableBlock';

interface LoginLog {
    id: number;
    datetime: string;
    name: string;
    login: string;
    role: string | null;
    role_label: string;
}

export default function LoginLogsPage() {
    const [role, setRole] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);

    const [data, setData] = useState<LoginLog[]>([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setPage(1);
    }, [role, debouncedSearch, dateFrom, dateTo]);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get('/psychologist/login-logs', {
                    params: {
                        role,
                        search: debouncedSearch,
                        date_from: dateFrom || undefined,
                        date_to: dateTo || undefined,
                        page,
                    },
                });
                setData(response.data.data);
                setMeta(response.data.meta);
            } catch (error) {
                console.error('Ошибка загрузки логов:', error);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [role, debouncedSearch, dateFrom, dateTo, page]);

    const handleReset = () => {
        setRole('all');
        setSearch('');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

     return (
        <div className="users-page">
            <LoginLogsFilterBlock
                role={role}
                search={search}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onRoleChange={setRole}
                onSearchChange={setSearch}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onReset={handleReset}
            />
            <LoginLogsTableBlock
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