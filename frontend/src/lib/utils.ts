import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

/**
 * 날짜 포맷팅
 */
export function formatDate(date: string | Date, format = 'YYYY년 MM월 DD일'): string {
  return dayjs(date).format(format);
}

/**
 * 시간 포맷팅
 */
export function formatTime(time: string): string {
  return dayjs(`2000-01-01 ${time}`).format('HH:mm');
}

/**
 * 날짜+시간 포맷팅
 */
export function formatDateTime(date: string, time?: string): string {
  if (time) {
    return dayjs(`${date} ${time}`).format('YYYY년 MM월 DD일 HH:mm');
  }
  return dayjs(date).format('YYYY년 MM월 DD일 HH:mm');
}

/**
 * 상대적 시간 표시 (n분 전, n시간 전 등)
 */
export function formatRelativeTime(date: string | Date): string {
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = now.diff(target, 'hour');
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = now.diff(target, 'day');
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatDate(date, 'MM월 DD일');
}

/**
 * 가격 포맷팅 (원화)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}

/**
 * 전화번호 포맷팅
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return phone;
}

/**
 * 평점 별점 텍스트
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * 클래스명 합치기
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
