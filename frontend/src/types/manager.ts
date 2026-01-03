export type ManagerStatus = 'pending' | 'active' | 'inactive' | 'suspended';

export type ManagerGrade = 'new' | 'regular' | 'premium';

export interface Manager {
  id: string;
  user_id: string;
  name?: string;
  phone?: string;
  profile_image?: string;
  status: ManagerStatus;
  grade: ManagerGrade;
  rating: number;
  total_services: number;
  certifications: string[];
  available_areas: string[];
  introduction?: string;
  is_volunteer: boolean; // 자원봉사자 여부 (봉사료 0원)
  created_at: string;
  // 상세 조회 시 추가 정보
  reviews_count?: number;
  avg_rating?: number;
}

export interface ManagerSchedule {
  id: string;
  manager_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface ManagerListResponse {
  items: Manager[];
  total: number;
  page: number;
  limit: number;
}

export const MANAGER_STATUS_LABELS: Record<ManagerStatus, string> = {
  pending: '승인대기',
  active: '활동중',
  inactive: '비활성',
  suspended: '정지',
};

export const MANAGER_GRADE_LABELS: Record<ManagerGrade, string> = {
  new: '신규',
  regular: '일반',
  premium: '우수',
};

export interface ManagerCreateRequest {
  introduction: string;
  certifications: string[];
  available_areas: string[];
  is_volunteer?: boolean;
}

export interface ScheduleCreateRequest {
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface ScheduleUpdateRequest {
  start_time?: string;
  end_time?: string;
  is_available?: boolean;
}

export interface ManagerUpdateRequest {
  introduction?: string;
  certifications?: string[];
  available_areas?: string[];
  profile_image?: string;
  bank_name?: string;
  bank_account?: string;
  is_volunteer?: boolean;
}

export interface ManagerDetail extends Manager {
  reviews_count: number;
  avg_rating: number;
}
