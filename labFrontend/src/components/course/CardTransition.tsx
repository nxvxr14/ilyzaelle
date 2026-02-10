import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface CardTransitionProps {
  /** Changing this key triggers the animation */
  transitionKey: string;
  children: React.ReactNode;
}

const CardTransition = ({ transitionKey, children }: CardTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    // Y-axis rotation: card flips left-to-right over 2 seconds
    const tl = gsap.timeline();

    tl.set(el, { rotateY: -180, opacity: 0 })
      .to(el, {
        rotateY: 0,
        opacity: 1,
        duration: 2,
        ease: 'power2.out',
      });

    return () => {
      tl.kill();
    };
  }, [transitionKey]);

  return (
    <div style={{ perspective: '1200px' }}>
      <div
        ref={containerRef}
        style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
      >
        {children}
      </div>
    </div>
  );
};

export default CardTransition;
