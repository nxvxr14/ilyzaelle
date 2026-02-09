import { useState } from 'react';
import type { Card } from '@/types';
import PixelButton from '@/components/common/PixelButton';
import { motion } from 'framer-motion';

interface MultipleChoiceCardProps {
  card: Card;
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
}

const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

const OPTION_COLORS = ['#e94560', '#4fc3f7', '#00d474', '#f5c518', '#ab47bc', '#ff9800'];

const MultipleChoiceCard = ({ card, onSubmit, isSubmitting }: MultipleChoiceCardProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleSelect = (optionText: string) => {
    if (submitted) return;
    setSelected(optionText);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);

    const correctOption = card.options.find((opt) => opt.isCorrect);
    setResult(selected === correctOption?.text ? 'correct' : 'incorrect');

    onSubmit(selected);
  };

  const handleContinue = () => {
    onSubmit(selected || '');
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg px-4">
      {card.title && (
        <h2 className="font-pixel text-sm md:text-base text-pixel-primary pixel-text-shadow text-center">
          {card.title}
        </h2>
      )}

      {card.image && (
        <img
          src={`${apiBase}${card.image}`}
          alt={card.title || ''}
          className="w-full max-w-sm max-h-48 object-contain"
        />
      )}

      <div className="text-gray-200 text-base font-body leading-relaxed text-center whitespace-pre-line">
        {card.content}
      </div>

      {/* Options */}
      <div className="w-full flex flex-col gap-3 mt-2">
        {card.options.map((option, index) => {
          const color = OPTION_COLORS[index % OPTION_COLORS.length]!;
          const isSelected = selected === option.text;
          const showCorrect = submitted && option.isCorrect;
          const showIncorrect = submitted && isSelected && !option.isCorrect;

          return (
            <motion.button
              key={index}
              whileTap={!submitted ? { scale: 0.97 } : undefined}
              onClick={() => handleSelect(option.text)}
              disabled={submitted}
              className={`
                w-full p-4 border-2 text-left font-body text-sm
                transition-all duration-150
                ${isSelected && !submitted ? 'bg-pixel-dark' : 'bg-pixel-darker'}
                ${showCorrect ? 'border-pixel-green bg-pixel-green/15' : ''}
                ${showIncorrect ? 'border-red-500 bg-red-500/15' : ''}
                ${!submitted ? 'hover:bg-pixel-dark cursor-pointer' : ''}
              `}
              style={{
                borderColor: showCorrect
                  ? '#00d474'
                  : showIncorrect
                    ? '#ef4444'
                    : isSelected
                      ? color
                      : '#4a4a6a',
                boxShadow: isSelected && !submitted
                  ? `3px 3px 0px 0px ${color}40`
                  : 'none',
              }}
            >
              <span className="font-pixel text-[10px] mr-2" style={{ color }}>
                {String.fromCharCode(65 + index)}.
              </span>
              {option.text}
              {showCorrect && <span className="float-right text-pixel-green">✓</span>}
              {showIncorrect && <span className="float-right text-red-400">✗</span>}
            </motion.button>
          );
        })}
      </div>

      {result && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`text-center font-pixel text-sm p-2 ${
            result === 'correct' ? 'text-pixel-green' : 'text-red-400'
          }`}
        >
          {result === 'correct' ? '✓ CORRECTO!' : '✗ INCORRECTO'}
        </motion.div>
      )}

      <div className="mt-auto pt-4">
        {!submitted ? (
          <PixelButton
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!selected}
            size="lg"
          >
            ENVIAR
          </PixelButton>
        ) : (
          <PixelButton onClick={handleContinue} size="lg" variant="green">
            CONTINUAR ▶
          </PixelButton>
        )}
      </div>
    </div>
  );
};

export default MultipleChoiceCard;
