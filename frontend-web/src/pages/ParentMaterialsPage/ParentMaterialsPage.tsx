import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { parentMaterialApi } from '../../api/parentMaterials';
import type { ParentMaterial } from '../../api/parentMaterials';
import useToast from '../../hooks/useToast';
import ParentMaterialsFilterBlock from './ParentMaterialsFilterBlock';
import ParentMaterialsTableBlock from './ParentMaterialsTableBlock';
import MaterialFormModal from './MaterialFormModal';

const ParentMaterialsPage: React.FC = () => {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<ParentMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ParentMaterial | null>(null);

  const loadMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await parentMaterialApi.getMaterials({
        search: search || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
      });
      setMaterials(data.data);
      setTotalPages(data.last_page);
    } catch {
      showToast('Ошибка загрузки материалов', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, dateFrom, dateTo, page, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMaterials();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadMaterials]);

  useEffect(() => {
    setPage(1);
  }, [search, dateFrom, dateTo]);

  const handleOpenCreateModal = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m: ParentMaterial) => {
    setEditingMaterial(m);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот материал?')) return;
    try {
      await parentMaterialApi.deleteMaterial(id);
      showToast('Материал удален', 'success');
      loadMaterials();
    } catch {
      showToast('Ошибка при удалении', 'error');
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      await parentMaterialApi.togglePublish(id);
      showToast('Статус обновлен', 'success');
      loadMaterials();
    } catch {
      showToast('Ошибка обновления статуса', 'error');
    }
  };

  const handleSave = async () => {
    setIsModalOpen(false);
    await loadMaterials();
  };

  return (
    <>
      <div className="users-header">
        <div className="users-header__actions">
          <button className="users-header__add-btn" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            Добавить материал
          </button>
        </div>
      </div>

      <div className="users-page">
        <ParentMaterialsFilterBlock
          search={search}
          onSearchChange={setSearch}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />

        <ParentMaterialsTableBlock
          materials={materials}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
        />
      </div>

      {isModalOpen && (
        <MaterialFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          material={editingMaterial}
        />
      )}
    </>
  );
};

export default ParentMaterialsPage;