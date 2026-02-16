import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  const [uploadResponses, setUploadResponses] = useState<Record<string, string>>({});
  const [savedUploads, setSavedUploads] = useState<Record<number, Record<string, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef(Date.now());

  // Lock body scroll to prevent background scroll bleed on mobile
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Check if user scrolled to bottom (or content doesn't need scrolling)
  const checkScrollBottom = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
    const noScroll = el.scrollHeight <= el.clientHeight + 2;
    if (atBottom || noScroll) setHasReachedBottom(true);
  }, []);

  // Reset hasReachedBottom when the card changes, then re-check.
  // Skip reset for already-visited cards (index < maxReachedIndex) — they were
  // already scrolled through so the button shouldn't flash disabled.
  useEffect(() => {
    // Scroll container back to top for every card change
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = 0;

    if (currentIndex !== null && currentIndex < maxReachedIndex) {
      setHasReachedBottom(true);
      return;
    }
    setHasReachedBottom(false);
    if (!el) return;
    // Re-check after layout settles (GSAP transition takes ~1.5s)
    // Check multiple times to cover GSAP animation settling
    const timers = [100, 400, 900, 1800].map((ms) =>
      setTimeout(() => checkScrollBottom(el), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [currentIndex, maxReachedIndex, checkScrollBottom]);

  // Callback ref for the scrollable card container
  const handleScrollRef = useRef<(() => void) | null>(null);
  const scrollCallbackRef = useCallback((node: HTMLDivElement | null) => {
    // Clean up old listener
    const prev = scrollContainerRef.current;
    if (prev && handleScrollRef.current) {
      prev.removeEventListener('scroll', handleScrollRef.current);
    }

    scrollContainerRef.current = node;
    handleScrollRef.current = null;
    if (!node) return;

    const handleScroll = () => checkScrollBottom(node);
    handleScrollRef.current = handleScroll;
    node.addEventListener('scroll', handleScroll, { passive: true });

    // Also check immediately — content might not need scrolling
    // Use rAF to wait for layout to settle after GSAP transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        checkScrollBottom(node);
      });
    });
  }, [checkScrollBottom]);

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

    // Restore saved quiz answers and upload responses from backend progress
    if (moduleProgress) {
      const restored: Record<number, Record<string, number>> = {};
      const restoredUploads: Record<number, Record<string, string>> = {};
      mod.cards.forEach((card, cardIndex) => {
        const cp = moduleProgress.cardsProgress.find(
          (c) => c.card === card._id || c.card.toString() === card._id
        );
        if (cp?.quizAnswers && Object.keys(cp.quizAnswers).length > 0) {
          restored[cardIndex] = cp.quizAnswers;
        }
        if (cp?.uploadResponses && Object.keys(cp.uploadResponses).length > 0) {
          restoredUploads[cardIndex] = cp.uploadResponses;
        }
      });
      if (Object.keys(restored).length > 0) {
        setSavedAnswers(restored);
        // Pre-load quiz answers for the card we're resuming at
        if (restored[resumeIndex]) {
          setQuizAnswers(restored[resumeIndex]);
        }
      }
      if (Object.keys(restoredUploads).length > 0) {
        setSavedUploads(restoredUploads);
        // Pre-load upload responses for the card we're resuming at
        if (restoredUploads[resumeIndex]) {
          setUploadResponses(restoredUploads[resumeIndex]);
        }
      }
    }
  }

  const completeCardMutation = useMutation({
    mutationFn: ({ cardId, answers, uploads }: { cardId: string; answers?: Record<string, number>; uploads?: Record<string, string> }) =>
      endpoints.completeCard(courseId!, moduleId!, cardId, answers, uploads),
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

  const handleUploadImage = (blockIndex: number, imageUrl: string) => {
    setUploadResponses((prev) => ({
      ...prev,
      [blockIndex.toString()]: imageUrl,
    }));
  };

  const goBack = () => {
    if (currentIndex === null || currentIndex <= 0) return;
    // Save current quiz answers and upload responses for this card index before navigating away
    if (Object.keys(quizAnswers).length > 0) {
      setSavedAnswers((prev) => ({ ...prev, [currentIndex]: quizAnswers }));
    }
    if (Object.keys(uploadResponses).length > 0) {
      setSavedUploads((prev) => ({ ...prev, [currentIndex]: uploadResponses }));
    }
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    // Restore previously saved answers and uploads for the card we're going back to
    setQuizAnswers(savedAnswers[prevIndex] || {});
    setUploadResponses(savedUploads[prevIndex] || {});
  };

  const saveAndAdvance = async () => {
    if (!mod || currentIndex === null) return;

    const card = mod.cards[currentIndex];
    if (!card) return;

    setIsSaving(true);
    try {
      const answers = Object.keys(quizAnswers).length > 0 ? quizAnswers : undefined;
      const uploads = Object.keys(uploadResponses).length > 0 ? uploadResponses : undefined;
      await completeCardMutation.mutateAsync({ cardId: card._id, answers, uploads });

      const nextIndex = currentIndex + 1;
      // Save current answers and uploads in case user comes back
      if (Object.keys(quizAnswers).length > 0) {
        setSavedAnswers((prev) => ({ ...prev, [currentIndex]: quizAnswers }));
      }
      if (Object.keys(uploadResponses).length > 0) {
        setSavedUploads((prev) => ({ ...prev, [currentIndex]: uploadResponses }));
      }
      setQuizAnswers(savedAnswers[nextIndex] || {});
      setUploadResponses(savedUploads[nextIndex] || {});
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
      const uploads = Object.keys(uploadResponses).length > 0 ? uploadResponses : undefined;
      await completeCardMutation.mutateAsync({ cardId: card._id, answers, uploads });
      setQuizAnswers({});
      setUploadResponses({});
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
                  <div ref={scrollCallbackRef} className="card w-full flex-1 min-h-0 overflow-y-auto overscroll-contain p-4">
                    <div className="min-h-full flex flex-col justify-center">
                      <CardRenderer
                        card={currentCard}
                        quizAnswers={quizAnswers}
                        onQuizAnswer={handleQuizAnswer}
                        uploadResponses={uploadResponses}
                        onUploadImage={handleUploadImage}
                        readOnly={alreadyCompleted}
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
                  disabled={isSaving || !hasReachedBottom}
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
