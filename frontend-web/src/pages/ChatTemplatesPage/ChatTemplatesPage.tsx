import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { chatTemplateApi } from '../../api/chatTemplates';
import type { ChatTemplate, ChatTemplateCategory } from '../../api/chatTemplates';
import useToast from '../../hooks/useToast';
import ChatTemplatesFilterBlock from './ChatTemplatesFilterBlock';
import ChatTemplatesTableBlock from './ChatTemplatesTableBlock';
import TemplateFormModal from './TemplateFormModal';
import CategoryManageModal from './CategoryManageModal';

const ChatTemplatesPage: React.FC = () => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<ChatTemplate[]>([]);
  const [categories, setCategories] = useState<ChatTemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChatTemplate | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const data = await chatTemplateApi.getCategories();
      setCategories(data);
    } catch {
      showToast('Ошибка загрузки категорий', 'error');
    }
  }, [showToast]);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await chatTemplateApi.getTemplates({
        search: search || undefined,
        category_id: categoryId || undefined,
      });
      setTemplates(data);
    } catch {
      showToast('Ошибка загрузки шаблонов', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryId, showToast]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => {
    const timer = setTimeout(() => { loadTemplates(); }, 300);
    return () => clearTimeout(timer);
  }, [loadTemplates]);

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditModal = (t: ChatTemplate) => {
    setEditingTemplate(t);
    setIsTemplateModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот шаблон?')) return;
    try {
      await chatTemplateApi.deleteTemplate(id);
      showToast('Шаблон удален', 'success');
      loadTemplates();
    } catch {
      showToast('Ошибка при удалении', 'error');
    }
  };

  const handleSaveTemplate = async () => {
    setIsTemplateModalOpen(false);
    await loadTemplates();
  };

  const handleCategoriesChange = async () => {
    await loadCategories();
    await loadTemplates();
  };

  return (
    <>
      <div className="users-header">
        <div className="users-header__actions">
          <button className="users-header__add-btn" onClick={handleOpenCreateModal}>
            <Plus size={18} />
            Добавить шаблон
          </button>
          <button className="users-header__export-btn" onClick={() => setIsCategoryModalOpen(true)}>
            Управление категориями
          </button>
        </div>
      </div>

      <div className="users-page">
        <ChatTemplatesFilterBlock
          search={search}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={categories}
        />

        <ChatTemplatesTableBlock
          templates={templates}
          isLoading={isLoading}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      </div>

      {isTemplateModalOpen && (
        <TemplateFormModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSave={handleSaveTemplate}
          template={editingTemplate}
          categories={categories}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryManageModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={categories}
          onCategoriesChange={handleCategoriesChange}
        />
      )}
    </>
  );
};

export default ChatTemplatesPage;