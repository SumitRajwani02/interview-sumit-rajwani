import { apiClient } from './client';
import { APIResponse, UserStats } from '../../types';

export const statsAPI = {
  /**
   * Fetches the aggregated wardrobe and outfit statistics for the currently authenticated user.
   * It unwraps the standard APIResponse wrapper to return just the data payload.
   */
  getStats: async (): Promise<UserStats> => {
    const { data } = await apiClient.get<APIResponse<UserStats>>('/user/stats');
    return data.data;
  },
};