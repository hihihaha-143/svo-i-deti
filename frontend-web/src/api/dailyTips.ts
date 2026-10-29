import apiClient from './client';

export interface DailyTip {
  id: number;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTips {
  data: DailyTip[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export const dailyTipApi = {
  getTips: async (params?: {
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
  }): Promise<PaginatedTips> => {
    const { data } = await apiClient.get('/psychologist/daily-tips', { params });
    return data;
  },
  createTip: async (text: string): Promise<DailyTip> => {
    const { data } = await apiClient.post('/psychologist/daily-tips', { text });
    return data;
  },
  updateTip: async (id: number, text: string): Promise<DailyTip> => {
    const { data } = await apiClient.put(`/psychologist/daily-tips/${id}`, { text });
    return data;
  },
  deleteTip: async (id: number): Promise<void> => {
    await apiClient.delete(`/psychologist/daily-tips/${id}`);
  },
};