import apiClient from './client';

export interface ParentMaterial {
  id: number;
  title: string;
  preview: string | null;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParentMaterialPayload {
  title: string;
  preview: string | null;
  content: string;
  is_published?: boolean;
}

export interface PaginatedMaterials {
  data: ParentMaterial[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export const parentMaterialApi = {
  getMaterials: async (params?: {
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
  }): Promise<PaginatedMaterials> => {
    const { data } = await apiClient.get('/psychologist/parent-materials', { params });
    return data;
  },
  createMaterial: async (payload: ParentMaterialPayload): Promise<ParentMaterial> => {
    const { data } = await apiClient.post('/psychologist/parent-materials', payload);
    return data;
  },
  updateMaterial: async (id: number, payload: ParentMaterialPayload): Promise<ParentMaterial> => {
    const { data } = await apiClient.put(`/psychologist/parent-materials/${id}`, payload);
    return data;
  },
  deleteMaterial: async (id: number): Promise<void> => {
    await apiClient.delete(`/psychologist/parent-materials/${id}`);
  },
  togglePublish: async (id: number): Promise<ParentMaterial> => {
    const { data } = await apiClient.post(`/psychologist/parent-materials/${id}/toggle-publish`);
    return data;
  },
};