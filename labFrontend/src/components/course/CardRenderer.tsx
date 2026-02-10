import type { Card, CardBlock } from '@/types';
import { getImageUrl } from '@/utils/helpers';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

interface CardRendererProps {
  card: Card;
  quizAnswers: Record<string, number>;
  onQuizAnswer: (blockIndex: number, optionIndex: number) => void;
}

const CardRenderer = ({ card, quizAnswers, onQuizAnswer }: CardRendererProps) => {
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
        const selectedOption = quizAnswers[key];
        const hasAnswered = selectedOption !== undefined;

        return (
          <div key={blockIndex} className="card bg-lab-bg border-lab-primary/30">
            <p className="font-semibold mb-3">{block.question}</p>
            <div className="space-y-2">
              {block.options.map((option, optIdx) => {
                const isSelected = hasAnswered && selectedOption === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => onQuizAnswer(blockIndex, optIdx)}
                    className={`w-full text-left p-3 text-sm rounded-xl border transition-all ${
                      isSelected
                        ? 'border-lab-primary bg-lab-primary/20 text-white'
                        : 'border-lab-border bg-lab-card hover:border-lab-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'code':
        return (
          <div key={blockIndex} className="rounded-xl overflow-hidden max-w-full">
            <div className="bg-lab-bg px-4 py-2 text-xs text-lab-text-muted border-b border-lab-border">
              {block.language}
            </div>
            <pre className="bg-lab-bg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap break-words md:whitespace-pre md:break-normal max-w-full">
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
    <div className="space-y-4">
      <h3 className="text-lg font-bold">{card.title}</h3>
      {card.blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
};

export default CardRenderer;
