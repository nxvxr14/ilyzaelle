import { useState } from 'react';
import type { Card, CardBlock } from '@/types';
import { getImageUrl } from '@/utils/helpers';
import {
  CheckCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';

interface CardRendererProps {
  card: Card;
  index: number;
  isCompleted: boolean;
  onComplete: (cardId: string, quizAnswers?: Record<string, number>) => void;
}

const CardRenderer = ({ card, index, isCompleted, onComplete }: CardRendererProps) => {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [revealedQuizzes, setRevealedQuizzes] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(true);

  const handleQuizAnswer = (blockIndex: number, optionIndex: number, correctIndex: number) => {
    const key = blockIndex.toString();
    setQuizAnswers((prev) => ({ ...prev, [key]: optionIndex }));
    setRevealedQuizzes((prev) => new Set(prev).add(key));
  };

  const handleComplete = () => {
    onComplete(card._id, Object.keys(quizAnswers).length > 0 ? quizAnswers : undefined);
  };

  const renderBlock = (block: CardBlock, blockIndex: number) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            key={blockIndex}
            className={`${block.bold ? 'font-bold' : ''} ${block.italic ? 'italic' : ''}`}
            style={{
              fontSize: `${block.fontSize}px`,
              textAlign: block.align,
            }}
          >
            {block.content}
          </div>
        );

      case 'image':
        return (
          <div key={blockIndex} className="space-y-1">
            <img
              src={getImageUrl(block.url)}
              alt={block.alt}
              className="w-full rounded-xl"
              loading="lazy"
            />
            {block.caption && (
              <p className="text-xs text-lab-text-muted text-center">{block.caption}</p>
            )}
          </div>
        );

      case 'button':
        return (
          <a
            key={blockIndex}
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block ${
              block.variant === 'primary'
                ? 'btn-primary'
                : block.variant === 'secondary'
                ? 'btn-secondary'
                : 'btn-secondary border-lab-primary text-lab-primary'
            }`}
          >
            {block.label}
          </a>
        );

      case 'quiz': {
        const key = blockIndex.toString();
        const answered = revealedQuizzes.has(key);
        const selectedOption = quizAnswers[key];

        return (
          <div key={blockIndex} className="card bg-lab-bg border-lab-primary/30">
            <p className="font-semibold mb-3">{block.question}</p>
            <div className="space-y-2">
              {block.options.map((option, optIdx) => {
                let optionClass = 'card cursor-pointer hover:border-lab-primary';

                if (answered) {
                  if (optIdx === block.correctIndex) {
                    optionClass = 'card border-green-500 bg-green-500/10';
                  } else if (optIdx === selectedOption && optIdx !== block.correctIndex) {
                    optionClass = 'card border-red-500 bg-red-500/10';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => !answered && handleQuizAnswer(blockIndex, optIdx, block.correctIndex)}
                    disabled={answered}
                    className={`${optionClass} w-full text-left p-3 text-sm`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {answered && block.explanation && (
              <p className="text-sm text-lab-text-muted mt-3 p-3 bg-lab-surface rounded-xl">
                {block.explanation}
              </p>
            )}
          </div>
        );
      }

      case 'code':
        return (
          <div key={blockIndex} className="rounded-xl overflow-hidden">
            <div className="bg-lab-bg px-4 py-2 text-xs text-lab-text-muted border-b border-lab-border">
              {block.language}
            </div>
            <pre className="bg-lab-bg p-4 overflow-x-auto text-sm font-mono">
              <code>{block.content}</code>
            </pre>
          </div>
        );

      case 'download':
        return (
          <a
            key={blockIndex}
            href={getImageUrl(block.fileUrl)}
            download={block.fileName}
            className="card-hover flex items-center gap-3 p-3"
          >
            <div className="p-2 bg-lab-primary/20 rounded-xl">
              <ChevronDownIcon className="w-5 h-5 text-lab-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{block.label}</p>
              <p className="text-xs text-lab-text-muted">{block.fileName}</p>
            </div>
          </a>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`card transition-all duration-300 ${
        isCompleted ? 'border-lab-secondary/30 bg-lab-secondary/5' : ''
      }`}
    >
      {/* Card header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isCompleted
                ? 'bg-lab-secondary text-white'
                : 'bg-lab-bg text-lab-text-muted'
            }`}
          >
            {isCompleted ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              index + 1
            )}
          </div>
          <h4 className="font-semibold text-sm">{card.title}</h4>
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-lab-text-muted transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Card content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {card.blocks.map((block, i) => renderBlock(block, i))}

          {/* Mark as done */}
          {!isCompleted && (
            <button
              onClick={handleComplete}
              className="btn-secondary w-full text-sm"
            >
              Marcar como completado
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CardRenderer;
