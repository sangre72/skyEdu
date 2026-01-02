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
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
  PostCreateRequest,
  PostDetailResponse,
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
  const [data, setData] = useState<PostListResponse>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        // TODO: API 호출
        await new Promise((resolve) => setTimeout(resolve, 300));
        const filtered = MOCK_POSTS.filter((p) => {
          const board = MOCK_BOARDS.find((b) => b.code === boardCode);
          return p.boardId === board?.id;
        });
        setData({
          items: filtered,
          total: filtered.length,
          page: params?.page || 1,
          limit: params?.limit || 20,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
      } finally {
        setIsLoading(false);
      }
    };

    if (boardCode) {
      fetchPosts();
    }
  }, [boardCode, params]);

  return { ...data, isLoading, error };
}

/**
 * 게시글 상세 조회
 */
export function usePost(boardCode: string, postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        // TODO: API 호출
        await new Promise((resolve) => setTimeout(resolve, 300));
        const foundPost = MOCK_POSTS.find((p) => p.id === postId);
        if (!foundPost) {
          throw new Error('게시글을 찾을 수 없습니다.');
        }
        setPost(foundPost);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch post'));
      } finally {
        setIsLoading(false);
      }
    };

    if (boardCode && postId) {
      fetchPost();
    }
  }, [boardCode, postId]);

  return { post, isLoading, error };
}

/**
 * 게시글 작성
 */
export function useCreatePost() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPost = useCallback(async (boardCode: string, data: PostCreateRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newPost: Post = {
        id: String(Date.now()),
        boardId: MOCK_BOARDS.find((b) => b.code === boardCode)?.id || '1',
        authorId: 'user1',
        authorName: '사용자',
        ...data,
        isNotice: data.isNotice || false,
        isSecret: data.isSecret || false,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        isAnswered: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: [],
      };
      return newPost;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create post');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createPost, isLoading, error };
}

/**
 * 게시글 수정
 */
export function useUpdatePost() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePost = useCallback(
    async (boardCode: string, postId: string, data: PostUpdateRequest) => {
      try {
        setIsLoading(true);
        setError(null);
        // TODO: API 호출
        await new Promise((resolve) => setTimeout(resolve, 500));
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update post');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { updatePost, isLoading, error };
}

/**
 * 게시글 삭제
 */
export function useDeletePost() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deletePost = useCallback(async (boardCode: string, postId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete post');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deletePost, isLoading, error };
}

/**
 * 댓글 목록 조회
 */
export function useComments(postId: string) {
  const [data, setData] = useState<CommentListResponse>({
    items: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        // TODO: API 호출
        await new Promise((resolve) => setTimeout(resolve, 300));
        setData({ items: [], total: 0 });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch comments'));
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return { ...data, isLoading, error };
}

/**
 * 댓글 작성
 */
export function useCreateComment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createComment = useCallback(async (postId: string, data: CommentCreateRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newComment: Comment = {
        id: String(Date.now()),
        postId,
        parentId: data.parentId,
        authorId: 'user1',
        authorName: '사용자',
        content: data.content,
        isSecret: data.isSecret || false,
        likeCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newComment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create comment');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createComment, isLoading, error };
}
