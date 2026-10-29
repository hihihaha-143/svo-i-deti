import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { dailyTipApi } from '../../api/dailyTips';
import type { DailyTip } from '../../api/dailyTips';
import useToast from '../../hooks/useToast';
import DailyTipsFilterBlock from './DailyTipsFilterBlock';
import DailyTipsTableBlock from './DailyTipsTableBlock';
import TipFormModal from './TipFormModal';

const DailyTipsPage: React.FC = () => {
  const { showToast } = useToast();
  const [tips, setTips] = useState<DailyTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<DailyTip | null>(null);

  const loadTips = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dailyTipApi.getTips({
        search: search || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
      });
      setTips(data.data);
      setTotalPages(data.last_page);
    } catch {
      showToast('Ошибка загрузки советов', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, dateFrom, dateTo, page, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTips();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadTips]);

  useEffect(() => {
    setPage(1);
  }, [search, dateFrom, dateTo]);

  const handleOpenCreateModal = () => {
    setEditingTip(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: DailyTip) => {
    setEditingTip(t);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот совет?')) return;
    try {
      await dailyTipApi.deleteTip(id);
      showToast('Совет удален', 'success');
      loadTips();
    } catch {
      showToast('Ошибка при удалении', 'error');
    }
  };

  const handleSave = async () => {
    setIsModalOpen(false);
    await loadTips();
  };

  return (
    <>
      <div className="users-header">
        <div className="users-header__actions">
          <button className="users-header__add-btn" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            Добавить совет
          </button>
        </div>
      </div>

      <div className="users-page">
        <DailyTipsFilterBlock
          search={search}
          onSearchChange={setSearch}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />

        <DailyTipsTableBlock
          tips={tips}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </div>

      {isModalOpen && (
        <TipFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          tip={editingTip}
        />
      )}
    </>
  );
};

export default DailyTipsPage;