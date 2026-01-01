'use client';

import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import type {
  CreateReservationRequest,
  Reservation,
  ReservationListResponse,
  ReservationStatus,
} from '@/types';

interface UseReservationsParams {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  autoFetch?: boolean;
}

/**
 * 예약 목록 조회 훅
 */
export function useReservations(params: UseReservationsParams = {}) {
  const { page = 1, limit = 10, status, autoFetch = true } = params;

  const [data, setData] = useState<ReservationListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getReservations({ page, limit, status });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, status]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [fetch, autoFetch]);

  return {
    reservations: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    limit: data?.limit ?? limit,
    isLoading,
    error,
    refetch: fetch,
  };
}

/**
 * 단일 예약 조회 훅
 */
export function useReservation(id: string | null) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getReservation(id);
      setReservation(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    reservation,
    isLoading,
    error,
    refetch: fetch,
  };
}

/**
 * 예약 생성 훅
 */
export function useCreateReservation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateReservationRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const reservation = await api.createReservation(data);
      return reservation;
    } catch (err) {
      const message = err instanceof Error ? err.message : '예약 생성에 실패했습니다.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    create,
    isLoading,
    error,
    reset: () => setError(null),
  };
}

/**
 * 예약 취소 훅
 */
export function useCancelReservation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.cancelReservation(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '예약 취소에 실패했습니다.';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cancel,
    isLoading,
    error,
    reset: () => setError(null),
  };
}
