import { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import type { Card, CardType } from '@/types';
import PixelButton from '@/components/common/PixelButton';
import PixelInput from '@/components/common/PixelInput';
import PixelModal from '@/components/common/PixelModal';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/utils/animations';
import { IoAdd, IoTrash, IoPencil, IoArrowUp, IoArrowDown } from 'react-icons/io5';
import { uploadImage } from '@/api/uploadApi';
import { getCardsByModule } from '@/api/cardApi';

interface CardEditorProps {
  moduleId: string;
  moduleName: string;
  onCreateCard: (data: Partial<Card>) => Promise<void>;
  onUpdateCard: (id: string, data: Partial<Card>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
  onReorderCards: (cards: Array<{ id: string; order: number }>) => Promise<void>;
  onBack: () => void;
}

const CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'text', label: 'Texto' },
  { value: 'text-input', label: 'Input Texto' },
  { value: 'multiple-choice', label: 'Seleccion Multiple' },
  { value: 'photo-upload', label: 'Subir Foto' },
];

const CardEditor = ({
  moduleId,
  moduleName,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onReorderCards,
  onBack,
}: CardEditorProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Card | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [type, setType] = useState<CardType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [points, setPoints] = useState(10);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [options, setOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const fileRef = useRef<HTMLInputElement>(null);
  const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

  const loadCards = useCallback(async () => {
    try {
      const res = await getCardsByModule(moduleId);
      if (res.data) setCards(res.data);
    } catch (e) {
      console.error('Load cards error:', e);
    }
  }, [moduleId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const openCreate = () => {
    setEditing(null);
    setType('text');
    setTitle('');
    setContent('');
    setImage('');
    setPoints(10);
    setCorrectAnswer('');
    setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    setShowModal(true);
  };

  const openEdit = (card: Card) => {
    setEditing(card);
    setType(card.type);
    setTitle(card.title);
    setContent(card.content);
    setImage(card.image);
    setPoints(card.points);
    setCorrectAnswer(card.correctAnswer);
    setOptions(
      card.options.length > 0
        ? card.options
        : [{ text: '', isCorrect: false }, { text: '', isCorrect: false }]
    );
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadImage(file);
      if (result.data?.path) setImage(result.data.path);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cardData: Partial<Card> = {
        moduleId,
        type,
        title,
        content,
        image,
        points,
        correctAnswer: type === 'text-input' ? correctAnswer : '',
        options: type === 'multiple-choice' ? options.filter((o) => o.text.trim()) : [],
      };

      if (editing) {
        await onUpdateCard(editing._id, cardData);
      } else {
        await onCreateCard(cardData);
      }
      setShowModal(false);
      await loadCards();
    } catch (err) {
      console.error('Save card error:', err);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await onDeleteCard(id);
    await loadCards();
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= cards.length) return;

    const newCards = [...cards];
    [newCards[index], newCards[swapIndex]] = [newCards[swapIndex]!, newCards[index]!];

    const reorderData = newCards.map((c, i) => ({ id: c._id, order: i }));
    await onReorderCards(reorderData);
    await loadCards();
  };

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...options];
    if (field === 'text') {
      newOptions[index] = { ...newOptions[index]!, text: value as string };
    } else {
      newOptions[index] = { ...newOptions[index]!, isCorrect: value as boolean };
    }
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const typeLabel = (t: CardType) => CARD_TYPES.find((ct) => ct.value === t)?.label || t;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <PixelButton onClick={onBack} size="sm" variant="secondary">
          ← VOLVER
        </PixelButton>
        <h2 className="font-pixel text-sm text-white flex-1">{moduleName}</h2>
        <PixelButton onClick={openCreate} size="sm">
          <IoAdd className="inline mr-1" /> CARD
        </PixelButton>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2"
      >
        {cards.map((card, index) => (
          <motion.div
            key={card._id}
            variants={fadeInUp}
            className="bg-pixel-dark border border-gray-700 p-3 flex items-center gap-3"
          >
            <span className="font-pixel text-[10px] text-gray-500 w-6 text-center">
              {index + 1}
            </span>
            <span className="font-pixel text-[8px] text-pixel-blue bg-pixel-blue/10 px-2 py-1 flex-shrink-0">
              {typeLabel(card.type)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-body truncate">{card.title || card.content.slice(0, 50)}</p>
            </div>
            <span className="font-pixel text-[8px] text-pixel-gold flex-shrink-0">{card.points}xp</span>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="text-gray-400 hover:text-white disabled:opacity-30 p-1">
                <IoArrowUp size={14} />
              </button>
              <button onClick={() => handleMove(index, 'down')} disabled={index === cards.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30 p-1">
                <IoArrowDown size={14} />
              </button>
              <button onClick={() => openEdit(card)} className="text-pixel-blue hover:text-white p-1">
                <IoPencil size={14} />
              </button>
              <button onClick={() => handleDelete(card._id)} className="text-red-400 hover:text-red-300 p-1">
                <IoTrash size={14} />
              </button>
            </div>
          </motion.div>
        ))}
        {cards.length === 0 && (
          <p className="text-center text-gray-500 py-8 font-body">
            No hay cards. Crea la primera!
          </p>
        )}
      </motion.div>

      <PixelModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'EDITAR CARD' : 'NUEVA CARD'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-pixel text-[10px] text-gray-300 mb-2">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CardType)}
              className="w-full bg-pixel-dark border-2 border-gray-600 text-white px-3 py-2"
            >
              {CARD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <PixelInput label="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} />

          <div>
            <label className="block font-pixel text-[10px] text-gray-300 mb-2">Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-pixel-dark border-2 border-gray-600 text-white font-body text-sm focus:outline-none focus:border-pixel-primary resize-y"
            />
          </div>

          <PixelInput
            label="Puntos (XP)"
            type="number"
            value={points.toString()}
            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            min="0"
          />

          {type === 'text-input' && (
            <PixelInput
              label="Respuesta correcta"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
            />
          )}

          {type === 'multiple-choice' && (
            <div>
              <label className="block font-pixel text-[10px] text-gray-300 mb-2">Opciones</label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={opt.isCorrect}
                    onChange={() => {
                      const newOpts = options.map((o, idx) => ({
                        ...o,
                        isCorrect: idx === i,
                      }));
                      setOptions(newOpts);
                    }}
                    className="accent-pixel-green"
                  />
                  <input
                    value={opt.text}
                    onChange={(e) => updateOption(i, 'text', e.target.value)}
                    placeholder={`Opcion ${i + 1}`}
                    className="flex-1 px-3 py-2 bg-pixel-dark border border-gray-600 text-white text-sm focus:outline-none focus:border-pixel-primary"
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="text-red-400 p-1">
                      <IoTrash size={14} />
                    </button>
                  )}
                </div>
              ))}
              <PixelButton type="button" onClick={addOption} size="sm" variant="secondary">
                + Opcion
              </PixelButton>
            </div>
          )}

          <div>
            <label className="block font-pixel text-[10px] text-gray-300 mb-2">Imagen (opcional)</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-400" />
            {image && <img src={`${apiBase}${image}`} alt="Preview" className="mt-2 w-20 h-20 object-cover" />}
          </div>

          <PixelButton type="submit" isLoading={isSubmitting}>
            {editing ? 'GUARDAR' : 'CREAR'}
          </PixelButton>
        </form>
      </PixelModal>
    </div>
  );
};

export default CardEditor;
