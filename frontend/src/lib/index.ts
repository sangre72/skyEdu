/**
 * 라이브러리 모듈
 *
 * 사용 예시:
 * import { api, formatPrice, SERVICE_PRICES } from '@/lib';
 */

// API 클라이언트
export { api } from './api';

// 유틸리티 함수
export {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatPrice,
  formatPhoneNumber,
  formatRating,
  cn,
} from './utils';

// 상수
export {
  // API
  API_URL,
  // 가격
  SERVICE_PRICES,
  EXTRA_CHARGES,
  FEE_STRUCTURE,
  // 지역 (정적 - 동적 로딩은 useRegions 사용)
  PROVINCES,
  DISTRICTS,
  SERVICE_AREAS,
  // 자격증
  CERTIFICATION_TYPES,
  // 페이지네이션
  DEFAULT_PAGE_SIZE,
  // 예약
  RESERVATION_MIN_HOURS,
  RESERVATION_MAX_HOURS,
  CANCELLATION_POLICY,
  // 서비스
  SERVICE_HOURS,
  CUSTOMER_SERVICE,
} from './constants';

// 위치 관련
export { getLocationByIP, getBrowserLocation, reverseGeocode } from './geolocation';

// Mock 데이터 (개발용)
export * from './mockData';
