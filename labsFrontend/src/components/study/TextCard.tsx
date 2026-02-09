import type { Card } from '@/types';
import PixelButton from '@/components/common/PixelButton';

interface TextCardProps {
  card: Card;
  onNext: () => void;
}

const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

const TextCard = ({ card, onNext }: TextCardProps) => {
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
          className="w-full max-w-sm max-h-60 object-contain"
        />
      )}

      <div className="text-gray-200 text-base md:text-lg font-body leading-relaxed text-center whitespace-pre-line">
        {card.content}
      </div>

      <div className="mt-auto pt-6">
        <PixelButton onClick={onNext} size="lg">
          CONTINUAR ▶
        </PixelButton>
      </div>
    </div>
  );
};

export default TextCard;
