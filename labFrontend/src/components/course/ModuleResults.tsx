import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import * as endpoints from '@/api/endpoints';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl, getRarityColor } from '@/utils/helpers';
import RewardBox from '@/components/gamification/RewardBox';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import type { Module, Progress, CardBlock, QuizBlock, RewardResult } from '@/types';

interface QuizResultItem {
  question: string;
  correct: boolean;
  correctAnswer: string;
  selectedAnswer: string;
  points: number;
}

type Phase = 'quiz' | 'points' | 'chest' | 'reward' | 'summary';

interface ModuleResultsProps {
  mod: Module;
  progress: Progress;
  courseId: string;
  moduleId: string;
  startTime: number;
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

const PARTICLE_COLORS = ['#fdcb6e', '#6c5ce7', '#00cec9', '#fd79a8', '#fff'];

/**
 * Creates particle elements inside a container for burst effect.
 */
const createParticles = (container: HTMLDivElement, count: number): HTMLDivElement[] => {
  const particles: HTMLDivElement[] = [];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'absolute rounded-full pointer-events-none';
    const size = Math.random() * 6 + 3;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)] as string;
    p.style.left = '50%';
    p.style.top = '50%';
    p.style.opacity = '0';
    container.appendChild(p);
    particles.push(p);
  }
  return particles;
};

/**
 * Formats elapsed time in mm:ss or hh:mm:ss.
 */
const formatElapsedTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

const ModuleResults = ({
  mod,
  progress,
  courseId,
  moduleId,
  startTime,
  onFinished,
}: ModuleResultsProps) => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>('quiz');
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);
  const [showRewardBox, setShowRewardBox] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [pointsReady, setPointsReady] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Refs for GSAP animations
  const quizRef = useRef<HTMLDivElement>(null);
  const pointsContainerRef = useRef<HTMLDivElement>(null);
  const pointsNumberRef = useRef<HTMLSpanElement>(null);
  const pointsButtonRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const quizResults = collectQuizResults(mod, progress);
  const correctCount = quizResults.filter((r) => r.correct).length;
  const totalQuizzes = quizResults.length;

  // --- Mutations ---
  const completeModuleMutation = useMutation({
    mutationFn: () => endpoints.completeModuleProgress(courseId, moduleId),
    onSuccess: (response) => {
      const { reward, updatedTotalPoints } = response.data;
      setEarnedPoints(reward.points);
      setRewardResult(reward);

      if (user) {
        updateUser({ ...user, totalPoints: updatedTotalPoints });
      }

      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['user-activity'] });
      queryClient.invalidateQueries({ queryKey: ['user-badges'] });
    },
  });

  const openRewardBoxMutation = useMutation({
    mutationFn: () => endpoints.openRewardBox(courseId, moduleId),
    onSuccess: (response) => {
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

  // Phase: points -> animate counter + particle burst + glow + show button
  useEffect(() => {
    if (phase !== 'points') return;
    const container = pointsContainerRef.current;
    const numEl = pointsNumberRef.current;
    const btnEl = pointsButtonRef.current;
    const particleContainer = particlesRef.current;
    const glowEl = glowRef.current;
    if (!container || !numEl || !btnEl || !particleContainer || !glowEl) return;

    // Create particles for the burst
    const particles = createParticles(particleContainer, 30);

    const tl = gsap.timeline();

    // Fade in container
    tl.fromTo(container, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });

    // Counter animation
    const counter = { val: 0 };
    tl.to(counter, {
      val: earnedPoints,
      duration: 1.5,
      ease: 'power1.out',
      onUpdate: () => {
        numEl.textContent = `+${Math.round(counter.val)}`;
      },
    }, '+=0.2');

    // Particle burst when counter finishes
    tl.to(numEl, {
      scale: 1.3,
      duration: 0.15,
      ease: 'power2.out',
    });
    tl.to(numEl, {
      scale: 1,
      duration: 0.3,
      ease: 'elastic.out(1, 0.4)',
    });
    tl.to(particles, {
      x: () => (Math.random() - 0.5) * 300,
      y: () => (Math.random() - 0.5) * 300,
      scale: () => Math.random() * 2 + 0.5,
      opacity: 1,
      duration: 0.6,
      stagger: 0.01,
      ease: 'power3.out',
    }, '<');
    tl.to(particles, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
    }, '-=0.1');

    // Breathing glow appears after particles fade
    tl.to(glowEl, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        // Add the CSS animation class for continuous breathing
        glowEl.classList.add('animate-glow-pulse');
      },
    });

    // Show "Continuar" button
    tl.call(() => setPointsReady(true), [], '+=0.2');
    tl.fromTo(
      btnEl,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );

    return () => {
      tl.kill();
      particles.forEach((p) => p.remove());
    };
  }, [phase, earnedPoints]);

  // --- Handlers ---

  const handleQuizContinue = () => {
    completeModuleMutation.mutate(undefined, {
      onSuccess: () => {
        setPhase('points');
      },
      onError: () => {
        setEarnedPoints(mod.points);
        setPhase('points');
      },
    });
  };

  const handlePointsContinue = () => {
    setPhase('chest');
  };

  const handleChestClick = () => {
    openRewardBoxMutation.mutate();
  };

  const handleRewardBoxClose = () => {
    setShowRewardBox(false);
    setElapsedTime(Date.now() - startTime);
    setPhase('summary');
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

      {/* Phase 2: Points Animation + particle burst + breathing glow + Continuar button */}
      {phase === 'points' && (
        <div
          ref={pointsContainerRef}
          className="text-center relative"
          style={{ opacity: 0 }}
        >
          <p className="text-lab-text-muted text-sm mb-2">Puntos ganados</p>
          <div className="relative inline-block">
            {/* Breathing glow behind the number */}
            <div
              ref={glowRef}
              className="absolute inset-0 -inset-x-8 -inset-y-4 rounded-full bg-lab-primary/30 blur-2xl pointer-events-none"
              style={{ opacity: 0 }}
            />
            <span
              ref={pointsNumberRef}
              className="text-5xl font-black text-lab-gold inline-block relative"
            >
              +0
            </span>
            {/* Particle container — positioned over the number */}
            <div
              ref={particlesRef}
              className="absolute inset-0 pointer-events-none overflow-visible"
            />
          </div>
          <p className="text-lab-text-muted text-xs mt-2">
            {mod.points} base{totalQuizzes > 0 ? ` + ${earnedPoints - mod.points} quiz bonus` : ''}
          </p>
          <button
            ref={pointsButtonRef}
            onClick={handlePointsContinue}
            className="btn-primary mt-8 px-10 py-3 text-base font-semibold"
            style={{ opacity: 0 }}
            disabled={!pointsReady}
          >
            Continuar
          </button>
        </div>
      )}

      {/* Phase 3: Chest — pure CSS animations, no GSAP */}
      {phase === 'chest' && (
        <div className="flex flex-col items-center justify-center gap-6">
          <div
            onClick={openRewardBoxMutation.isPending ? undefined : handleChestClick}
            className="w-32 h-32 rounded-2xl bg-gradient-to-br from-lab-gold/20 via-lab-primary/10 to-lab-gold/20 border-2 border-lab-gold/40 flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform animate-float animate-chest-glow"
          >
            <span className="text-7xl">🎁</span>
          </div>
        </div>
      )}

      {/* Phase 4: RewardBox overlay */}
      {showRewardBox && rewardResult && (
        <RewardBox
          result={rewardResult}
          onClose={handleRewardBoxClose}
          hidePoints
        />
      )}

      {/* Phase 5: Summary screen */}
      {phase === 'summary' && (
        <div className="w-full max-w-lg">
          <div className="card p-6 text-center space-y-6">
            <div>
              <TrophyIcon className="w-10 h-10 text-lab-gold mx-auto mb-2" />
              <h3 className="text-lg font-bold text-lab-text">
                Modulo completado
              </h3>
            </div>

            {/* Badge earned */}
            {rewardResult?.badgeEarned && (
              <div className="p-4 rounded-2xl bg-lab-bg/50 border border-lab-gold/30">
                <p className="text-xs text-lab-gold font-semibold mb-3 uppercase tracking-wider">
                  Insignia obtenida
                </p>
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={getImageUrl((rewardResult.badgeEarned as any).image || '')}
                    alt={(rewardResult.badgeEarned as any).name || 'Badge'}
                    className="w-14 h-14"
                  />
                  <p className={`font-bold ${getRarityColor((rewardResult.badgeEarned as any).rarity || 'common')}`}>
                    {(rewardResult.badgeEarned as any).name || 'Insignia'}
                  </p>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="flex items-center justify-center gap-6">
              {/* Points */}
              <div className="flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-lab-gold" />
                <div className="text-left">
                  <p className="text-lg font-bold text-lab-gold">+{earnedPoints}</p>
                  <p className="text-xs text-lab-text-muted">puntos</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-10 w-px bg-lab-border" />

              {/* Time */}
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-lab-secondary" />
                <div className="text-left">
                  <p className="text-lg font-bold text-lab-secondary">
                    {formatElapsedTime(elapsedTime)}
                  </p>
                  <p className="text-xs text-lab-text-muted">tiempo</p>
                </div>
              </div>
            </div>

            <button
              onClick={onFinished}
              className="btn-primary w-full py-3 text-base font-semibold"
            >
              Volver al curso
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleResults;
