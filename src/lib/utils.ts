import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('th-TH').format(num);
}

export function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function getInsuranceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    health: 'ประกันสุขภาพ',
    life: 'ประกันชีวิต',
    car: 'ประกันรถยนต์',
  };
  return labels[type] || type;
}

export function getInsuranceTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    health: '🏥',
    life: '💚',
    car: '🚗',
  };
  return icons[type] || '📋';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getAgeFromBirthdate(birthdate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
}

export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'เมื่อสักครู่';
  } else if (diffMins < 60) {
    return `${diffMins} นาทีที่แล้ว`;
  } else if (diffHours < 24) {
    return `${diffHours} ชั่วโมงที่แล้ว`;
  } else if (diffDays < 7) {
    return `${diffDays} วันที่แล้ว`;
  } else {
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
    });
  }
}
