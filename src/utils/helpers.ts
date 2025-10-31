import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Korean locale
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(d);
}

/**
 * Format time to HH:MM
 */
export function formatTime(time: string): string {
  return time.substring(0, 5);
}

/**
 * Format price to Korean won
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}

/**
 * Calculate average rating
 */
export function calculateAverage(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

/**
 * Get rating color based on score
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-blue-600';
  if (rating >= 3.5) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get badge color based on level
 */
export function getBadgeColor(level: string): string {
  switch (level) {
    case 'LEGEND':
      return 'from-purple-500 to-pink-500';
    case 'PLATINUM':
      return 'from-gray-300 to-gray-400';
    case 'GOLD':
      return 'from-yellow-400 to-yellow-600';
    case 'SILVER':
      return 'from-gray-200 to-gray-300';
    case 'BRONZE':
      return 'from-orange-400 to-orange-600';
    default:
      return 'from-gray-400 to-gray-500';
  }
}
