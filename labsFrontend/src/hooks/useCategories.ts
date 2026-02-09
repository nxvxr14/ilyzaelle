import { useState, useEffect, useCallback } from 'react';
import { getCategories } from '@/api/categoryApi';
import type { Category } from '@/types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getCategories();
      if (res.data) {
        setCategories(res.data);
      }
    } catch (e) {
      console.error('Fetch categories error:', e);
      setError('Failed to fetch categories');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
};
