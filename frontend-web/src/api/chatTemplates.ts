import apiClient from './client';

export interface ChatTemplateCategory {
  id: number;
  name: string;
}

export interface ChatTemplate {
  id: number;
  category_id: number;
  name: string;
  text: string;
  usage_count: number;
  category: ChatTemplateCategory;
}

export interface ChatTemplatePayload {
  name: string;
  text: string;
  category_id: number;
}

export const chatTemplateApi = {
  getCategories: async (): Promise<ChatTemplateCategory[]> => {
    const { data } = await apiClient.get('/psychologist/chat-template-categories');
    return data;
  },
  createCategory: async (name: string): Promise<ChatTemplateCategory> => {
    const { data } = await apiClient.post('/psychologist/chat-template-categories', { name });
    return data;
  },
  updateCategory: async (id: number, name: string): Promise<ChatTemplateCategory> => {
    const { data } = await apiClient.put(`/psychologist/chat-template-categories/${id}`, { name });
    return data;
  },
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/psychologist/chat-template-categories/${id}`);
  },
  getTemplates: async (params?: { search?: string; category_id?: number }): Promise<ChatTemplate[]> => {
    const { data } = await apiClient.get('/psychologist/chat-templates', { params });
    return data;
  },
  createTemplate: async (payload: ChatTemplatePayload): Promise<ChatTemplate> => {
    const { data } = await apiClient.post('/psychologist/chat-templates', payload);
    return data;
  },
  updateTemplate: async (id: number, payload: ChatTemplatePayload): Promise<ChatTemplate> => {
    const { data } = await apiClient.put(`/psychologist/chat-templates/${id}`, payload);
    return data;
  },
  deleteTemplate: async (id: number): Promise<void> => {
    await apiClient.delete(`/psychologist/chat-templates/${id}`);
  },
};