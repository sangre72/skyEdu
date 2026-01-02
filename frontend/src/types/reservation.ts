export type ServiceType = 'full_care' | 'hospital_care' | 'special_care';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Reservation {
  id: string;
  userId: string;
  managerId?: string;
  serviceType: ServiceType;
  scheduledDate: string;
  scheduledTime: string;
  estimatedHours: number;
  hospitalName: string;
  hospitalAddress: string;
  hospitalDepartment?: string;
  pickupAddress?: string;
  symptoms?: string;
  specialRequests?: string;
  status: ReservationStatus;
  price: number;
  createdAt: string;
  updatedAt: string;
  // 조회 시 추가 정보 (매니저가 조회할 때)
  userName?: string;
  userPhone?: string;
  managerName?: string;
}

export interface CreateReservationRequest {
  serviceType: ServiceType;
  scheduledDate: string;
  scheduledTime: string;
  estimatedHours: number;
  hospitalName: string;
  hospitalAddress: string;
  hospitalDepartment?: string;
  pickupAddress?: string;
  symptoms?: string;
  specialRequests?: string;
  managerId?: string;
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
