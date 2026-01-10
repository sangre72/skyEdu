/**
 * 게시판 API 클라이언트
 */
import { api } from '@/lib/api';
import type {
  Attachment,
  AttachmentUploadResponse,
  Board,
  BoardCategory,
  BoardCategoryCreateRequest,
  BoardCategoryListResponse,
  BoardCategoryUpdateRequest,
  BoardCreateRequest,
  BoardListResponse,
  BoardUpdateRequest,
  Comment,
  CommentCreateRequest,
  CommentListResponse,
  CommentUpdateRequest,
  LikeResponse,
  Post,
  PostCreateRequest,
  PostDetailResponse,
  PostListParams,
  PostListResponse,
  PostUpdateRequest,
} from '@/types/board';

class BoardApiClient {
  // ============ 게시판 ============

  async getBoards(): Promise<BoardListResponse> {
    return api.get<BoardListResponse>('/boards');
  }

  async getBoard(code: string): Promise<Board> {
    return api.get<Board>(`/boards/${code}`);
  }

  async createBoard(data: BoardCreateRequest): Promise<Board> {
    return api.post<Board>('/boards', data);
  }

  async updateBoard(code: string, data: BoardUpdateRequest): Promise<Board> {
    return api.patch<Board>(`/boards/${code}`, data);
  }

  async deleteBoard(code: string): Promise<void> {
    await api.delete(`/boards/${code}`);
  }

  // ============ 게시판 분류 ============

  async getCategories(boardCode: string): Promise<BoardCategoryListResponse> {
    const response = await api.get<BoardCategoryListResponse>(
      `/boards/${boardCode}/categories`
    );
    return response;
  }

  async createCategory(
    boardCode: string,
    data: BoardCategoryCreateRequest
  ): Promise<BoardCategory> {
    const response = await api.post<BoardCategory>(
      `/boards/${boardCode}/categories`,
      data
    );
    return response;
  }

  async updateCategory(
    boardCode: string,
    categoryId: string,
    data: BoardCategoryUpdateRequest
  ): Promise<BoardCategory> {
    const response = await api.patch<BoardCategory>(
      `/boards/${boardCode}/categories/${categoryId}`,
      data
    );
    return response;
  }

  async deleteCategory(boardCode: string, categoryId: string): Promise<void> {
    await api.delete(`/boards/${boardCode}/categories/${categoryId}`);
  }

  // ============ 게시글 ============

  async getPosts(boardCode: string, params?: PostListParams): Promise<PostListResponse> {
    const response = await api.get<PostListResponse>(`/boards/${boardCode}/posts`, {
      params,
    });
    return response;
  }

  async getPost(boardCode: string, postId: string, password?: string): Promise<PostDetailResponse> {
    const response = await api.get<PostDetailResponse>(
      `/boards/${boardCode}/posts/${postId}`,
      {
        params: password ? { password } : undefined,
      }
    );
    return response;
  }

  async createPost(boardCode: string, data: PostCreateRequest): Promise<Post> {
    const response = await api.post<Post>(`/boards/${boardCode}/posts`, data);
    return response;
  }

  async updatePost(boardCode: string, postId: string, data: PostUpdateRequest): Promise<Post> {
    const response = await api.patch<Post>(
      `/boards/${boardCode}/posts/${postId}`,
      data
    );
    return response;
  }

  async deletePost(boardCode: string, postId: string): Promise<void> {
    await api.delete(`/boards/${boardCode}/posts/${postId}`);
  }

  async likePost(postId: string): Promise<LikeResponse> {
    const response = await api.post<LikeResponse>(`/posts/${postId}/like`);
    return response;
  }

  async unlikePost(postId: string): Promise<LikeResponse> {
    const response = await api.delete<LikeResponse>(`/posts/${postId}/like`);
    return response;
  }

  // ============ 댓글 ============

  async getComments(postId: string): Promise<CommentListResponse> {
    const response = await api.get<CommentListResponse>(`/posts/${postId}/comments`);
    return response;
  }

  async createComment(postId: string, data: CommentCreateRequest): Promise<Comment> {
    const response = await api.post<Comment>(`/posts/${postId}/comments`, data);
    return response;
  }

  async updateComment(commentId: string, data: CommentUpdateRequest): Promise<Comment> {
    const response = await api.patch<Comment>(`/comments/${commentId}`, data);
    return response;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  }

  async likeComment(commentId: string): Promise<LikeResponse> {
    const response = await api.post<LikeResponse>(`/comments/${commentId}/like`);
    return response;
  }

  async unlikeComment(commentId: string): Promise<LikeResponse> {
    const response = await api.delete<LikeResponse>(`/comments/${commentId}/like`);
    return response;
  }

  // ============ 첨부파일 ============

  async uploadAttachment(file: File): Promise<AttachmentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<AttachmentUploadResponse>(
      '/attachments/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    await api.delete(`/attachments/${attachmentId}`);
  }

  getAttachmentDownloadUrl(attachmentId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    return `${baseUrl}/attachments/${attachmentId}/download`;
  }
}

export const boardApi = new BoardApiClient();
