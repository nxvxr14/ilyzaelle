import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo, useRef } from 'react';
import * as endpoints from '@/api/endpoints';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CardRenderer from '@/components/course/CardRenderer';
import CardTransition from '@/components/course/CardTransition';
import ModuleResults from '@/components/course/ModuleResults';
import { toast } from 'react-toastify';
import { ArrowLeftIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';

const ModuleViewPage = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [maxReachedIndex, setMaxReachedIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [savedAnswers, setSavedAnswers] = useState<Record<number, Record<string, number>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const startTimeRef = useRef(Date.now());

  const { data: mod, isLoading: loadingModule } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => endpoints.getModuleById(moduleId!).then((r) => r.data),
    enabled: !!moduleId,
  });

  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['progress', courseId],
    queryFn: () => endpoints.getCourseProgress(courseId!).then((r) => r.data).catch(() => null),
    enabled: !!courseId,
  });

  // Compute which cards are already completed from saved progress
  const completedCardIds = useMemo(() => {
    if (!progress || !moduleId) return new Set<string>();
    const mp = progress.modulesProgress.find(
      (m) => m.module === moduleId || (m.module as any)?._id === moduleId
    );
    return new Set(
      mp?.cardsProgress.filter((cp) => cp.completed).map((cp) => cp.card) || []
    );
  }, [progress, moduleId]);

  // Check if module was already completed previously
  const moduleProgress = useMemo(() => {
    return progress?.modulesProgress.find(
      (m) => m.module === moduleId || (m.module as any)?._id === moduleId
    );
  }, [progress, moduleId]);
  const alreadyCompleted = moduleProgress?.completed ?? false;

  // Determine the resume index (first uncompleted card), or 0 if re-viewing
  const resumeIndex = useMemo(() => {
    if (!mod) return 0;
    if (alreadyCompleted) return 0;
    const firstUncompleted = mod.cards.findIndex(
      (card) => !completedCardIds.has(card._id)
    );
    return firstUncompleted === -1 ? mod.cards.length : firstUncompleted;
  }, [mod, completedCardIds, alreadyCompleted]);

  // Set initial index once data is loaded
  if (currentIndex === null && mod && !loadingProgress) {
    setCurrentIndex(resumeIndex);
    setMaxReachedIndex(resumeIndex);

    // Restore saved quiz answers from backend progress
    if (moduleProgress) {
      const restored: Record<number, Record<string, number>> = {};
      mod.cards.forEach((card, cardIndex) => {
        const cp = moduleProgress.cardsProgress.find(
          (c) => c.card === card._id || c.card.toString() === card._id
        );
        if (cp?.quizAnswers && Object.keys(cp.quizAnswers).length > 0) {
          restored[cardIndex] = cp.quizAnswers;
        }
      });
      if (Object.keys(restored).length > 0) {
        setSavedAnswers(restored);
        // Pre-load quiz answers for the card we're resuming at
        if (restored[resumeIndex]) {
          setQuizAnswers(restored[resumeIndex]);
        }
      }
    }
  }

  const completeCardMutation = useMutation({
    mutationFn: ({ cardId, answers }: { cardId: string; answers?: Record<string, number> }) =>
      endpoints.completeCard(courseId!, moduleId!, cardId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
    },
  });

  const handleQuizAnswer = (blockIndex: number, optionIndex: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [blockIndex.toString()]: optionIndex,
    }));
  };

  const goBack = () => {
    if (currentIndex === null || currentIndex <= 0) return;
    // Save current quiz answers for this card index before navigating away
    if (Object.keys(quizAnswers).length > 0) {
      setSavedAnswers((prev) => ({ ...prev, [currentIndex]: quizAnswers }));
    }
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    // Restore previously saved answers for the card we're going back to
    setQuizAnswers(savedAnswers[prevIndex] || {});
  };

  const saveAndAdvance = async () => {
    if (!mod || currentIndex === null) return;

    const card = mod.cards[currentIndex];
    if (!card) return;

    setIsSaving(true);
    try {
      const answers = Object.keys(quizAnswers).length > 0 ? quizAnswers : undefined;
      await completeCardMutation.mutateAsync({ cardId: card._id, answers });

      const nextIndex = currentIndex + 1;
      // Save current answers in case user comes back
      if (Object.keys(quizAnswers).length > 0) {
        setSavedAnswers((prev) => ({ ...prev, [currentIndex]: quizAnswers }));
      }
      setQuizAnswers(savedAnswers[nextIndex] || {});
      setCurrentIndex(nextIndex);
      setMaxReachedIndex((prev) => Math.max(prev, nextIndex));
    } catch {
      toast.error('Error al guardar progreso');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!mod || currentIndex === null) return;

    const card = mod.cards[currentIndex];
    if (!card) return;

    setIsSaving(true);
    try {
      const answers = Object.keys(quizAnswers).length > 0 ? quizAnswers : undefined;
      await completeCardMutation.mutateAsync({ cardId: card._id, answers });
      setQuizAnswers({});
      // Wait for progress refetch so quizCorrect data is available for results
      await queryClient.refetchQueries({ queryKey: ['progress', courseId] });
      setShowResults(true);
    } catch {
      toast.error('Error al guardar progreso');
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingModule || loadingProgress) return <LoadingSpinner />;
  if (!mod) return <p className="p-6 text-lab-text-muted">Modulo no encontrado</p>;

  const totalCards = mod.cards.length;
  const safeIndex = currentIndex ?? 0;
  const isLastCard = safeIndex === totalCards - 1;
  const allDone = safeIndex >= totalCards;

  // Progress percentage: use maxReachedIndex for progress, 100% during results
  const progressPercent = (showResults || allDone)
    ? 100
    : totalCards > 0
      ? Math.round((Math.min(maxReachedIndex, totalCards) / totalCards) * 100)
      : 0;

  const currentCard = allDone ? null : mod.cards[safeIndex];

  return (
    <div className="fixed inset-0 flex flex-col bg-lab-bg z-[60]">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link
          to={`/courses/${courseId}`}
          className="text-lab-text-muted hover:text-lab-text"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold truncate">{mod.title}</h2>
          <p className="text-xs text-lab-text-muted">
            {allDone || showResults
              ? `${totalCards}/${totalCards} tarjetas`
              : `${safeIndex + 1} de ${totalCards}`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-2 bg-lab-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-lab-primary to-lab-secondary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-lab-text-muted text-right mt-1">{progressPercent}%</p>
      </div>

      {/* Card area — fills remaining space */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pb-4">
        {showResults && progress ? (
          <ModuleResults
            mod={mod}
            progress={progress}
            courseId={courseId!}
            moduleId={moduleId!}
            startTime={startTimeRef.current}
            onFinished={() => navigate(`/courses/${courseId}`)}
          />
        ) : allDone && !alreadyCompleted ? (
          <ModuleResults
            mod={mod}
            progress={progress!}
            courseId={courseId!}
            moduleId={moduleId!}
            startTime={startTimeRef.current}
            onFinished={() => navigate(`/courses/${courseId}`)}
          />
        ) : currentCard ? (
          <>
            {/* Card content — fills available space, scrolls internally */}
            <div className="flex-1 flex items-stretch min-h-0 overflow-hidden w-full justify-center">
              <div className="w-full max-w-lg lg:max-w-4xl flex flex-col min-h-0">
                <CardTransition transitionKey={currentCard._id}>
                  <div className="card w-full flex-1 min-h-0 overflow-y-auto p-4">
                    <div className="min-h-full flex flex-col justify-center">
                      <CardRenderer
                        card={currentCard}
                        quizAnswers={quizAnswers}
                        onQuizAnswer={handleQuizAnswer}
                      />
                    </div>
                  </div>
                </CardTransition>
              </div>
            </div>

            {/* Navigation buttons — always at bottom */}
            <div className="pt-3 flex gap-2 max-w-lg lg:max-w-4xl mx-auto w-full">
              {/* Back button — only show if not on first card */}
              {safeIndex > 0 && (
                <button
                  onClick={goBack}
                  disabled={isSaving}
                  className="btn-secondary py-4 px-4 flex-shrink-0"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
              )}

              {/* Forward / Finalize / Volver button */}
              {alreadyCompleted && isLastCard ? (
                <Link
                  to={`/courses/${courseId}`}
                  className="btn-primary w-full py-4 text-base font-semibold text-center block"
                >
                  Volver al curso
                </Link>
              ) : (
                <button
                  onClick={isLastCard ? handleFinalize : saveAndAdvance}
                  disabled={isSaving}
                  className="btn-primary w-full py-4 text-base font-semibold"
                >
                  {isSaving
                    ? 'Guardando...'
                    : isLastCard
                    ? 'Finalizar'
                    : 'Siguiente'}
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ModuleViewPage;
