import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { RewardResult } from '@/types';
import { getImageUrl, getRarityColor } from '@/utils/helpers';

interface RewardBoxProps {
  result: RewardResult;
  onClose: () => void;
  hidePoints?: boolean;
}

const RARITY_LABELS: Record<string, string> = {
  common: 'Comun',
  rare: 'Raro',
  epic: 'Epico',
  legendary: 'Legendario',
};

const RewardBox = ({ result, onClose, hidePoints = false }: RewardBoxProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const chestRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<'spinning' | 'revealed'>('spinning');

  useEffect(() => {
    const overlay = overlayRef.current;
    const chest = chestRef.current;
    const slot = slotRef.current;
    const resultEl = resultRef.current;
    const starsEl = starsRef.current;
    if (!overlay || !chest || !slot || !resultEl || !starsEl) return;

    // Create star particles for the reveal
    const stars: HTMLDivElement[] = [];
    for (let i = 0; i < 40; i++) {
      const star = document.createElement('div');
      star.className = 'absolute rounded-full pointer-events-none';
      const size = Math.random() * 5 + 2;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.background = ['#fdcb6e', '#6c5ce7', '#00cec9', '#fd79a8', '#fff'][
        Math.floor(Math.random() * 5)
      ] as string;
      star.style.left = '50%';
      star.style.top = '50%';
      star.style.opacity = '0';
      starsEl.appendChild(star);
      stars.push(star);
    }

    const tl = gsap.timeline();

    // Phase 1: Fade in overlay + chest appears (0.5s)
    tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .fromTo(
        chest,
        { scale: 0, rotation: -15 },
        { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }
      );

    // Phase 2: Chest shakes increasingly (1.5s)
    tl.to(chest, {
      rotation: 3,
      duration: 0.1,
      yoyo: true,
      repeat: 5,
      ease: 'power1.inOut',
    })
      .to(chest, {
        rotation: 6,
        duration: 0.08,
        yoyo: true,
        repeat: 7,
        ease: 'power1.inOut',
      })
      .to(chest, {
        rotation: 10,
        duration: 0.05,
        yoyo: true,
        repeat: 9,
        ease: 'power1.inOut',
      });

    // Phase 3: Glow builds up (0.5s)
    tl.to(chest, {
      boxShadow: '0 0 60px rgba(253, 203, 110, 0.8), 0 0 120px rgba(108, 92, 231, 0.5)',
      duration: 0.5,
      ease: 'power2.in',
    });

    // Phase 4: Casino slot spin (2s) — chest scales down, slot appears
    tl.to(chest, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    })
      .call(() => setPhase('spinning'))
      .fromTo(
        slot,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.4)' }
      );

    // Phase 5: Stars explode + result reveals (0.5s)
    tl.to(
      stars,
      {
        x: () => (Math.random() - 0.5) * 500,
        y: () => (Math.random() - 0.5) * 500,
        scale: () => Math.random() * 3 + 1,
        opacity: 1,
        duration: 0.8,
        stagger: 0.015,
        ease: 'power3.out',
      },
      '+=0.8'
    )
      .to(slot, { opacity: 0, scale: 0.8, duration: 0.2 }, '<')
      .fromTo(
        resultEl,
        { opacity: 0, scale: 0.5, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' },
        '<0.1'
      )
      .call(() => setPhase('revealed'));

    // Fade out stars
    tl.to(stars, { opacity: 0, duration: 0.5, ease: 'power2.in' }, '-=0.3');

    // Animate points counter (skip if hidePoints)
    if (pointsRef.current && !hidePoints) {
      const counter = { val: 0 };
      tl.to(
        counter,
        {
          val: result.points,
          duration: 1.2,
          ease: 'power1.out',
          onUpdate: () => {
            if (pointsRef.current) {
              pointsRef.current.textContent = `+${Math.round(counter.val)}`;
            }
          },
        },
        '-=0.8'
      );
    }

    return () => {
      tl.kill();
      stars.forEach((s) => s.remove());
    };
  }, [result, hidePoints]);

  const badge = result.badgeEarned as any;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      {/* Star particles layer */}
      <div
        ref={starsRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      />

      {/* Phase 1-3: Wiggling chest */}
      <div
        ref={chestRef}
        className="absolute flex flex-col items-center gap-4"
      >
        <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-lab-gold/30 via-lab-primary/20 to-lab-gold/30 border-2 border-lab-gold/50 flex items-center justify-center">
          <span className="text-6xl">🎁</span>
        </div>
      </div>

      {/* Phase 4: Casino slot spin */}
      <div
        ref={slotRef}
        className="absolute flex flex-col items-center gap-2"
        style={{ opacity: 0 }}
      >
        <div className="w-32 h-32 rounded-xl border-2 border-lab-primary/50 bg-lab-surface flex items-center justify-center overflow-hidden">
          <div className="animate-spin-slow text-6xl">?</div>
        </div>
      </div>

      {/* Phase 5: Result reveal */}
      <div
        ref={resultRef}
        className="relative bg-gradient-to-br from-lab-card via-lab-surface to-lab-card border-2 border-lab-primary rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
        style={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-lab-primary via-lab-gold to-lab-secondary opacity-20 blur-xl" />

        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-lab-gold via-lab-primary to-lab-secondary bg-clip-text text-transparent">
            Insignia obtenida
          </h3>

          {/* Points */}
          {!hidePoints && (
            <div className="my-6">
              <span
                ref={pointsRef}
                className="text-7xl font-black text-lab-gold"
              >
                +0
              </span>
              <p className="text-lab-text-muted text-xs mt-1">puntos ganados</p>
            </div>
          )}

          {/* Badge earned */}
          {badge && (
            <div className="my-6 p-4 rounded-2xl bg-lab-bg/50 border border-lab-gold/30">
              <p className="text-xs text-lab-gold font-semibold mb-3 uppercase tracking-wider">
                {badge.name || 'Insignia'}
              </p>
              <div className="flex flex-col items-center gap-2">
                <img
                  src={getImageUrl(badge.image || '')}
                  alt={badge.name || 'Badge'}
                  className="w-16 h-16"
                />
                <p className={`font-bold text-lg ${getRarityColor(badge.rarity || 'common')}`}>
                  {badge.name || 'Insignia'}
                </p>
                {badge.description && (
                  <p className="text-xs text-lab-text-muted">
                    {badge.description}
                  </p>
                )}
                <span className={`text-xs capitalize px-2 py-0.5 rounded-full border ${
                  badge.rarity === 'legendary' ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
                  : badge.rarity === 'epic' ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                  : badge.rarity === 'rare' ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                  : 'border-gray-500/40 bg-gray-500/10 text-gray-400'
                }`}>
                  {RARITY_LABELS[badge.rarity] || badge.rarity || 'Comun'}
                </span>
              </div>
            </div>
          )}

          {/* No badge */}
          {!badge && (
            <div className="my-6 p-4 rounded-2xl bg-lab-bg/50 border border-lab-border">
              <p className="text-lab-text-muted text-sm">
                No obtuviste insignia esta vez
              </p>
            </div>
          )}

          {/* Course completed */}
          {result.courseCompleted && (
            <div className="my-4 p-3 rounded-xl bg-lab-secondary/10 border border-lab-secondary/30">
              <p className="text-lab-secondary font-bold">Curso completado</p>
            </div>
          )}

          {phase === 'revealed' && (
            <button onClick={onClose} className="btn-primary w-full mt-4">
              Coleccionar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardBox;
