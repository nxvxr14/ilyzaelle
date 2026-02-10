const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:2525/api';

export const getImageUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}/api${path}`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPoints = (points: number): string => {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points.toString();
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'text-gray-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
};

export const getRarityBg = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-500/20 border-gray-500/30';
    case 'rare': return 'bg-blue-500/20 border-blue-500/30';
    case 'epic': return 'bg-purple-500/20 border-purple-500/30';
    case 'legendary': return 'bg-yellow-500/20 border-yellow-500/30';
    default: return 'bg-gray-500/20 border-gray-500/30';
  }
};
