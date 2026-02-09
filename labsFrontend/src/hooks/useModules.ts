import { useState, useEffect, useCallback } from 'react';
import { getModulesByCategory } from '@/api/moduleApi';
import type { Module } from '@/types';

export const useModules = (categoryId: string) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    if (!categoryId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getModulesByCategory(categoryId);
      if (res.data) {
        setModules(res.data);
      }
    } catch (e) {
      console.error('Fetch modules error:', e);
      setError('Failed to fetch modules');
    }
    setIsLoading(false);
  }, [categoryId]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return { modules, isLoading, error, refetch: fetchModules };
};
