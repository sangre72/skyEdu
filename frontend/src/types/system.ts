/**
 * 시스템 설정 타입
 */

export type FeatureCategory =
  | 'auth'
  | 'reservation'
  | 'payment'
  | 'manager'
  | 'promotion'
  | 'review'
  | 'board'
  | 'notification'
  | 'system';

export interface SystemSetting {
  id: number;
  key: string;
  name: string;
  description?: string;
  category: FeatureCategory;
  value: any;
  defaultValue: any;
  isEnabled: boolean;
  isReadonly: boolean;
  effectiveValue: any;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettingCreate {
  key: string;
  name: string;
  description?: string;
  category: FeatureCategory;
  value?: any;
  defaultValue?: any;
  isEnabled?: boolean;
  isReadonly?: boolean;
}

export interface SystemSettingUpdate {
  name?: string;
  description?: string;
  value?: any;
  isEnabled?: boolean;
}

export interface FeatureFlagUpdate {
  isEnabled: boolean;
}

export interface SystemSettingsBulkUpdate {
  settings: Record<string, any>;
}

export const FEATURE_CATEGORY_LABELS: Record<FeatureCategory, string> = {
  auth: '인증/회원',
  reservation: '예약',
  payment: '결제',
  manager: '매니저',
  promotion: '프로모션',
  review: '리뷰',
  board: '게시판',
  notification: '알림',
  system: '시스템',
};
