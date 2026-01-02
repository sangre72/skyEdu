/**
 * 공유 타입 모듈
 *
 * 사용 예시:
 * import type { User, Reservation, Province } from '@/types';
 */

// 사용자/인증
export * from './user';

// 예약
export * from './reservation';

// 동행인(매니저)
export * from './manager';

// 지역
export * from './region';

// 프로모션
export * from './promotion';

// 게시판
export * from './board';

// ============================================
// API 공통 타입
// ============================================

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
