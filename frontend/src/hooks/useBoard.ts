/**
 * 게시판 커스텀 훅 (TanStack Query 사용)
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { boardApi } from '@/lib/board/api';
import type {
  BoardCategoryCreateRequest,
  BoardCategoryUpdateRequest,
  BoardCreateRequest,
  BoardUpdateRequest,
  CommentCreateRequest,
  PostCreateRequest,
  PostListParams,
  PostUpdateRequest,
} from '@/types/board';

// ============================================
// Query Keys
// ============================================

export const boardKeys = {
  all: ['boards'] as const,
  lists: () => [...boardKeys.all, 'list'] as const,
  list: () => [...boardKeys.lists()] as const,
  details: () => [...boardKeys.all, 'detail'] as const,
  detail: (code: string) => [...boardKeys.details(), code] as const,
  categories: (code: string) => [...boardKeys.all, 'categories', code] as const,
  posts: (code: string) => [...boardKeys.all, 'posts', code] as const,
  postList: (code: string, params?: PostListParams) =>
    [...boardKeys.posts(code), 'list', params] as const,
  postDetail: (code: string, postId: string) =>
    [...boardKeys.posts(code), 'detail', postId] as const,
  comments: (postId: string) => ['comments', postId] as const,
};

// ============================================
// 게시판 훅
// ============================================

/**
 * 게시판 목록 조회
 */
export function useBoards() {
  return useQuery({
    queryKey: boardKeys.list(),
    queryFn: () => boardApi.getBoards(),
  });
}

/**
 * 게시판 상세 조회
 */
export function useBoard(code: string) {
  return useQuery({
    queryKey: boardKeys.detail(code),
    queryFn: () => boardApi.getBoard(code),
    enabled: !!code,
  });
}

/**
 * 게시판 생성 (관리자)
 */
export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BoardCreateRequest) => boardApi.createBoard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}

/**
 * 게시판 수정 (관리자)
 */
export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: BoardUpdateRequest }) =>
      boardApi.updateBoard(code, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.code) });
    },
  });
}

/**
 * 게시판 삭제 (관리자)
 */
export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => boardApi.deleteBoard(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}

// ============================================
// 게시판 분류 훅
// ============================================

/**
 * 게시판 분류 목록 조회
 */
export function useBoardCategories(boardCode: string) {
  return useQuery({
    queryKey: boardKeys.categories(boardCode),
    queryFn: () => boardApi.getCategories(boardCode),
    enabled: !!boardCode,
  });
}

/**
 * 분류 생성
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardCode,
      data,
    }: {
      boardCode: string;
      data: BoardCategoryCreateRequest;
    }) => boardApi.createCategory(boardCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.categories(variables.boardCode) });
    },
  });
}

/**
 * 분류 수정
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardCode,
      categoryId,
      data,
    }: {
      boardCode: string;
      categoryId: string;
      data: BoardCategoryUpdateRequest;
    }) => boardApi.updateCategory(boardCode, categoryId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.categories(variables.boardCode) });
    },
  });
}

/**
 * 분류 삭제
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardCode, categoryId }: { boardCode: string; categoryId: string }) =>
      boardApi.deleteCategory(boardCode, categoryId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.categories(variables.boardCode) });
    },
  });
}

// ============================================
// 게시글 훅
// ============================================

/**
 * 게시글 목록 조회
 */
export function usePosts(boardCode: string, params?: PostListParams) {
  return useQuery({
    queryKey: boardKeys.postList(boardCode, params),
    queryFn: () => boardApi.getPosts(boardCode, params),
    enabled: !!boardCode,
    select: (data) => ({
      ...data,
      totalPages: Math.ceil(data.total / (params?.limit || 20)),
    }),
  });
}

/**
 * 게시글 상세 조회
 */
export function usePost(boardCode: string, postId: string, password?: string) {
  return useQuery({
    queryKey: boardKeys.postDetail(boardCode, postId),
    queryFn: () => boardApi.getPost(boardCode, postId, password),
    enabled: !!boardCode && !!postId,
  });
}

/**
 * 게시글 작성
 */
export function useCreatePost(boardCode: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostCreateRequest) => boardApi.createPost(boardCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.posts(boardCode) });
    },
  });
}

/**
 * 게시글 수정
 */
export function useUpdatePost(boardCode: string, postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostUpdateRequest) => boardApi.updatePost(boardCode, postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.posts(boardCode) });
      queryClient.invalidateQueries({ queryKey: boardKeys.postDetail(boardCode, postId) });
    },
  });
}

/**
 * 게시글 삭제
 */
export function useDeletePost(boardCode: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => boardApi.deletePost(boardCode, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.posts(boardCode) });
    },
  });
}

/**
 * 게시글 좋아요
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => boardApi.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

/**
 * 게시글 좋아요 취소
 */
export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => boardApi.unlikePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

// ============================================
// 댓글 훅
// ============================================

/**
 * 댓글 목록 조회
 */
export function useComments(postId: string) {
  return useQuery({
    queryKey: boardKeys.comments(postId),
    queryFn: () => boardApi.getComments(postId),
    enabled: !!postId,
  });
}

/**
 * 댓글 작성
 */
export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CommentCreateRequest) => boardApi.createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.comments(postId) });
    },
  });
}

/**
 * 댓글 수정
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      boardApi.updateComment(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

/**
 * 댓글 삭제
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => boardApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

/**
 * 댓글 좋아요
 */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => boardApi.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

/**
 * 댓글 좋아요 취소
 */
export function useUnlikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => boardApi.unlikeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

// ============================================
// 첨부파일 훅
// ============================================

/**
 * 첨부파일 업로드
 */
export function useUploadAttachment() {
  return useMutation({
    mutationFn: (file: File) => boardApi.uploadAttachment(file),
  });
}

/**
 * 첨부파일 삭제
 */
export function useDeleteAttachment() {
  return useMutation({
    mutationFn: (attachmentId: string) => boardApi.deleteAttachment(attachmentId),
  });
}

/**
 * 첨부파일 다운로드 URL 가져오기
 */
export function getAttachmentDownloadUrl(attachmentId: string): string {
  return boardApi.getAttachmentDownloadUrl(attachmentId);
}
