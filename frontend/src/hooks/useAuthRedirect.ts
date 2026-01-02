import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

interface UseAuthRedirectOptions {
  /** 이미 로그인된 경우 리다이렉트할지 여부 (기본: true) */
  redirectIfAuthenticated?: boolean;
  /** 고객 사용자 리다이렉트 경로 (기본: '/') */
  customerRedirectPath?: string;
  /** 동행인 사용자 리다이렉트 경로 (기본: '/companion/dashboard') */
  companionRedirectPath?: string;
}

interface UseAuthRedirectResult {
  /** 인증 상태 */
  isAuthenticated: boolean;
  /** 사용자 정보 */
  user: User | null;
  /** 리다이렉트 중인지 여부 */
  isRedirecting: boolean;
}

/**
 * 인증 상태에 따른 리다이렉트 훅
 * - 로그인/회원가입 페이지에서 이미 로그인된 사용자를 리다이렉트
 * - 역할에 따라 다른 경로로 이동
 */
export function useAuthRedirect(options: UseAuthRedirectOptions = {}): UseAuthRedirectResult {
  const {
    redirectIfAuthenticated = true,
    customerRedirectPath = '/',
    companionRedirectPath = '/companion/dashboard',
  } = options;

  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (redirectIfAuthenticated && isAuthenticated && user) {
      if (user.role === 'companion') {
        router.replace(companionRedirectPath);
      } else {
        router.replace(customerRedirectPath);
      }
    }
  }, [isAuthenticated, user, router, redirectIfAuthenticated, customerRedirectPath, companionRedirectPath]);

  const isRedirecting = redirectIfAuthenticated && isAuthenticated && !!user;

  return {
    isAuthenticated,
    user,
    isRedirecting,
  };
}
