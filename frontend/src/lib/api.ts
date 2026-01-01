import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/authStore';
import type {
  AuthResponse,
  CreateReservationRequest,
  LoginRequest,
  Manager,
  ManagerListResponse,
  PhoneVerifyConfirmRequest,
  PhoneVerifyResponse,
  PhoneVerifySendRequest,
  RegisterRequest,
  Reservation,
  ReservationListResponse,
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
  }): Promise<ManagerListResponse> {
    const response = await this.client.get<ManagerListResponse>('/managers', { params });
    return response.data;
  }

  async getManager(id: string): Promise<Manager> {
    const response = await this.client.get<Manager>(`/managers/${id}`);
    return response.data;
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
}

export const api = new ApiClient();
