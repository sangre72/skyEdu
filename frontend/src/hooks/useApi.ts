'use client';

import { useState, useCallback } from 'react';

import type { ApiError } from '@/types';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T, Args extends unknown[]> extends UseApiState<T> {
  execute: (...args: Args) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * API 호출을 위한 범용 훅
 * - 로딩 상태 관리
 * - 에러 핸들링
 * - 데이터 캐싱
 *
 * @example
 * const { data, isLoading, error, execute } = useApi(api.getReservations);
 * useEffect(() => { execute({ page: 1 }); }, []);
 */
export function useApi<T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<T>
): UseApiReturn<T, Args> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const data = await apiFunction(...args);
        setState({ data, isLoading: false, error: null });
        return data;
      } catch (err) {
        const error = parseApiError(err);
        setState((prev) => ({ ...prev, isLoading: false, error }));
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * 에러 파싱 유틸리티
 */
function parseApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    // Axios 에러 처리
    const axiosError = error as { response?: { data?: { message?: string; code?: string } } };
    if (axiosError.response?.data) {
      return {
        message: axiosError.response.data.message || error.message,
        code: axiosError.response.data.code,
      };
    }
    return { message: error.message };
  }
  return { message: '알 수 없는 오류가 발생했습니다.' };
}

/**
 * Mutation용 API 훅 (POST, PUT, DELETE 등)
 * 성공/실패 콜백 지원
 */
interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export function useMutation<T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<T>,
  options?: UseMutationOptions<T>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (...args: Args): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiFunction(...args);
        setIsLoading(false);
        options?.onSuccess?.(data);
        return data;
      } catch (err) {
        const apiError = parseApiError(err);
        setError(apiError);
        setIsLoading(false);
        options?.onError?.(apiError);
        return null;
      }
    },
    [apiFunction, options]
  );

  return {
    mutate,
    isLoading,
    error,
    reset: () => setError(null),
  };
}
