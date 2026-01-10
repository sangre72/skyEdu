import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { useAuthStore } from '@/stores/authStore';
import { findUserByPhone } from '@/lib/mockData';
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
  Menu,
  MenuFormData,
  MenuListResponse,
  MenuMoveRequest,
  MenuReorderRequest,
  MenuTreeNode,
  PhoneVerifyConfirmRequest,
  PhoneVerifyResponse,
  PhoneVerifySendRequest,
  Promotion,
  RegisterRequest,
  Reservation,
  ReservationListResponse,
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
  SystemSetting,
  SystemSettingUpdate,
  UserUpdateRequest,
  UserWithProfile,
  UserGroup,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export interface ApiClientInterface {
  // Auth
  sendVerificationCode(data: PhoneVerifySendRequest): Promise<PhoneVerifyResponse>;
  verifyCode(data: PhoneVerifyConfirmRequest): Promise<PhoneVerifyResponse>;
  login(data: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  logout(): Promise<void>;

  // Reservations
  getReservations(params?: { page?: number; limit?: number; status?: string }): Promise<ReservationListResponse>;
  getReservation(id: string): Promise<Reservation>;
  createReservation(data: CreateReservationRequest): Promise<Reservation>;
  cancelReservation(id: string): Promise<void>;

  // Managers
  getManagers(params?: {
    page?: number;
    limit?: number;
    area?: string;
    manager_type?: 'expert' | 'new' | 'volunteer';
    certification?: string;
    sort_by?: 'rating' | 'services' | 'reviews';
  }): Promise<ManagerListResponse>;
  getManager(id: string): Promise<Manager>;
  registerManager(data: ManagerCreateRequest): Promise<Manager>;
  getMyManagerProfile(): Promise<ManagerDetail>;
  updateMyManagerProfile(data: ManagerUpdateRequest): Promise<Manager>;

  // Schedules
  getMySchedules(params?: { startDate?: string; endDate?: string }): Promise<ManagerSchedule[]>;
  getManagerSchedules(managerId: string, params?: { startDate?: string; endDate?: string }): Promise<ManagerSchedule[]>;
  createSchedule(data: ScheduleCreateRequest): Promise<ManagerSchedule>;
  updateSchedule(scheduleId: string, data: ScheduleUpdateRequest): Promise<ManagerSchedule>;
  deleteSchedule(scheduleId: string): Promise<void>;

  // Users
  getMe(): Promise<UserWithProfile>;
  updateMe(data: UserUpdateRequest): Promise<UserWithProfile>;
  getUsers(params?: { page?: number; limit?: number; role?: string; is_active?: boolean }): Promise<UserWithProfile[]>;
  getUser(id: string): Promise<UserWithProfile>;
  updateUserRole(id: string, role: string): Promise<UserWithProfile>;
  activateUser(id: string): Promise<UserWithProfile>;
  deleteUser(id: string): Promise<void>;

  // User Groups
  getUserGroups(): Promise<UserGroup[]>;
  createUserGroup(data: { name: string; description?: string }): Promise<UserGroup>;
  updateUserGroup(id: string, data: { name?: string; description?: string; is_active?: boolean }): Promise<UserGroup>;
  deleteUserGroup(id: string): Promise<void>;
  assignUserGroup(userId: string, groupId: string | null): Promise<UserWithProfile>;

  // Promotions
  getMyPromotions(): Promise<{ items: Promotion[]; total: number }>;
  createPromotion(data: CreatePromotionRequest): Promise<Promotion>;
  updatePromotion(promotionId: string, data: Partial<CreatePromotionRequest>): Promise<Promotion>;
  deletePromotion(promotionId: string): Promise<void>;
  togglePromotionActive(promotionId: string): Promise<Promotion>;

  // Admin - System Settings
  getSystemSettings(params?: { category?: string }): Promise<SystemSetting[]>;
  getSystemSetting(key: string): Promise<SystemSetting>;
  updateSystemSetting(key: string, data: SystemSettingUpdate): Promise<SystemSetting>;
  toggleSystemSetting(key: string, isEnabled: boolean): Promise<SystemSetting>;
  bulkUpdateSystemSettings(settings: Record<string, any>): Promise<SystemSetting[]>;
  initializeSystemSettings(): Promise<SystemSetting[]>;

  // Admin - Menu Management
  getMenus(params?: { menu_type?: string; parent_id?: string; include_deleted?: boolean }): Promise<MenuListResponse>;
  getMenusTree(params?: { menu_type?: string }): Promise<MenuTreeNode[]>;
  getMenu(menuId: string): Promise<Menu>;
  createMenu(data: MenuFormData): Promise<Menu>;
  updateMenu(menuId: string, data: Partial<MenuFormData>): Promise<Menu>;
  deleteMenu(menuId: string, hardDelete?: boolean): Promise<void>;
  moveMenu(menuId: string, data: MenuMoveRequest): Promise<Menu>;
  reorderMenus(data: MenuReorderRequest): Promise<{ message: string; count: number }>;

  // Generic methods for admin endpoints
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
}

class RealApiClient implements ApiClientInterface {
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

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
  }): Promise<UserWithProfile[]> {
    const response = await this.client.get<UserWithProfile[]>('/users/', { params });
    return response.data;
  }

  async getUser(id: string): Promise<UserWithProfile> {
    const response = await this.client.get<UserWithProfile>(`/users/${id}`);
    return response.data;
  }

  async updateUserRole(id: string, role: string): Promise<UserWithProfile> {
    const response = await this.client.patch<UserWithProfile>(`/users/${id}/role`, null, {
      params: { role },
    });
    return response.data;
  }

  async activateUser(id: string): Promise<UserWithProfile> {
    const response = await this.client.patch<UserWithProfile>(`/users/${id}/activate`);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }

  // ============ User Groups ============
  async getUserGroups(): Promise<UserGroup[]> {
    const response = await this.client.get<UserGroup[]>('/user-groups');
    return response.data;
  }

  async createUserGroup(data: { name: string; description?: string }): Promise<UserGroup> {
    const response = await this.client.post<UserGroup>('/user-groups', data);
    return response.data;
  }

  async updateUserGroup(
    id: string,
    data: { name?: string; description?: string; is_active?: boolean }
  ): Promise<UserGroup> {
    const response = await this.client.patch<UserGroup>(`/user-groups/${id}`, data);
    return response.data;
  }

  async deleteUserGroup(id: string): Promise<void> {
    await this.client.delete(`/user-groups/${id}`);
  }

  async assignUserGroup(userId: string, groupId: string | null): Promise<UserWithProfile> {
    const response = await this.client.patch<UserWithProfile>(`/users/${userId}/group`, {
      group_id: groupId,
    });
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

  // ============ Admin - System Settings ============
  async getSystemSettings(params?: { category?: string }): Promise<SystemSetting[]> {
    const response = await this.client.get<SystemSetting[]>('/admin/settings', { params });
    return response.data;
  }

  async getSystemSetting(key: string): Promise<SystemSetting> {
    const response = await this.client.get<SystemSetting>(`/admin/settings/${key}`);
    return response.data;
  }

  async updateSystemSetting(key: string, data: SystemSettingUpdate): Promise<SystemSetting> {
    const response = await this.client.patch<SystemSetting>(`/admin/settings/${key}`, data);
    return response.data;
  }

  async toggleSystemSetting(key: string, isEnabled: boolean): Promise<SystemSetting> {
    const response = await this.client.patch<SystemSetting>(`/admin/settings/${key}/toggle`, {
      is_enabled: isEnabled,
    });
    return response.data;
  }

  async bulkUpdateSystemSettings(settings: Record<string, any>): Promise<SystemSetting[]> {
    const response = await this.client.post<SystemSetting[]>('/admin/settings/bulk-update', {
      settings,
    });
    return response.data;
  }

  async initializeSystemSettings(): Promise<SystemSetting[]> {
    const response = await this.client.post<SystemSetting[]>('/admin/settings/initialize');
    return response.data;
  }

  // ============ Admin - Menu Management ============
  async getMenus(params?: {
    menu_type?: string;
    parent_id?: string;
    include_deleted?: boolean;
  }): Promise<MenuListResponse> {
    const response = await this.client.get<MenuListResponse>('/menus', { params });
    return response.data;
  }

  async getMenusTree(params?: { menu_type?: string }): Promise<MenuTreeNode[]> {
    const response = await this.client.get<MenuTreeNode[]>('/menus/tree', { params });
    return response.data;
  }

  async getMenu(menuId: string): Promise<Menu> {
    const response = await this.client.get<Menu>(`/menus/${menuId}`);
    return response.data;
  }

  async createMenu(data: MenuFormData): Promise<Menu> {
    const response = await this.client.post<Menu>('/menus', data);
    return response.data;
  }

  async updateMenu(menuId: string, data: Partial<MenuFormData>): Promise<Menu> {
    const response = await this.client.patch<Menu>(`/menus/${menuId}`, data);
    return response.data;
  }

  async deleteMenu(menuId: string, hardDelete = false): Promise<void> {
    await this.client.delete(`/menus/${menuId}`, {
      params: { hard_delete: hardDelete },
    });
  }

  async moveMenu(menuId: string, data: MenuMoveRequest): Promise<Menu> {
    const response = await this.client.put<Menu>(`/menus/${menuId}/move`, data);
    return response.data;
  }

  async reorderMenus(data: MenuReorderRequest): Promise<{ message: string; count: number }> {
    const response = await this.client.put<{ message: string; count: number }>(
      '/menus/reorder',
      data
    );
    return response.data;
  }

  // ============ Generic Methods ============
  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

class MockApiClient implements ApiClientInterface {
  // ============ Auth ============
  async sendVerificationCode(data: PhoneVerifySendRequest): Promise<PhoneVerifyResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user = findUserByPhone(data.phone.replace(/-/g, ''));
    if (!user) {
      throw new Error('등록되지 않은 번호입니다.');
    }
    return {
      success: true,
      message: '인증번호가 발송되었습니다. (개발용: 000000)',
    };
  }

  async verifyCode(data: PhoneVerifyConfirmRequest): Promise<PhoneVerifyResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (data.code !== '000000') {
      throw new Error('인증번호가 일치하지 않습니다.');
    }
    return {
      success: true,
      message: '인증이 완료되었습니다.',
      verification_token: 'mock-verification-token',
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user = findUserByPhone(data.phone.replace(/-/g, ''));
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    return {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'bearer',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'bearer',
      user: {
        id: uuidv4(),
        name: data.name,
        phone: data.phone,
        role: data.role,
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // ============ Reservations ============
  async getReservations(): Promise<ReservationListResponse> {
    return { items: [], total: 0, page: 1, limit: 10 };
  }

  async getReservation(id: string): Promise<Reservation> {
    throw new Error('Not implemented in mock');
  }

  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    throw new Error('Not implemented in mock');
  }

  async cancelReservation(id: string): Promise<void> {
    // No-op
  }

  // ============ Managers ============
  async getManagers(): Promise<ManagerListResponse> {
    return { items: [], total: 0, page: 1, limit: 10 };
  }

  async getManager(id: string): Promise<Manager> {
    throw new Error('Not implemented in mock');
  }

  async registerManager(data: ManagerCreateRequest): Promise<Manager> {
    throw new Error('Not implemented in mock');
  }

  async getMyManagerProfile(): Promise<ManagerDetail> {
    throw new Error('Not implemented in mock');
  }

  async updateMyManagerProfile(data: ManagerUpdateRequest): Promise<Manager> {
    throw new Error('Not implemented in mock');
  }

  // ============ Schedules ============
  async getMySchedules(): Promise<ManagerSchedule[]> {
    return [];
  }

  async getManagerSchedules(): Promise<ManagerSchedule[]> {
    return [];
  }

  async createSchedule(data: ScheduleCreateRequest): Promise<ManagerSchedule> {
    throw new Error('Not implemented in mock');
  }

  async updateSchedule(scheduleId: string, data: ScheduleUpdateRequest): Promise<ManagerSchedule> {
    throw new Error('Not implemented in mock');
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    // No-op
  }

  // ============ Users ============
  async getMe(): Promise<UserWithProfile> {
    throw new Error('Not implemented in mock');
  }

  async updateMe(data: UserUpdateRequest): Promise<UserWithProfile> {
    throw new Error('Not implemented in mock');
  }

  async getUsers(): Promise<UserWithProfile[]> {
    return [];
  }

  async getUser(id: string): Promise<UserWithProfile> {
    throw new Error('Not implemented in mock');
  }

  async updateUserRole(id: string, role: string): Promise<UserWithProfile> {
    throw new Error('Not implemented in mock');
  }

  async activateUser(id: string): Promise<UserWithProfile> {
    throw new Error('Not implemented in mock');
  }

  async deleteUser(id: string): Promise<void> {
    // No-op
  }

  // ============ User Groups ============
  async getUserGroups(): Promise<UserGroup[]> {
    return [];
  }

  async createUserGroup(data: { name: string; description?: string }): Promise<UserGroup> {
    throw new Error('Not implemented in mock');
  }

  async updateUserGroup(
    id: string,
    data: { name?: string; description?: string; is_active?: boolean }
  ): Promise<UserGroup> {
    throw new Error('Not implemented in mock');
  }

  async deleteUserGroup(id: string): Promise<void> {
    // No-op
  }

  async assignUserGroup(userId: string, groupId: string | null): Promise<UserWithProfile> {
    throw new Error('Not implemented in mock');
  }

  // ============ Promotions ============
  async getMyPromotions(): Promise<{ items: Promotion[]; total: number }> {
    return { items: [], total: 0 };
  }

  async createPromotion(data: CreatePromotionRequest): Promise<Promotion> {
    throw new Error('Not implemented in mock');
  }

  async updatePromotion(promotionId: string, data: Partial<CreatePromotionRequest>): Promise<Promotion> {
    throw new Error('Not implemented in mock');
  }

  async deletePromotion(promotionId: string): Promise<void> {
    // No-op
  }

  async togglePromotionActive(promotionId: string): Promise<Promotion> {
    throw new Error('Not implemented in mock');
  }

  // ============ Admin - System Settings ============
  async getSystemSettings(): Promise<SystemSetting[]> {
    return [];
  }

  async getSystemSetting(key: string): Promise<SystemSetting> {
    throw new Error('Not implemented in mock');
  }

  async updateSystemSetting(key: string, data: SystemSettingUpdate): Promise<SystemSetting> {
    throw new Error('Not implemented in mock');
  }

  async toggleSystemSetting(key: string, isEnabled: boolean): Promise<SystemSetting> {
    throw new Error('Not implemented in mock');
  }

  async bulkUpdateSystemSettings(settings: Record<string, any>): Promise<SystemSetting[]> {
    return [];
  }

  async initializeSystemSettings(): Promise<SystemSetting[]> {
    return [];
  }

  // ============ Admin - Menu Management ============
  async getMenus(): Promise<MenuListResponse> {
    return { items: [], total: 0 };
  }

  async getMenusTree(): Promise<MenuTreeNode[]> {
    return [];
  }

  async getMenu(menuId: string): Promise<Menu> {
    throw new Error('Not implemented in mock');
  }

  async createMenu(data: MenuFormData): Promise<Menu> {
    throw new Error('Not implemented in mock');
  }

  async updateMenu(menuId: string, data: Partial<MenuFormData>): Promise<Menu> {
    throw new Error('Not implemented in mock');
  }

  async deleteMenu(menuId: string, hardDelete?: boolean): Promise<void> {
    // No-op
  }

  async moveMenu(menuId: string, data: MenuMoveRequest): Promise<Menu> {
    throw new Error('Not implemented in mock');
  }

  async reorderMenus(data: MenuReorderRequest): Promise<{ message: string; count: number }> {
    return { message: 'Mock reorder success', count: data.ordered_ids.length };
  }

  // ============ Generic Methods ============
  async get<T = any>(url: string, config?: any): Promise<T> {
    throw new Error('Not implemented in mock');
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    throw new Error('Not implemented in mock');
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    throw new Error('Not implemented in mock');
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    throw new Error('Not implemented in mock');
  }
}

export const api = USE_MOCK_API ? new MockApiClient() : new RealApiClient();
