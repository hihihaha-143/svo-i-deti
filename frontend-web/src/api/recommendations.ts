import apiClient from './client';

export interface Recommendation {
  id: number;
  parent_id: number;
  child_id: number | null;
  text: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  parent: {
    id: number;
    user: {
      id: number;
      name: string;
    };
  };
  child: {
    id: number;
    user: {
      id: number;
      name: string;
    };
  } | null;
}

export interface PaginatedRecommendations {
  data: Recommendation[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export interface RecommendationPayload {
  parent_id: number;
  child_id: number | null;
  text: string;
}

export const recommendationApi = {
  getRecommendations: async (params?: {
    child_id?: number;
    parent_id?: number;
    status?: 'read' | 'unread';
    date_from?: string;
    date_to?: string;
    page?: number;
  }): Promise<PaginatedRecommendations> => {
    const { data } = await apiClient.get('/psychologist/recommendations', { params });
    return data;
  },
  createRecommendation: async (payload: RecommendationPayload): Promise<Recommendation> => {
    const { data } = await apiClient.post('/psychologist/recommendations', payload);
    return data;
  },
  updateRecommendation: async (id: number, text: string): Promise<Recommendation> => {
    const { data } = await apiClient.put(`/psychologist/recommendations/${id}`, { text });
    return data;
  },
  deleteRecommendation: async (id: number): Promise<void> => {
    await apiClient.delete(`/psychologist/recommendations/${id}`);
  },
  markAsUnread: async (id: number): Promise<Recommendation> => {
    const { data } = await apiClient.post(`/psychologist/recommendations/${id}/mark-unread`);
    return data;
  },
};