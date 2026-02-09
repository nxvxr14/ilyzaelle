export const calculateModuleProgress = (
  currentIndex: number,
  totalCards: number
): number => {
  if (totalCards === 0) return 0;
  return Math.round((currentIndex / totalCards) * 100);
};

export const formatPoints = (points: number): string => {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points.toString();
};
