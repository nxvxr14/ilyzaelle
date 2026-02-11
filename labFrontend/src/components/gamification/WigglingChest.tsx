import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface WigglingChestProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  subtitle?: string;
}

const WigglingChest = ({
  onClick,
  disabled = false,
  label = 'Abrir Caja de Recompensas',
  subtitle = 'Toca para reclamar tu recompensa',
}: WigglingChestProps) => {
  const chestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chestRef.current;
    if (!el) return;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
    tl.to(el, { rotation: -5, duration: 0.1, ease: 'power1.inOut' })
      .to(el, { rotation: 5, duration: 0.1, ease: 'power1.inOut' })
      .to(el, { rotation: -4, duration: 0.1, ease: 'power1.inOut' })
      .to(el, { rotation: 4, duration: 0.08, ease: 'power1.inOut' })
      .to(el, { rotation: 0, duration: 0.15, ease: 'power2.out' });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="card-hover flex items-center gap-3 w-full text-left"
    >
      <div
        ref={chestRef}
        className="w-14 h-14 rounded-xl bg-gradient-to-br from-lab-gold/20 via-lab-primary/10 to-lab-gold/20 border border-lab-gold/30 flex items-center justify-center flex-shrink-0"
      >
        <span className="text-2xl">🎁</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate text-lab-gold">
          {disabled ? 'Abriendo...' : label}
        </p>
        <p className="text-xs text-lab-text-muted mt-0.5">
          {subtitle}
        </p>
      </div>
    </button>
  );
};

export default WigglingChest;
