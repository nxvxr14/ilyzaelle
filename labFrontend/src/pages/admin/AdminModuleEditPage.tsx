import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CardEditor from '@/components/editor/CardEditor';
import SortableItem from '@/components/admin/SortableItem';
import { toast } from 'react-toastify';
import { getImageUrl, getRarityColor } from '@/utils/helpers';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import type { CardBlock, Badge, Card } from '@/types';

const AdminModuleEditPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingBlocks, setEditingBlocks] = useState<CardBlock[]>([]);
  const [editingTitle, setEditingTitle] = useState('');
  const [localDropChance, setLocalDropChance] = useState<number | null>(null);

  const { data: mod, isLoading } = useQuery({
    queryKey: ['admin-module', moduleId],
    queryFn: () => endpoints.getModuleById(moduleId!).then((r) => r.data),
    enabled: !!moduleId,
  });

  const createCardMutation = useMutation({
    mutationFn: (data: { title: string; moduleId: string; blocks: CardBlock[] }) =>
      endpoints.createCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module', moduleId] });
      toast.success('Tarjeta creada');
      setEditorOpen(false);
    },
    onError: () => toast.error('Error al crear tarjeta'),
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      endpoints.updateCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module', moduleId] });
      toast.success('Tarjeta actualizada');
      setEditorOpen(false);
      setEditingCardId(null);
    },
    onError: () => toast.error('Error al actualizar tarjeta'),
  });

  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => endpoints.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module', moduleId] });
      toast.success('Tarjeta eliminada');
    },
  });

  const { data: allBadges } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: () => endpoints.getAllBadges().then((r) => r.data),
  });

  const assignBadgeMutation = useMutation({
    mutationFn: (data: { badge: string | null; badgeDropChance: number }) => {
      const formData = new FormData();
      formData.append('badge', data.badge || '');
      formData.append('badgeDropChance', data.badgeDropChance.toString());
      return endpoints.updateModule(moduleId!, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module', moduleId] });
      toast.success('Insignia actualizada');
    },
    onError: () => toast.error('Error al asignar insignia'),
  });

  const reorderMutation = useMutation({
    mutationFn: (cards: { id: string; order: number }[]) =>
      endpoints.reorderCards(cards),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module', moduleId] });
    },
    onError: () => toast.error('Error al reordenar tarjetas'),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !mod?.cards) return;

    const sortedCards = [...mod.cards].sort((a: Card, b: Card) => a.order - b.order);
    const oldIndex = sortedCards.findIndex((c: Card) => c._id === active.id);
    const newIndex = sortedCards.findIndex((c: Card) => c._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...sortedCards];
    const [moved] = reordered.splice(oldIndex, 1) as [Card];
    reordered.splice(newIndex, 0, moved);

    // Optimistically update the cache with new order
    const updatedCards = reordered.map((c: Card, i: number) => ({ ...c, order: i }));
    queryClient.setQueryData(['admin-module', moduleId], { ...mod, cards: updatedCards });

    const updates = reordered.map((c: Card, i: number) => ({ id: c._id, order: i }));
    reorderMutation.mutate(updates);
  };

  const handleNewCard = () => {
    setEditingCardId(null);
    setEditingTitle('');
    setEditingBlocks([]);
    setEditorOpen(true);
  };

  const handleEditCard = (card: any) => {
    setEditingCardId(card._id);
    setEditingTitle(card.title);
    setEditingBlocks(card.blocks || []);
    setEditorOpen(true);
  };

  const handleSaveCard = (title: string, blocks: CardBlock[]) => {
    if (editingCardId) {
      updateCardMutation.mutate({ id: editingCardId, data: { title, blocks } });
    } else {
      createCardMutation.mutate({ title, moduleId: moduleId!, blocks });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!mod) return <p className="p-6">Modulo no encontrado</p>;

  return (
    <div className="py-4 space-y-6">
      <Link
        to={`/admin/courses/${courseId}`}
        className="flex items-center gap-2 text-lab-text-muted hover:text-lab-text text-sm"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Volver al curso
      </Link>

      <div className="card">
        <h2 className="text-xl font-bold">{mod.title}</h2>
        <p className="text-sm text-lab-text-muted mt-1">{mod.description}</p>
        <p className="text-xs text-lab-text-muted mt-2">
          {mod.cards.length} tarjetas &middot; {mod.points} puntos
        </p>
      </div>

      {/* Badge assignment */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <TrophyIcon className="w-5 h-5 text-lab-gold" />
          <h3 className="font-semibold text-sm">Insignia del modulo</h3>
        </div>
        <p className="text-xs text-lab-text-muted mb-3">
          Al completar este modulo, el usuario tiene una probabilidad de ganar esta insignia.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-lab-text-muted mb-1">Insignia</label>
            <select
              value={(mod.badge as Badge | null)?._id || ''}
              onChange={(e) => {
                assignBadgeMutation.mutate({
                  badge: e.target.value || null,
                  badgeDropChance: mod.badgeDropChance,
                });
              }}
              className="input-field text-sm"
            >
              <option value="">Sin insignia</option>
              {allBadges?.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.rarity})
                </option>
              ))}
            </select>
          </div>

          {(mod.badge as Badge | null) && (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-lab-bg">
                <img
                  src={getImageUrl((mod.badge as Badge).image)}
                  alt={(mod.badge as Badge).name}
                  className="w-10 h-10"
                />
                <div>
                  <p className={`font-semibold text-sm ${getRarityColor((mod.badge as Badge).rarity)}`}>
                    {(mod.badge as Badge).name}
                  </p>
                  <p className="text-xs text-lab-text-muted capitalize">{(mod.badge as Badge).rarity}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-lab-text-muted mb-1">
                  Probabilidad de obtener ({localDropChance ?? mod.badgeDropChance}%)
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={localDropChance ?? mod.badgeDropChance}
                  onChange={(e) => setLocalDropChance(Number(e.target.value))}
                  onPointerUp={() => {
                    if (localDropChance !== null) {
                      assignBadgeMutation.mutate({
                        badge: (mod.badge as Badge)?._id || null,
                        badgeDropChance: localDropChance,
                      });
                      setLocalDropChance(null);
                    }
                  }}
                  className="w-full accent-lab-primary"
                />
                <div className="flex justify-between text-[10px] text-lab-text-muted">
                  <span>1%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Tarjetas ({mod.cards.length})</h3>
          <button
            onClick={handleNewCard}
            className="btn-primary text-sm py-2 flex items-center gap-1"
          >
            <PlusIcon className="w-4 h-4" /> Tarjeta
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={mod.cards
              .slice()
              .sort((a: Card, b: Card) => a.order - b.order)
              .map((c: Card) => c._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {mod.cards
                .slice()
                .sort((a: Card, b: Card) => a.order - b.order)
                .map((card: Card, index: number) => (
                <SortableItem key={card._id} id={card._id}>
                  <div
                    className="card flex items-center justify-between cursor-pointer hover:border-lab-primary/30 transition-colors"
                    onClick={() => handleEditCard(card)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-lab-bg flex items-center justify-center text-sm font-bold text-lab-text-muted flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{card.title}</p>
                        <p className="text-xs text-lab-text-muted">
                          {card.blocks.length} bloques
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCard(card);
                        }}
                        className="p-2 text-lab-text-muted hover:text-lab-primary"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Eliminar esta tarjeta?')) {
                            deleteCardMutation.mutate(card._id);
                          }
                        }}
                        className="p-2 text-lab-text-muted hover:text-red-400"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Card editor */}
      {editorOpen && (
        <CardEditor
          isOpen={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setEditingCardId(null);
          }}
          initialTitle={editingTitle}
          initialBlocks={editingBlocks}
          onSave={handleSaveCard}
          isSaving={createCardMutation.isPending || updateCardMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminModuleEditPage;
