import { useState, useCallback } from 'react';
import type { Card } from '@/types';
import CardWrapper from './CardWrapper';
import TextCard from './TextCard';
import TextInputCard from './TextInputCard';
import MultipleChoiceCard from './MultipleChoiceCard';
import PhotoUploadCard from './PhotoUploadCard';
import ProgressBar from '@/components/common/ProgressBar';
import { uploadImage } from '@/api/uploadApi';

interface StudyContainerProps {
  cards: Card[];
  currentIndex: number;
  moduleId: string;
  onAnswer: (cardId: string, answer: string) => Promise<void>;
  onAdvance: (newIndex: number) => void;
  onComplete: () => void;
}

const StudyContainer = ({
  cards,
  currentIndex,
  onAnswer,
  onAdvance,
  onComplete,
}: StudyContainerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentCard = cards[currentIndex];

  const progress = cards.length > 0
    ? Math.round((currentIndex / cards.length) * 100)
    : 0;

  const handleNext = useCallback(async () => {
    if (!currentCard) return;

    // For text cards, just submit "viewed"
    if (currentCard.type === 'text') {
      setIsSubmitting(true);
      try {
        await onAnswer(currentCard._id, 'viewed');
      } catch (e) {
        console.error('Submit error:', e);
      }
      setIsSubmitting(false);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= cards.length) {
      onComplete();
    } else {
      onAdvance(nextIndex);
    }
  }, [currentCard, currentIndex, cards.length, onAnswer, onAdvance, onComplete]);

  const handleAnswerSubmit = useCallback(async (answer: string) => {
    if (!currentCard) return;
    setIsSubmitting(true);
    try {
      await onAnswer(currentCard._id, answer);
    } catch (e) {
      console.error('Submit error:', e);
    }
    setIsSubmitting(false);

    // Auto advance after a short delay for answered cards
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= cards.length) {
        onComplete();
      } else {
        onAdvance(nextIndex);
      }
    }, 1500);
  }, [currentCard, currentIndex, cards.length, onAnswer, onAdvance, onComplete]);

  const handlePhotoSubmit = useCallback(async (file: File) => {
    if (!currentCard) return;
    setIsSubmitting(true);
    try {
      const uploadResult = await uploadImage(file);
      const photoPath = uploadResult.data?.path || '';
      await onAnswer(currentCard._id, photoPath);
    } catch (e) {
      console.error('Photo submit error:', e);
    }
    setIsSubmitting(false);

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= cards.length) {
        onComplete();
      } else {
        onAdvance(nextIndex);
      }
    }, 1000);
  }, [currentCard, currentIndex, cards.length, onAnswer, onAdvance, onComplete]);

  if (!currentCard) return null;

  const renderCard = () => {
    switch (currentCard.type) {
      case 'text':
        return <TextCard card={currentCard} onNext={handleNext} />;
      case 'text-input':
        return (
          <TextInputCard
            card={currentCard}
            onSubmit={handleAnswerSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'multiple-choice':
        return (
          <MultipleChoiceCard
            card={currentCard}
            onSubmit={handleAnswerSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'photo-upload':
        return (
          <PhotoUploadCard
            card={currentCard}
            onSubmit={handlePhotoSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Progress bar at top */}
      <div className="sticky top-0 z-10 bg-pixel-darker p-2">
        <div className="flex items-center gap-3">
          <ProgressBar progress={progress} height="sm" showLabel={false} />
          <span className="font-pixel text-[8px] text-gray-400 flex-shrink-0">
            {currentIndex + 1}/{cards.length}
          </span>
        </div>
      </div>

      {/* Card with animation */}
      <CardWrapper cardKey={currentCard._id}>
        {renderCard()}
      </CardWrapper>
    </div>
  );
};

export default StudyContainer;
