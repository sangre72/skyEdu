'use client';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import type { Manager, ManagerListResponse } from '@/types';

interface UseCompanionsParams {
  page?: number;
  limit?: number;
  area?: string;
  autoFetch?: boolean;
}

/**
 * 동행인 목록 조회 훅
 */
export function useCompanions(params: UseCompanionsParams = {}) {
  const { page = 1, limit = 10, area, autoFetch = true } = params;

  const [data, setData] = useState<ManagerListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getManagers({ page, limit, area });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '동행인 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, area]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [fetch, autoFetch]);

  return {
    companions: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    isLoading,
    error,
    refetch: fetch,
  };
}

/**
 * 단일 동행인 조회 훅
 */
export function useCompanion(id: string | null) {
  const [companion, setCompanion] = useState<Manager | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getManager(id);
      setCompanion(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '동행인 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    companion,
    isLoading,
    error,
    refetch: fetch,
  };
}
