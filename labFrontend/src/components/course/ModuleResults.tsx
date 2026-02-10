import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import * as endpoints from '@/api/endpoints';
import { useAuth } from '@/context/AuthContext';
import WigglingChest from '@/components/gamification/WigglingChest';
import RewardBox from '@/components/gamification/RewardBox';
import {
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import type { Module, Progress, CardBlock, QuizBlock, RewardResult } from '@/types';

interface QuizResultItem {
  question: string;
  correct: boolean;
  correctAnswer: string;
  selectedAnswer: string;
  points: number;
}

type Phase = 'quiz' | 'points' | 'chest' | 'reward' | 'done';

interface ModuleResultsProps {
  mod: Module;
  progress: Progress;
  courseId: string;
  moduleId: string;
  onFinished: () => void;
}

/**
 * Collects quiz results with correct/selected answer text.
 */
const collectQuizResults = (mod: Module, progress: Progress): QuizResultItem[] => {
  const mp = progress.modulesProgress.find(
    (m) => m.module === mod._id || (m.module as unknown as { _id: string })?._id === mod._id
  );
  if (!mp) return [];

  const results: QuizResultItem[] = [];

  for (const card of mod.cards) {
    const cp = mp.cardsProgress.find(
      (c) => c.card === card._id || c.card.toString() === card._id
    );
    if (!cp) continue;

    card.blocks.forEach((block: CardBlock, blockIndex: number) => {
      if (block.type !== 'quiz') return;
      const quizBlock = block as QuizBlock;
      const isCorrect = cp.quizCorrect?.[blockIndex.toString()] ?? false;
      const selectedIdx = cp.quizAnswers?.[blockIndex.toString()];
      results.push({
        question: quizBlock.question,
        correct: isCorrect,
        correctAnswer: quizBlock.options[quizBlock.correctIndex] ?? '',
        selectedAnswer: selectedIdx !== undefined
          ? quizBlock.options[selectedIdx] ?? ''
          : '(sin respuesta)',
        points: quizBlock.points,
      });
    });
  }

  return results;
};

const ModuleResults = ({
  mod,
  progress,
  courseId,
  moduleId,
  onFinished,
}: ModuleResultsProps) => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>('quiz');
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);
  const [showRewardBox, setShowRewardBox] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Refs for GSAP animations
  const quizRef = useRef<HTMLDivElement>(null);
  const pointsContainerRef = useRef<HTMLDivElement>(null);
  const pointsNumberRef = useRef<HTMLSpanElement>(null);
  const chestContainerRef = useRef<HTMLDivElement>(null);
  const doneContainerRef = useRef<HTMLDivElement>(null);

  const quizResults = collectQuizResults(mod, progress);
  const correctCount = quizResults.filter((r) => r.correct).length;
  const totalQuizzes = quizResults.length;

  // --- Mutations ---
  const completeModuleMutation = useMutation({
    mutationFn: () => endpoints.completeModuleProgress(courseId, moduleId),
    onSuccess: (response) => {
      const { reward, updatedTotalPoints } = response.data;
      setEarnedPoints(reward.points);

      // Store the reward result for when they open the chest
      setRewardResult(reward);

      // Update user totalPoints in AuthContext
      if (user) {
        updateUser({ ...user, totalPoints: updatedTotalPoints });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['user-activity'] });
      queryClient.invalidateQueries({ queryKey: ['user-badges'] });
    },
  });

  const openRewardBoxMutation = useMutation({
    mutationFn: () => endpoints.openRewardBox(courseId, moduleId),
    onSuccess: (response) => {
      // Use the populated badge from openRewardBox response
      setRewardResult(response.data);
      setShowRewardBox(true);
    },
  });

  // --- Phase transitions ---

  // Phase: quiz -> animate in quiz results
  useEffect(() => {
    if (phase !== 'quiz' || !quizRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      quizRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
    return () => { tl.kill(); };
  }, [phase]);

  // Phase: points -> animate counter, then transition to chest
  useEffect(() => {
    if (phase !== 'points') return;
    const container = pointsContainerRef.current;
    const numEl = pointsNumberRef.current;
    if (!container || !numEl) return;

    const tl = gsap.timeline();

    tl.fromTo(container, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });

    const counter = { val: 0 };
    tl.to(counter, {
      val: earnedPoints,
      duration: 1.5,
      ease: 'power1.out',
      onUpdate: () => {
        numEl.textContent = `+${Math.round(counter.val)}`;
      },
    }, '+=0.2');

    // Auto-advance to chest phase after counter
    tl.call(() => setPhase('chest'), [], '+=0.8');

    return () => { tl.kill(); };
  }, [phase, earnedPoints]);

  // Phase: chest -> animate in chest
  useEffect(() => {
    if (phase !== 'chest' || !chestContainerRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      chestContainerRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
    return () => { tl.kill(); };
  }, [phase]);

  // Phase: done -> animate in done button
  useEffect(() => {
    if (phase !== 'done' || !doneContainerRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(
      doneContainerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
    return () => { tl.kill(); };
  }, [phase]);

  // --- Handlers ---

  const handleQuizContinue = () => {
    // Call completeModule, then transition to points phase
    completeModuleMutation.mutate(undefined, {
      onSuccess: () => {
        setPhase('points');
      },
      onError: () => {
        // If module already completed, still show points
        setEarnedPoints(mod.points);
        setPhase('points');
      },
    });
  };

  const handleChestClick = () => {
    openRewardBoxMutation.mutate();
  };

  const handleRewardBoxClose = () => {
    setShowRewardBox(false);
    setPhase('done');
  };

  // --- Render ---

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {/* Phase 1: Quiz Results */}
      {phase === 'quiz' && (
        <div ref={quizRef} className="w-full max-w-lg" style={{ opacity: 0 }}>
          <div className="card p-6 text-center">
            <h3 className="text-lg font-bold mb-4 text-lab-text">
              Resultados del modulo
            </h3>

            {totalQuizzes > 0 ? (
              <div className="space-y-2 mb-6 text-left">
                {quizResults.map((result, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-lab-bg/50 border border-lab-border"
                  >
                    <div className="flex items-start gap-2">
                      {result.correct ? (
                        <CheckCircleIcon className="w-5 h-5 text-lab-secondary flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-lab-accent flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-lab-text">{result.question}</p>
                        {result.correct ? (
                          <p className="text-xs mt-1 text-lab-secondary">
                            +{result.points} pts
                          </p>
                        ) : (
                          <div className="mt-1">
                            <p className="text-xs text-lab-accent">
                              Tu respuesta: {result.selectedAnswer}
                            </p>
                            <p className="text-xs text-lab-secondary mt-0.5">
                              Correcta: {result.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <p className="text-xs text-lab-text-muted text-center pt-2">
                  {correctCount} de {totalQuizzes} correctas
                </p>
              </div>
            ) : (
              <p className="text-sm text-lab-text-muted mb-6">
                Este modulo no tenia preguntas
              </p>
            )}

            <button
              onClick={handleQuizContinue}
              disabled={completeModuleMutation.isPending}
              className="btn-primary w-full py-3 text-base font-semibold"
            >
              {completeModuleMutation.isPending ? 'Procesando...' : 'Continuar'}
            </button>
          </div>
        </div>
      )}

      {/* Phase 2: Points Animation */}
      {phase === 'points' && (
        <div
          ref={pointsContainerRef}
          className="text-center"
          style={{ opacity: 0 }}
        >
          <p className="text-lab-text-muted text-sm mb-2">Puntos ganados</p>
          <span
            ref={pointsNumberRef}
            className="text-5xl font-black text-lab-gold"
          >
            +0
          </span>
          <p className="text-lab-text-muted text-xs mt-2">
            {mod.points} base{totalQuizzes > 0 ? ` + ${earnedPoints - mod.points} quiz bonus` : ''}
          </p>
        </div>
      )}

      {/* Phase 3: Wiggling Chest */}
      {phase === 'chest' && (
        <div
          ref={chestContainerRef}
          className="w-full max-w-sm"
          style={{ opacity: 0 }}
        >
          <p className="text-center text-lab-text-muted text-sm mb-4">
            Tienes una recompensa esperando
          </p>
          <WigglingChest
            onClick={handleChestClick}
            disabled={openRewardBoxMutation.isPending}
          />
        </div>
      )}

      {/* Phase 4: RewardBox overlay */}
      {showRewardBox && rewardResult && (
        <RewardBox
          result={rewardResult}
          onClose={handleRewardBoxClose}
        />
      )}

      {/* Phase 5: Done — Volver al curso */}
      {phase === 'done' && (
        <div
          ref={doneContainerRef}
          className="text-center"
          style={{ opacity: 0 }}
        >
          <p className="text-lab-secondary font-bold text-lg mb-2">
            Modulo completado
          </p>
          <p className="text-lab-text-muted text-sm mb-6">
            Has ganado {earnedPoints} puntos en total
          </p>
          <button
            onClick={onFinished}
            className="btn-primary px-8 py-3 text-base font-semibold"
          >
            Volver al curso
          </button>
        </div>
      )}
    </div>
  );
};

export default ModuleResults;
