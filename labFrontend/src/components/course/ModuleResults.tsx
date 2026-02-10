import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Module, Progress, CardBlock, QuizBlock } from '@/types';
import {
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

interface QuizResultItem {
  question: string;
  correct: boolean;
  points: number;
}

interface ModuleResultsProps {
  mod: Module;
  progress: Progress;
  onContinue: () => void;
}

/**
 * Collects all quiz results from the module's cards progress.
 * For each card, iterates its blocks to find quiz blocks, then
 * checks quizCorrect from the card progress entry.
 */
const collectQuizResults = (mod: Module, progress: Progress): QuizResultItem[] => {
  const moduleId = mod._id;
  const mp = progress.modulesProgress.find(
    (m) => m.module === moduleId || (m.module as any)?._id === moduleId
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
      results.push({
        question: quizBlock.question,
        correct: isCorrect,
        points: quizBlock.points,
      });
    });
  }

  return results;
};

const ModuleResults = ({ mod, progress, onContinue }: ModuleResultsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLSpanElement>(null);
  const bienHechoRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [animDone, setAnimDone] = useState(false);

  const quizResults = collectQuizResults(mod, progress);
  const correctCount = quizResults.filter((r) => r.correct).length;
  const totalQuizzes = quizResults.length;
  const totalPoints = quizResults.reduce(
    (sum, r) => sum + (r.correct ? r.points : 0),
    0
  );

  useEffect(() => {
    const container = containerRef.current;
    const pointsEl = pointsRef.current;
    const bienHecho = bienHechoRef.current;
    const btn = buttonRef.current;
    if (!container || !pointsEl || !bienHecho || !btn) return;

    const tl = gsap.timeline();

    // Fade in the container
    tl.fromTo(container, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });

    // Animate points counter from 0 to totalPoints
    const counter = { val: 0 };
    tl.to(counter, {
      val: totalPoints,
      duration: 1.5,
      ease: 'power1.out',
      onUpdate: () => {
        pointsEl.textContent = `+${Math.round(counter.val)}`;
      },
    }, '+=0.3');

    // Show "Bien hecho!" after counter finishes
    tl.fromTo(
      bienHecho,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );

    // Show continue button
    tl.fromTo(
      btn,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3 }
    ).call(() => setAnimDone(true));

    return () => {
      tl.kill();
    };
  }, [totalPoints]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center px-4"
      style={{ opacity: 0 }}
    >
      <div className="card w-full max-w-lg p-6 text-center">
        {/* Title */}
        <h3 className="text-lg font-bold mb-4 text-lab-text">
          Resultados del modulo
        </h3>

        {/* Quiz results list */}
        {totalQuizzes > 0 ? (
          <div className="space-y-2 mb-6 text-left">
            {quizResults.map((result, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-3 rounded-xl bg-lab-bg/50 border border-lab-border"
              >
                {result.correct ? (
                  <CheckCircleIcon className="w-5 h-5 text-lab-secondary flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-lab-accent flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-lab-text">{result.question}</p>
                  <p className={`text-xs mt-0.5 ${
                    result.correct ? 'text-lab-secondary' : 'text-lab-accent'
                  }`}>
                    {result.correct
                      ? `+${result.points} pts`
                      : 'Incorrecta'}
                  </p>
                </div>
              </div>
            ))}

            {/* Summary line */}
            <p className="text-xs text-lab-text-muted text-center pt-2">
              {correctCount} de {totalQuizzes} correctas
            </p>
          </div>
        ) : (
          <p className="text-sm text-lab-text-muted mb-6">
            Este modulo no tenia preguntas
          </p>
        )}

        {/* Points animation */}
        <div className="my-4">
          <span
            ref={pointsRef}
            className="text-4xl font-black text-lab-gold"
          >
            +0
          </span>
          <p className="text-lab-text-muted text-sm mt-1">puntos ganados</p>
        </div>

        {/* Bien hecho! */}
        <p
          ref={bienHechoRef}
          className="text-xl font-bold text-lab-secondary mb-6"
          style={{ opacity: 0 }}
        >
          Bien hecho!
        </p>

        {/* Continue button */}
        <button
          ref={buttonRef}
          onClick={onContinue}
          disabled={!animDone}
          className="btn-primary w-full py-3 text-base font-semibold"
          style={{ opacity: 0 }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default ModuleResults;
