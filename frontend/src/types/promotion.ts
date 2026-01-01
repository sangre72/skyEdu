/**
 * 프로모션/할인 타입
 */

// 할인 유형
export type DiscountType = 'percent' | 'fixed';

// 할인 대상
export type DiscountTarget =
  | 'all'              // 전체
  | 'new_customer'     // 신규 고객
  | 'returning'        // 재방문 고객
  | 'specific_service'; // 특정 서비스

// 프로모션 상태
export type PromotionStatus = 'active' | 'inactive' | 'expired';

// 프로모션 정보
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number; // percent: 0-100, fixed: 원 단위
  targetType: DiscountTarget;
  targetServiceType?: string; // specific_service인 경우
  startDate: string;
  endDate: string;
  maxUsage?: number; // 최대 사용 횟수
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 프로모션 생성 요청
export interface CreatePromotionRequest {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  targetType: DiscountTarget;
  targetServiceType?: string;
  startDate: string;
  endDate: string;
  maxUsage?: number;
}

// 프로모션 라벨
export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  percent: '정률 할인 (%)',
  fixed: '정액 할인 (원)',
};

export const DISCOUNT_TARGET_LABELS: Record<DiscountTarget, string> = {
  all: '전체',
  new_customer: '신규 고객',
  returning: '재방문 고객',
  specific_service: '특정 서비스',
};
