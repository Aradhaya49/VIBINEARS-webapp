import { formatDistanceToNow, format } from 'date-fns';

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

export const formatTimeAgo = (dateStr: string): string => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
};

export const formatTime = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'HH:mm');
  } catch {
    return '';
  }
};

export const formatDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
};

export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

export const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'BRONZE': return 'text-amber-600';
    case 'SILVER': return 'text-gray-300';
    case 'GOLD': return 'text-yellow-400';
    case 'PLATINUM': return 'text-cyan-300';
    default: return 'text-white';
  }
};

export const getTierGradient = (tier: string): string => {
  switch (tier) {
    case 'BRONZE': return 'from-amber-700 to-amber-500';
    case 'SILVER': return 'from-gray-400 to-gray-200';
    case 'GOLD': return 'from-yellow-500 to-amber-400';
    case 'PLATINUM': return 'from-cyan-400 to-blue-300';
    default: return 'from-purple-500 to-blue-500';
  }
};

export const getTierPoints = (tier: string): { current: number; next: number; label: string } => {
  switch (tier) {
    case 'BRONZE': return { current: 0, next: 500, label: 'Silver' };
    case 'SILVER': return { current: 500, next: 2000, label: 'Gold' };
    case 'GOLD': return { current: 2000, next: 5000, label: 'Platinum' };
    case 'PLATINUM': return { current: 5000, next: 5000, label: 'Max' };
    default: return { current: 0, next: 500, label: 'Silver' };
  }
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
