import { useState, FormEvent } from 'react';
import type { Card } from '@/types';
import PixelInput from '@/components/common/PixelInput';
import PixelButton from '@/components/common/PixelButton';
import { motion } from 'framer-motion';

interface TextInputCardProps {
  card: Card;
  onSubmit: (answer: string) => void;
  isSubmitting: boolean;
}

const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

const TextInputCard = ({ card, onSubmit, isSubmitting }: TextInputCardProps) => {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitted(true);

    // Check locally for instant feedback
    const isCorrect =
      answer.trim().toLowerCase() === card.correctAnswer.trim().toLowerCase();
    setResult(isCorrect ? 'correct' : 'incorrect');

    // Submit to API
    onSubmit(answer.trim());
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg px-4">
      {card.title && (
        <h2 className="font-pixel text-sm md:text-base text-pixel-primary pixel-text-shadow text-center">
          {card.title}
        </h2>
      )}

      {card.image && (
        <img
          src={`${apiBase}${card.image}`}
          alt={card.title || 'Card image'}
          className="w-full max-w-sm max-h-48 object-contain"
        />
      )}

      <div className="text-gray-200 text-base font-body leading-relaxed text-center whitespace-pre-line">
        {card.content}
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 mt-4">
        <PixelInput
          placeholder="Escribe tu respuesta..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          autoFocus
        />

        {result && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-center font-pixel text-sm p-3 border-2 ${
              result === 'correct'
                ? 'bg-pixel-green/20 border-pixel-green text-pixel-green'
                : 'bg-red-500/20 border-red-500 text-red-400'
            }`}
          >
            {result === 'correct' ? '✓ CORRECTO!' : '✗ INCORRECTO'}
            {result === 'incorrect' && card.correctAnswer && (
              <p className="text-xs mt-1 text-gray-300 font-body">
                Respuesta: {card.correctAnswer}
              </p>
            )}
          </motion.div>
        )}

        {!submitted ? (
          <PixelButton
            type="submit"
            isLoading={isSubmitting}
            disabled={!answer.trim()}
            size="lg"
          >
            ENVIAR
          </PixelButton>
        ) : (
          <PixelButton onClick={() => onSubmit(answer)} size="lg" variant="green">
            CONTINUAR ▶
          </PixelButton>
        )}
      </form>
    </div>
  );
};

export default TextInputCard;
