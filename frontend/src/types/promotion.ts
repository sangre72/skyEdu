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
  discount_type: DiscountType;
  discount_value: number; // percent: 0-100, fixed: 원 단위
  target_type: DiscountTarget;
  target_service_type?: string; // specific_service인 경우
  start_date: string;
  end_date: string;
  max_usage?: number; // 최대 사용 횟수
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 프로모션 생성 요청
export interface CreatePromotionRequest {
  name: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  target_type: DiscountTarget;
  target_service_type?: string;
  start_date: string;
  end_date: string;
  max_usage?: number;
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
