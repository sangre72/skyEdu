export type UserRole = 'customer' | 'companion' | 'admin';

// 백엔드 응답과 일치하는 snake_case 타입
export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// 동행인 프로필
export interface CompanionProfile {
  id: string;
  user_id: string;
  introduction: string; // 한줄 소개
  service_areas: string[]; // 서비스 가능 지역 (시/구)
  certifications: Certification[]; // 자격증 목록
  rating: number; // 평균 평점
  total_services: number; // 총 서비스 건수
  is_available: boolean; // 현재 활동 가능 여부
  created_at: string;
  updated_at: string;
}

export interface Certification {
  type: 'nurse' | 'care_worker' | 'social_worker' | 'nurse_aide' | 'other';
  name: string;
  is_verified: boolean;
}

// 휴대폰 인증번호 발송 요청
export interface PhoneVerifySendRequest {
  phone: string;
}

// 휴대폰 인증번호 확인 요청
export interface PhoneVerifyConfirmRequest {
  phone: string;
  code: string;
}

// 휴대폰 인증 응답
export interface PhoneVerifyResponse {
  success: boolean;
  message: string;
  verification_token?: string;
}

// 회원가입 요청 (휴대폰 인증 후)
export interface RegisterRequest {
  phone: string;
  name: string;
  role: 'customer' | 'companion';
  verification_token: string; // 인증 완료 토큰
}

// 로그인 요청 (휴대폰 인증)
export interface LoginRequest {
  phone: string;
  code: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

// 고객 프로필 (선택 정보)
export interface CustomerProfile {
  id: string;
  user_id: string;
  birth_year?: number;
  address?: string;
  emergency_contact?: string;
  medical_notes?: string;
}

// 사용자 프로필 (DB 모델과 일치)
export interface UserProfile {
  id: string;
  user_id: string;
  birth_date?: string;
  address?: string;
  emergency_contact?: string;
  medical_notes?: string;
}

// 프로필 포함 사용자 응답
export interface UserWithProfile extends User {
  profile?: UserProfile | null;
}

// 사용자 정보 수정 요청
export interface UserUpdateRequest {
  name?: string;
  email?: string;
  birth_date?: string;
  address?: string;
  emergency_contact?: string;
}
