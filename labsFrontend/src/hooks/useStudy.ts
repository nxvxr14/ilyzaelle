import { useState, useCallback, useEffect } from 'react';
import { getCardsByModule } from '@/api/cardApi';
import {
  getProgress,
  startModule,
  submitAnswer,
  advanceCard,
  completeModule,
} from '@/api/progressApi';
import type { Card, Progress, CompleteModuleResponse } from '@/types';

export const useStudy = (moduleId: string) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [completionData, setCompletionData] = useState<CompleteModuleResponse | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load cards and progress
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [cardsRes, progressRes] = await Promise.all([
          getCardsByModule(moduleId),
          getProgress(moduleId),
        ]);

        if (cardsRes.data) {
          setCards(cardsRes.data);
        }

        if (progressRes.data) {
          setProgress(progressRes.data);
          setCurrentIndex(progressRes.data.currentCardIndex);
          if (progressRes.data.completed) {
            setIsCompleted(true);
          }
        } else {
          // Start the module
          const startRes = await startModule(moduleId);
          if (startRes.data) {
            setProgress(startRes.data);
          }
        }
      } catch (e) {
        console.error('Load study data error:', e);
      }
      setIsLoading(false);
    };

    load();
  }, [moduleId]);

  const handleAnswer = useCallback(async (cardId: string, answer: string) => {
    await submitAnswer(moduleId, cardId, answer);
  }, [moduleId]);

  const handleAdvance = useCallback(async (newIndex: number) => {
    setCurrentIndex(newIndex);
    await advanceCard(moduleId, newIndex);
  }, [moduleId]);

  const handleComplete = useCallback(async () => {
    try {
      const res = await completeModule(moduleId);
      if (res.data) {
        setCompletionData(res.data);
        setIsCompleted(true);
      }
    } catch (e) {
      console.error('Complete module error:', e);
    }
  }, [moduleId]);

  return {
    cards,
    progress,
    currentIndex,
    isLoading,
    isCompleted,
    completionData,
    handleAnswer,
    handleAdvance,
    handleComplete,
  };
};
