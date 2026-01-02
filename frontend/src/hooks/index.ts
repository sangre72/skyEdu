/**
 * 커스텀 훅 모듈
 *
 * 사용 예시:
 * import { useAuth, useReservations, useRegions } from '@/hooks';
 */

// 인증
export { useAuth } from './useAuth';

// API 유틸리티
export { useApi, useMutation } from './useApi';

// 예약
export {
  useReservations,
  useReservation,
  useCreateReservation,
  useCancelReservation,
} from './useReservations';

// 동행인
export { useCompanions, useCompanion } from './useCompanions';

// 지역 데이터
export { useRegions, getRegionDataStatic, clearRegionCache } from './useRegions';

// 게시판
export {
  useBoards,
  useBoard,
  usePosts,
  usePost,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
  useComments,
  useCreateComment,
} from './useBoard';
