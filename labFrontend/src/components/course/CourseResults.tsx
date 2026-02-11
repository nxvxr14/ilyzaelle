import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import gsap from 'gsap';
import * as endpoints from '@/api/endpoints';
import { getImageUrl } from '@/utils/helpers';
import RewardBox from '@/components/gamification/RewardBox';
import {
  TrophyIcon,
  StarIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';
import type { Progress, RewardResult } from '@/types';

type Phase = 'points' | 'chest' | 'summary';

interface CourseResultsProps {
  courseId: string;
  progress: Progress;
  onFinished: () => void;
}

const PARTICLE_COLORS = ['#fdcb6e', '#6c5ce7', '#00cec9', '#fd79a8', '#fff'];

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
 * Formats duration between two dates in days.
 */
const formatCourseDuration = (startDate: string, endDate: string | null): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 1) return '1 dia';
  if (diffDays < 30) return `${diffDays} dias`;
  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  if (remainingDays === 0) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  return `${months} ${months === 1 ? 'mes' : 'meses'}, ${remainingDays} dias`;
};

const CourseResults = ({ courseId, progress, onFinished }: CourseResultsProps) => {
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>('points');
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);
  const [showRewardBox, setShowRewardBox] = useState(false);
  const [pointsReady, setPointsReady] = useState(false);

  // Refs for GSAP animations
  const pointsContainerRef = useRef<HTMLDivElement>(null);
  const pointsNumberRef = useRef<HTMLSpanElement>(null);
  const pointsButtonRef = useRef<HTMLButtonElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const totalPoints = progress.totalPoints;

  // --- Mutation ---
  const claimRewardMutation = useMutation({
    mutationFn: () => endpoints.claimCourseReward(courseId),
    onSuccess: (response) => {
      setRewardResult(response.data);
      setShowRewardBox(true);
      queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
      queryClient.invalidateQueries({ queryKey: ['user-activity'] });
      queryClient.invalidateQueries({ queryKey: ['user-badges'] });
    },
  });

  // --- Points animation ---
  useEffect(() => {
    if (phase !== 'points') return;
    const container = pointsContainerRef.current;
    const numEl = pointsNumberRef.current;
    const btnEl = pointsButtonRef.current;
    const particleContainer = particlesRef.current;
    const glowEl = glowRef.current;
    if (!container || !numEl || !btnEl || !particleContainer || !glowEl) return;

    const particles = createParticles(particleContainer, 30);

    const tl = gsap.timeline();

    tl.fromTo(container, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });

    const counter = { val: 0 };
    tl.to(counter, {
      val: totalPoints,
      duration: 1.5,
      ease: 'power1.out',
      onUpdate: () => {
        numEl.textContent = `+${Math.round(counter.val)}`;
      },
    }, '+=0.2');

    tl.to(numEl, { scale: 1.3, duration: 0.15, ease: 'power2.out' });
    tl.to(numEl, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' });
    tl.to(particles, {
      x: () => (Math.random() - 0.5) * 300,
      y: () => (Math.random() - 0.5) * 300,
      scale: () => Math.random() * 2 + 0.5,
      opacity: 1,
      duration: 0.6,
      stagger: 0.01,
      ease: 'power3.out',
    }, '<');
    tl.to(particles, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.1');

    tl.to(glowEl, {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => glowEl.classList.add('animate-glow-pulse'),
    });

    tl.call(() => setPointsReady(true), [], '+=0.2');
    tl.fromTo(btnEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });

    return () => {
      tl.kill();
      particles.forEach((p) => p.remove());
    };
  }, [phase, totalPoints]);

  // --- Handlers ---
  const handlePointsContinue = () => setPhase('chest');

  const handleChestClick = () => {
    claimRewardMutation.mutate();
  };

  const handleRewardBoxClose = () => {
    setShowRewardBox(false);
    setPhase('summary');
  };

  // --- Render ---
  return (
    <div className="fixed inset-0 z-[60] bg-lab-bg flex items-center justify-center">
      <div className="flex flex-col items-center justify-center px-4 w-full">
        {/* Phase 1: Points Animation */}
        {phase === 'points' && (
          <div
            ref={pointsContainerRef}
            className="text-center relative"
            style={{ opacity: 0 }}
          >
            <p className="text-lab-text-muted text-sm mb-2">Puntos totales del curso</p>
            <div className="relative inline-block">
              <div
                ref={glowRef}
                className="absolute -inset-x-16 -inset-y-10 rounded-full pointer-events-none"
                style={{ opacity: 0 }}
              >
                <div className="absolute inset-0 rounded-full bg-lab-gold/40 blur-3xl" />
                <div className="absolute inset-4 rounded-full bg-lab-primary/30 blur-2xl" />
              </div>
              <span
                ref={pointsNumberRef}
                className="text-7xl font-black text-lab-gold inline-block relative"
              >
                +0
              </span>
              <div
                ref={particlesRef}
                className="absolute inset-0 pointer-events-none overflow-visible"
              />
            </div>
            <p className="text-lab-text-muted text-xs mt-2">
              puntos acumulados en todos los modulos
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

        {/* Phase 2: Chest */}
        {phase === 'chest' && (
          <div className="flex flex-col items-center justify-center gap-6">
            <p className="text-lab-text-muted text-sm">Recompensa del curso</p>
            <div
              onClick={claimRewardMutation.isPending ? undefined : handleChestClick}
              className="w-32 h-32 rounded-2xl bg-gradient-to-br from-lab-gold/20 via-lab-primary/10 to-lab-gold/20 border-2 border-lab-gold/40 flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform animate-float animate-chest-glow"
            >
              <span className="text-7xl">🎁</span>
            </div>
          </div>
        )}

        {/* Phase 3: RewardBox overlay */}
        {showRewardBox && rewardResult && (
          <RewardBox
            result={rewardResult}
            onClose={handleRewardBoxClose}
            hidePoints
          />
        )}

        {/* Phase 4: Summary */}
        {phase === 'summary' && (
          <div className="w-full max-w-lg">
            <div className="card p-6 text-center space-y-6">
              <div>
                <TrophyIcon className="w-10 h-10 text-lab-gold mx-auto mb-2" />
                <h3 className="text-lg font-bold text-lab-text">
                  Curso completado
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
                    <p className="font-bold text-lab-gold">
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
                    <p className="text-lg font-bold text-lab-gold">+{totalPoints}</p>
                    <p className="text-xs text-lab-text-muted">puntos</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-10 w-px bg-lab-border" />

                {/* Duration */}
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-lab-secondary" />
                  <div className="text-left">
                    <p className="text-lg font-bold text-lab-secondary">
                      {formatCourseDuration(progress.createdAt, progress.completedAt)}
                    </p>
                    <p className="text-xs text-lab-text-muted">duracion</p>
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
    </div>
  );
};

export default CourseResults;
