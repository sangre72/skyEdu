export type ManagerStatus = 'pending' | 'active' | 'inactive' | 'suspended';

export type ManagerGrade = 'new' | 'regular' | 'premium';

export interface Manager {
  id: string;
  userId: string;
  name?: string;
  phone?: string;
  profileImage?: string;
  status: ManagerStatus;
  grade: ManagerGrade;
  rating: number;
  totalServices: number;
  certifications: string[];
  availableAreas: string[];
  introduction?: string;
  createdAt: string;
  // 상세 조회 시 추가 정보
  reviewsCount?: number;
  avgRating?: number;
}

export interface ManagerSchedule {
  id: string;
  managerId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
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
  availableAreas: string[];
}

export interface ScheduleCreateRequest {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface ScheduleUpdateRequest {
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
}
