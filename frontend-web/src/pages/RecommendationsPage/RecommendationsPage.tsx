import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { recommendationApi } from '../../api/recommendations';
import type { Recommendation } from '../../api/recommendations';
import apiClient from '../../api/client';
import useToast from '../../hooks/useToast';
import RecommendationsFilterBlock from './RecommendationsFilterBlock';
import RecommendationsTableBlock from './RecommendationsTableBlock';
import RecommendationFormModal from './RecommendationFormModal';

interface SimpleUser {
  id: number;
  name: string;
}

const RecommendationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [parents, setParents] = useState<SimpleUser[]>([]);
  const [children, setChildren] = useState<SimpleUser[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Фильтры
  const [childId, setChildId] = useState<number | ''>('');
  const [parentId, setParentId] = useState<number | ''>('');
  const [status, setStatus] = useState<'read' | 'unread' | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Модалка
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);

  // Загрузка списков родителей и детей
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [parentsRes, childrenRes] = await Promise.all([
          apiClient.get('/psychologist/users', { params: { role: 'parent' } }),
          apiClient.get('/psychologist/users', { params: { role: 'child' } }),
        ]);

        const extractArray = (res: any) => {
          const payload = res?.data;
          if (Array.isArray(payload)) return payload;
          if (payload && Array.isArray(payload.data)) return payload.data;
          if (payload && payload.data && Array.isArray(payload.data.data)) return payload.data.data;
          return [];
        };

        setParents(extractArray(parentsRes));
        setChildren(extractArray(childrenRes));
      } catch {
        showToast('Ошибка загрузки списков для фильтров', 'error');
      }
    };
    fetchLists();
  }, [showToast]);

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await recommendationApi.getRecommendations({
        child_id: childId || undefined,
        parent_id: parentId || undefined,
        status: status || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
      });
      setRecommendations(data.data);
      setTotalPages(data.last_page);
    } catch {
      showToast('Ошибка загрузки рекомендаций', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [childId, parentId, status, dateFrom, dateTo, page, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecommendations();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadRecommendations]);

  useEffect(() => {
    setPage(1);
  }, [childId, parentId, status, dateFrom, dateTo]);

  const handleOpenCreateModal = () => {
    setEditingRec(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r: Recommendation) => {
    setEditingRec(r);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту рекомендацию?')) return;
    try {
      await recommendationApi.deleteRecommendation(id);
      showToast('Рекомендация удалена', 'success');
      loadRecommendations();
    } catch {
      showToast('Ошибка при удалении', 'error');
    }
  };

  const handleMarkUnread = async (id: number) => {
    try {
      await recommendationApi.markAsUnread(id);
      showToast('Статус изменен на "Не прочитано"', 'success');
      loadRecommendations();
    } catch {
      showToast('Ошибка изменения статуса', 'error');
    }
  };

  const handleSave = async () => {
    setIsModalOpen(false);
    await loadRecommendations();
  };

  return (
    <>
      <div className="users-header">
        <div className="users-header__actions">
          <button className="users-header__add-btn" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            Новая рекомендация
          </button>
        </div>
      </div>

      <div className="users-page">
        <RecommendationsFilterBlock
          childId={childId}
          onChildChange={setChildId}
          parentId={parentId}
          onParentChange={setParentId}
          status={status}
          onStatusChange={setStatus}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          parents={parents}
          children={children}
        />

        <RecommendationsTableBlock
          recommendations={recommendations}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          onMarkUnread={handleMarkUnread}
        />
      </div>

      {isModalOpen && (
        <RecommendationFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          recommendation={editingRec}
          parents={parents}
          children={children}
        />
      )}
    </>
  );
};

export default RecommendationsPage;