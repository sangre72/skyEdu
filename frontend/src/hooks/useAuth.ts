'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/lib/api';
import type { LoginRequest, RegisterRequest, User } from '@/types';

/**
 * 인증 관련 기능을 제공하는 훅
 * - 로그인/로그아웃
 * - 회원가입
 * - 인증 상태 확인
 */
export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    login: setAuth,
    logout: clearAuth,
    updateUser,
  } = useAuthStore();
  const { closeLoginModal, closeRegisterModal } = useUIStore();

  // 로그인
  const login = useCallback(
    async (data: LoginRequest) => {
      const response = await api.login(data);
      setAuth(response.user, response.access_token, response.refresh_token);
      closeLoginModal();
      return response.user;
    },
    [setAuth, closeLoginModal]
  );

  // 회원가입
  const register = useCallback(
    async (data: RegisterRequest) => {
      const response = await api.register(data);
      setAuth(response.user, response.access_token, response.refresh_token);
      closeRegisterModal();
      return response.user;
    },
    [setAuth, closeRegisterModal]
  );

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // 서버 로그아웃 실패해도 로컬 상태는 초기화
    }
    clearAuth();
    router.push('/');
  }, [clearAuth, router]);

  // 역할 확인 헬퍼
  const isCustomer = user?.role === 'customer';
  const isCompanion = user?.role === 'companion';
  const isAdmin = user?.role === 'admin';

  // 역할 기반 접근 확인
  const hasRole = useCallback(
    (roles: User['role'][]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return {
    user,
    isAuthenticated,
    isCustomer,
    isCompanion,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    hasRole,
  };
}
