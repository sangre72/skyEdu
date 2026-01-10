import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';

/**
 * 특정 기능의 활성화 여부를 확인하는 훅
 * @param featureKey 기능 키 (예: 'feature.auth.registration')
 * @returns 기능 활성화 여부
 */
export function useFeature(featureKey: string): boolean {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(featureKey);
}

/**
 * 여러 기능의 활성화 여부를 확인하는 훅
 * @param featureKeys 기능 키 배열
 * @returns 각 기능의 활성화 여부 객체
 */
export function useFeatures(featureKeys: string[]): Record<string, boolean> {
  const { isFeatureEnabled } = useFeatureFlags();
  const result: Record<string, boolean> = {};
  featureKeys.forEach((key) => {
    result[key] = isFeatureEnabled(key);
  });
  return result;
}

/**
 * 시스템 점검 모드 여부를 확인하는 훅
 */
export function useMaintenanceMode(): boolean {
  return useFeature('system.maintenance_mode');
}

/**
 * 로그인 기능 활성화 여부
 */
export function useLoginEnabled(): boolean {
  return useFeature('feature.auth.login');
}

/**
 * 회원가입 기능 활성화 여부
 */
export function useRegistrationEnabled(): boolean {
  return useFeature('feature.auth.registration');
}

/**
 * 휴대폰 인증 기능 활성화 여부
 */
export function usePhoneVerificationEnabled(): boolean {
  return useFeature('feature.auth.phone_verification');
}

/**
 * 카카오 로그인 기능 활성화 여부
 */
export function useKakaoLoginEnabled(): boolean {
  return useFeature('feature.auth.kakao_login');
}

/**
 * 비밀번호 재설정 기능 활성화 여부
 */
export function usePasswordResetEnabled(): boolean {
  return useFeature('feature.auth.password_reset');
}

/**
 * 예약 생성 기능 활성화 여부
 */
export function useReservationCreateEnabled(): boolean {
  return useFeature('feature.reservation.create');
}

/**
 * 예약 취소 기능 활성화 여부
 */
export function useReservationCancelEnabled(): boolean {
  return useFeature('feature.reservation.cancel');
}

/**
 * 긴급 예약 기능 활성화 여부
 */
export function useUrgentReservationEnabled(): boolean {
  return useFeature('feature.reservation.urgent');
}

/**
 * 결제 기능 활성화 여부
 */
export function usePaymentEnabled(): boolean {
  return useFeature('feature.payment.enabled');
}

/**
 * 환불 기능 활성화 여부
 */
export function useRefundEnabled(): boolean {
  return useFeature('feature.payment.refund');
}

/**
 * 매니저 등록 기능 활성화 여부
 */
export function useManagerRegistrationEnabled(): boolean {
  return useFeature('feature.manager.registration');
}

/**
 * 프로모션 기능 활성화 여부
 */
export function usePromotionEnabled(): boolean {
  return useFeature('feature.promotion.enabled');
}

/**
 * 리뷰 작성 기능 활성화 여부
 */
export function useReviewWriteEnabled(): boolean {
  return useFeature('feature.review.write');
}

/**
 * 게시판 기능 활성화 여부
 */
export function useBoardEnabled(): boolean {
  return useFeature('feature.board.enabled');
}
