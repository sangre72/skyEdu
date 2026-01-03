export type ServiceType = 'full_care' | 'hospital_care' | 'special_care';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Reservation {
  id: string;
  user_id: string;
  manager_id?: string;
  service_type: ServiceType;
  scheduled_date: string;
  scheduled_time: string;
  estimated_hours: number;
  hospital_name: string;
  hospital_address: string;
  hospital_department?: string;
  pickup_address?: string;
  symptoms?: string;
  special_requests?: string;
  status: ReservationStatus;
  price: number;
  created_at: string;
  updated_at: string;
  // 조회 시 추가 정보 (매니저가 조회할 때)
  user_name?: string;
  user_phone?: string;
  manager_name?: string;
}

export interface CreateReservationRequest {
  service_type: ServiceType;
  scheduled_date: string;
  scheduled_time: string;
  estimated_hours: number;
  hospital_name: string;
  hospital_address: string;
  hospital_department?: string;
  pickup_address?: string;
  symptoms?: string;
  special_requests?: string;
  manager_id?: string;
}

export interface ReservationListResponse {
  items: Reservation[];
  total: number;
  page: number;
  limit: number;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  full_care: '풀케어 (PRO)',
  hospital_care: '병원케어 (BASIC)',
  special_care: '특화케어 (SPECIAL)',
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: '대기중',
  confirmed: '확정',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소됨',
};
