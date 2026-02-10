import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CardRenderer from '@/components/course/CardRenderer';
import RewardBox from '@/components/gamification/RewardBox';
import { getImageUrl } from '@/utils/helpers';
import { toast } from 'react-toastify';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import type { RewardResult } from '@/types';

const ModuleViewPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const queryClient = useQueryClient();
  const [showReward, setShowReward] = useState(false);
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);

  const { data: mod, isLoading: loadingModule } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => endpoints.getModuleById(moduleId!).then((r) => r.data),
    enabled: !!moduleId,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => endpoints.getCourseProgress(courseId!).then((r) => r.data).catch(() => null),
    enabled: !!courseId,
  });

  const completeCardMutation = useMutation({
    mutationFn: ({ cardId, quizAnswers }: { cardId: string; quizAnswers?: Record<string, number> }) =>
      endpoints.completeCard(courseId!, moduleId!, cardId, quizAnswers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
    },
  });

  const completeModuleMutation = useMutation({
    mutationFn: () => endpoints.completeModuleProgress(courseId!, moduleId!),
    onSuccess: (response) => {
      const result = response.data.reward;
      setRewardResult(result);
      setShowReward(true);
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['user-activity'] });
      queryClient.invalidateQueries({ queryKey: ['user-badges'] });
    },
    onError: () => toast.error('Error al completar modulo'),
  });

  if (loadingModule) return <LoadingSpinner />;
  if (!mod) return <p className="p-6 text-lab-text-muted">Modulo no encontrado</p>;

  const moduleProgress = progress?.modulesProgress.find(
    (mp) => mp.module === moduleId || (mp.module as any)?._id === moduleId
  );
  const isModuleCompleted = moduleProgress?.completed;

  const completedCardIds = new Set(
    moduleProgress?.cardsProgress
      .filter((cp) => cp.completed)
      .map((cp) => cp.card) || []
  );

  const allCardsCompleted = mod.cards.length > 0 &&
    mod.cards.every((card) => completedCardIds.has(card._id));

  const handleCardComplete = (cardId: string, quizAnswers?: Record<string, number>) => {
    completeCardMutation.mutate({ cardId, quizAnswers });
  };

  const handleCompleteModule = () => {
    completeModuleMutation.mutate();
  };

  return (
    <div className="py-4">
      {/* Back */}
      <Link
        to={`/courses/${courseId}`}
        className="flex items-center gap-2 text-lab-text-muted hover:text-lab-text mb-4 text-sm"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Volver al curso
      </Link>

      {/* Module header */}
      <div className="card mb-6 overflow-hidden p-0">
        {mod.coverImage && (
          <div className="h-32 overflow-hidden">
            <img
              src={getImageUrl(mod.coverImage)}
              alt={mod.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-4">
          <h2 className="text-xl font-bold">{mod.title}</h2>
          {mod.description && (
            <p className="text-lab-text-muted text-sm mt-1">{mod.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-lab-text-muted">
            <span>{mod.cards.length} tarjetas</span>
            <span>{mod.points} puntos</span>
            {isModuleCompleted && (
              <span className="flex items-center gap-1 text-lab-secondary">
                <CheckCircleIcon className="w-4 h-4" /> Completado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cards - scrollable */}
      <div className="space-y-6">
        {mod.cards.map((card, index) => (
          <CardRenderer
            key={card._id}
            card={card}
            index={index}
            isCompleted={completedCardIds.has(card._id)}
            onComplete={handleCardComplete}
          />
        ))}
      </div>

      {/* Complete module button */}
      {!isModuleCompleted && allCardsCompleted && (
        <div className="mt-8 text-center">
          <button
            onClick={handleCompleteModule}
            disabled={completeModuleMutation.isPending}
            className="btn-primary animate-glow text-lg px-8 py-4"
          >
            {completeModuleMutation.isPending
              ? 'Completando...'
              : 'Abrir Caja de Recompensas'}
          </button>
        </div>
      )}

      {/* Reward box animation */}
      {showReward && rewardResult && (
        <RewardBox
          result={rewardResult}
          onClose={() => setShowReward(false)}
        />
      )}
    </div>
  );
};

export default ModuleViewPage;
