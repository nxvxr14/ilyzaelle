import { useState, useEffect, useCallback } from 'react';
import { getAllProgress } from '@/api/progressApi';
import type { Progress } from '@/types';

export const useProgress = () => {
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllProgress();
      if (res.data) {
        setProgressList(res.data);
      }
    } catch (e) {
      console.error('Fetch progress error:', e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getModuleProgress = (moduleId: string): Progress | undefined => {
    return progressList.find((p) => p.moduleId === moduleId);
  };

  const progressMap: Record<string, Progress> = {};
  progressList.forEach((p) => {
    progressMap[p.moduleId] = p;
  });

  return {
    progressList,
    progressMap,
    isLoading,
    getModuleProgress,
    refetch: fetchProgress,
  };
};
