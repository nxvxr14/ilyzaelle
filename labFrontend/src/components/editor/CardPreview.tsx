import { useState } from 'react';
import type { CardBlock, Card } from '@/types';
import CardRenderer from '@/components/course/CardRenderer';

interface CardPreviewProps {
  title: string;
  blocks: CardBlock[];
}

const CardPreview = ({ title, blocks }: CardPreviewProps) => {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});

  const handleQuizAnswer = (blockIndex: number, optionIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [blockIndex.toString()]: optionIndex,
    }));
  };

  // Construct a dummy Card object for CardRenderer
  const dummyCard: Card = {
    _id: 'preview',
    title: title || 'Sin titulo',
    module: 'preview',
    order: 0,
    blocks,
    createdAt: '',
    updatedAt: '',
  };

  return (
    <div className="max-w-sm mx-auto">
      <p className="text-xs text-lab-text-muted text-center mb-4">Vista previa</p>

      <div className="card">
        {blocks.length === 0 ? (
          <p className="text-sm text-lab-text-muted text-center py-4">Sin bloques</p>
        ) : (
          <CardRenderer
            card={dummyCard}
            quizAnswers={quizAnswers}
            onQuizAnswer={handleQuizAnswer}
          />
        )}
      </div>
    </div>
  );
};

export default CardPreview;
