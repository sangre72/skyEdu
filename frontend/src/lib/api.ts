import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/authStore';
import type {
  AuthResponse,
  CreatePromotionRequest,
  CreateReservationRequest,
  LoginRequest,
  Manager,
  ManagerCreateRequest,
  ManagerDetail,
  ManagerListResponse,
  ManagerSchedule,
  ManagerUpdateRequest,
  PhoneVerifyConfirmRequest,
  PhoneVerifyResponse,
  PhoneVerifySendRequest,
  Promotion,
  RegisterRequest,
  Reservation,
  ReservationListResponse,
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
  UserUpdateRequest,
  UserWithProfile,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - Handle token refresh & extract error message
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<{ detail?: string }>) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            return this.client.request(originalRequest);
          }
          useAuthStore.getState().logout();
        }

        // 백엔드 에러 메시지 추출
        const errorMessage = error.response?.data?.detail || error.message || '요청 처리 중 오류가 발생했습니다.';
        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) return false;

      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      useAuthStore.getState().setTokens(
        response.data.access_token,
        response.data.refresh_token
      );
      return true;
    } catch {
      return false;
    }
  }

  // ============ Auth ============
  async sendVerificationCode(data: PhoneVerifySendRequest): Promise<PhoneVerifyResponse> {
    const response = await this.client.post<PhoneVerifyResponse>('/auth/send-code', data);
    return response.data;
  }

  async verifyCode(data: PhoneVerifyConfirmRequest): Promise<PhoneVerifyResponse> {
    const response = await this.client.post<PhoneVerifyResponse>('/auth/verify-code', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  // ============ Reservations ============
  async getReservations(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ReservationListResponse> {
    const response = await this.client.get<ReservationListResponse>('/reservations', { params });
    return response.data;
  }

  async getReservation(id: string): Promise<Reservation> {
    const response = await this.client.get<Reservation>(`/reservations/${id}`);
    return response.data;
  }

  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    const response = await this.client.post<Reservation>('/reservations', data);
    return response.data;
  }

  async cancelReservation(id: string): Promise<void> {
    await this.client.delete(`/reservations/${id}`);
  }

  // ============ Managers ============
  async getManagers(params?: {
    page?: number;
    limit?: number;
    area?: string;
    manager_type?: 'expert' | 'new' | 'volunteer';
    certification?: string;
    sort_by?: 'rating' | 'services' | 'reviews';
  }): Promise<ManagerListResponse> {
    const response = await this.client.get<ManagerListResponse>('/managers', { params });
    return response.data;
  }

  async getManager(id: string): Promise<Manager> {
    const response = await this.client.get<Manager>(`/managers/${id}`);
    return response.data;
  }

  async registerManager(data: ManagerCreateRequest): Promise<Manager> {
    const response = await this.client.post<Manager>('/managers/register', data);
    return response.data;
  }

  async getMyManagerProfile(): Promise<ManagerDetail> {
    const response = await this.client.get<ManagerDetail>('/managers/me');
    return response.data;
  }

  async updateMyManagerProfile(data: ManagerUpdateRequest): Promise<Manager> {
    const response = await this.client.patch<Manager>('/managers/me', {
      introduction: data.introduction,
      certifications: data.certifications,
      available_areas: data.available_areas,
      profile_image: data.profile_image,
      bank_name: data.bank_name,
      bank_account: data.bank_account,
    });
    return response.data;
  }

  // ============ Schedules ============
  async getMySchedules(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ManagerSchedule[]> {
    const response = await this.client.get<ManagerSchedule[]>('/managers/me/schedules', {
      params: {
        start_date: params?.startDate,
        end_date: params?.endDate,
      },
    });
    return response.data;
  }

  async getManagerSchedules(managerId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ManagerSchedule[]> {
    const response = await this.client.get<ManagerSchedule[]>(`/managers/${managerId}/schedules`, {
      params: {
        start_date: params?.startDate,
        end_date: params?.endDate,
      },
    });
    return response.data;
  }

  async createSchedule(data: ScheduleCreateRequest): Promise<ManagerSchedule> {
    const response = await this.client.post<ManagerSchedule>('/managers/me/schedules', {
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      is_available: data.is_available,
    });
    return response.data;
  }

  async updateSchedule(scheduleId: string, data: ScheduleUpdateRequest): Promise<ManagerSchedule> {
    const response = await this.client.patch<ManagerSchedule>(`/managers/me/schedules/${scheduleId}`, {
      start_time: data.start_time,
      end_time: data.end_time,
      is_available: data.is_available,
    });
    return response.data;
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    await this.client.delete(`/managers/me/schedules/${scheduleId}`);
  }

  // ============ Users ============
  async getMe(): Promise<UserWithProfile> {
    const response = await this.client.get<UserWithProfile>('/users/me');
    return response.data;
  }

  async updateMe(data: UserUpdateRequest): Promise<UserWithProfile> {
    const response = await this.client.patch<UserWithProfile>('/users/me', data);
    return response.data;
  }

  // ============ Promotions ============
  async getMyPromotions(): Promise<{ items: Promotion[]; total: number }> {
    const response = await this.client.get<{ items: Promotion[]; total: number }>('/promotions/me');
    return response.data;
  }

  async createPromotion(data: CreatePromotionRequest): Promise<Promotion> {
    const response = await this.client.post<Promotion>('/promotions/me', {
      name: data.name,
      description: data.description,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      target_type: data.target_type,
      target_service_type: data.target_service_type,
      start_date: data.start_date,
      end_date: data.end_date,
      max_usage: data.max_usage,
    });
    return response.data;
  }

  async updatePromotion(promotionId: string, data: Partial<CreatePromotionRequest>): Promise<Promotion> {
    const response = await this.client.patch<Promotion>(`/promotions/me/${promotionId}`, {
      name: data.name,
      description: data.description,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      target_type: data.target_type,
      target_service_type: data.target_service_type,
      start_date: data.start_date,
      end_date: data.end_date,
      max_usage: data.max_usage,
    });
    return response.data;
  }

  async deletePromotion(promotionId: string): Promise<void> {
    await this.client.delete(`/promotions/me/${promotionId}`);
  }

  async togglePromotionActive(promotionId: string): Promise<Promotion> {
    const response = await this.client.patch<Promotion>(`/promotions/me/${promotionId}/toggle`);
    return response.data;
  }
}

export const api = new ApiClient();
