import { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { statsAPI } from '../services/api/stats';
import { friendlyError } from '../utils/friendlyError';

/**
 * A custom React hook that manages the lifecycle of fetching user statistics.
 * It automatically fetches data on mount and provides loading/error states for the UI.
 */
export const useStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await statsAPI.getStats();
      setStats(data);
    } catch (e: unknown) {
      // Maps raw network/server errors into a user-friendly string
      setError(friendlyError(e, 'Couldn\'t load your stats. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger the fetch exactly once when the component using this hook mounts
  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats, // Expose the fetch function so the UI can force a manual reload (e.g., Pull-to-Refresh)
  };
};