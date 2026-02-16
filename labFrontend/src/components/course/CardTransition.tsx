import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface CardTransitionProps {
  /** Changing this key triggers the animation */
  transitionKey: string;
  children: React.ReactNode;
}

/**
 * Casino-style card transition:
 * - A giant "?" placeholder covers the card during the spin
 * - Multiple rapid scaleX flips that start slow and accelerate
 * - At the end the "?" fades and the real card is revealed
 * - Total duration ~1.6s
 */
const CardTransition = ({ transitionKey, children }: CardTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const el = containerRef.current;
    const overlay = overlayRef.current;
    if (!el || !overlay) return;

    setAnimating(true);
    const tl = gsap.timeline({
      onComplete: () => setAnimating(false),
    });

    // Show "?" overlay and prepare container
    tl.set(overlay, { opacity: 1, visibility: 'visible' })
      .set(el, { scaleX: 0.3, scaleY: 0.92, opacity: 0.6 });

    // Spins: start slow, accelerate
    // Spin 1: slow
    tl.to(el, { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.22, ease: 'power1.in' })
      .to(el, { scaleX: 0, scaleY: 0.92, duration: 0.20, ease: 'power1.in' })
      // Spin 2: medium
      .to(el, { scaleX: 1, scaleY: 1, duration: 0.16, ease: 'power1.inOut' })
      .to(el, { scaleX: 0, scaleY: 0.90, duration: 0.14, ease: 'power2.in' })
      // Spin 3: faster
      .to(el, { scaleX: 1, scaleY: 1, duration: 0.10, ease: 'power2.inOut' })
      .to(el, { scaleX: 0, scaleY: 0.88, duration: 0.08, ease: 'power2.in' })
      // Spin 4: fastest
      .to(el, { scaleX: 1, scaleY: 1, duration: 0.07, ease: 'power3.inOut' })
      .to(el, { scaleX: 0, scaleY: 0.86, duration: 0.06, ease: 'power3.in' });

    // Final reveal: hide "?", expand card with bounce
    tl.to(overlay, { opacity: 0, duration: 0.15, ease: 'power2.out' })
      .to(el, {
        scaleX: 1.04,
        scaleY: 1.01,
        duration: 0.22,
        ease: 'back.out(2.5)',
      }, '<')
      .set(overlay, { visibility: 'hidden' })
      .to(el, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.18,
        ease: 'power2.out',
      });

    return () => {
      tl.kill();
      setAnimating(false);
    };
  }, [transitionKey]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div
        ref={containerRef}
        className="flex-1 flex flex-col min-h-0 relative"
      >
        {children}

        {/* "?" overlay — spins with the card, hides real content during animation */}
        <div
          ref={overlayRef}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-lab-card border border-lab-border pointer-events-none"
          style={{ visibility: animating ? 'visible' : 'hidden' }}
        >
          <span className="text-8xl font-bold text-lab-primary/60 select-none">?</span>
        </div>
      </div>
    </div>
  );
};

export default CardTransition;
