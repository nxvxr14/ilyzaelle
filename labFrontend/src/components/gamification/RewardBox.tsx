import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { RewardResult } from '@/types';
import { getImageUrl, formatPoints, getRarityColor } from '@/utils/helpers';

interface RewardBoxProps {
  result: RewardResult;
  onClose: () => void;
}

const RewardBox = ({ result, onClose }: RewardBoxProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Create stars
    if (starsRef.current) {
      for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'absolute w-2 h-2 rounded-full';
        star.style.background = ['#fdcb6e', '#6c5ce7', '#00cec9', '#fd79a8', '#fff'][
          Math.floor(Math.random() * 5)
        ] as string;
        star.style.left = '50%';
        star.style.top = '50%';
        starsRef.current.appendChild(star);
      }
    }

    // Animation sequence
    tl
      // Fade in overlay
      .fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      // Box entrance with bounce
      .fromTo(
        boxRef.current,
        { scale: 0, rotation: -10 },
        { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }
      )
      // Box shake/glow effect
      .to(boxRef.current, {
        boxShadow: '0 0 60px rgba(108, 92, 231, 0.8), 0 0 120px rgba(253, 203, 110, 0.4)',
        duration: 0.3,
        yoyo: true,
        repeat: 2,
      })
      // Box opens - explode stars
      .to(boxRef.current, {
        scale: 1.1,
        duration: 0.2,
      })
      .to(
        starsRef.current?.children ? Array.from(starsRef.current.children) : [],
        {
          x: () => (Math.random() - 0.5) * 400,
          y: () => (Math.random() - 0.5) * 400,
          scale: () => Math.random() * 2 + 1,
          opacity: 0,
          duration: 1,
          stagger: 0.02,
          ease: 'power2.out',
        },
        '<'
      )
      // Show content
      .to(boxRef.current, { scale: 1, duration: 0.2 })
      .fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );

    // Animate points counter
    if (pointsRef.current) {
      const counter = { val: 0 };
      tl.to(
        counter,
        {
          val: result.points,
          duration: 1,
          ease: 'power1.out',
          onUpdate: () => {
            if (pointsRef.current) {
              pointsRef.current.textContent = `+${Math.round(counter.val)}`;
            }
          },
        },
        '<'
      );
    }

    return () => {
      tl.kill();
    };
  }, [result]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={starsRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      />

      <div
        ref={boxRef}
        className="relative bg-gradient-to-br from-lab-card via-lab-surface to-lab-card border-2 border-lab-primary rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-lab-primary via-lab-gold to-lab-secondary opacity-20 blur-xl" />

        <div ref={contentRef} className="relative z-10">
          <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-lab-gold via-lab-primary to-lab-secondary bg-clip-text text-transparent">
            Caja de Recompensas
          </h3>

          {/* Points */}
          <div className="my-6">
            <span
              ref={pointsRef}
              className="text-5xl font-black text-lab-gold"
            >
              +0
            </span>
            <p className="text-lab-text-muted text-sm mt-1">puntos ganados</p>
          </div>

          {/* Badge earned */}
          {result.badgeEarned && (
            <div className="my-6 p-4 rounded-2xl bg-lab-bg/50 border border-lab-gold/30">
              <p className="text-xs text-lab-gold font-semibold mb-2 uppercase tracking-wider">
                Insignia obtenida
              </p>
              <div className="flex items-center justify-center gap-3">
                <img
                  src={getImageUrl((result.badgeEarned as any).image || '')}
                  alt={(result.badgeEarned as any).name || 'Badge'}
                  className="w-10 h-10"
                />
                <div className="text-left">
                  <p className={`font-bold ${getRarityColor((result.badgeEarned as any).rarity || 'common')}`}>
                    {(result.badgeEarned as any).name || 'Insignia'}
                  </p>
                  <p className="text-xs text-lab-text-muted capitalize">
                    {(result.badgeEarned as any).rarity || 'common'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Course completed */}
          {result.courseCompleted && (
            <div className="my-4 p-3 rounded-xl bg-lab-secondary/10 border border-lab-secondary/30">
              <p className="text-lab-secondary font-bold">Curso completado</p>
            </div>
          )}

          <button onClick={onClose} className="btn-primary w-full mt-4">
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardBox;
