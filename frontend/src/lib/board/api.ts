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
    const response = await api['client'].get<BoardListResponse>('/boards');
    return response.data;
  }

  async getBoard(code: string): Promise<Board> {
    const response = await api['client'].get<Board>(`/boards/${code}`);
    return response.data;
  }

  async createBoard(data: BoardCreateRequest): Promise<Board> {
    const response = await api['client'].post<Board>('/boards', data);
    return response.data;
  }

  async updateBoard(code: string, data: BoardUpdateRequest): Promise<Board> {
    const response = await api['client'].patch<Board>(`/boards/${code}`, data);
    return response.data;
  }

  async deleteBoard(code: string): Promise<void> {
    await api['client'].delete(`/boards/${code}`);
  }

  // ============ 게시판 분류 ============

  async getCategories(boardCode: string): Promise<BoardCategoryListResponse> {
    const response = await api['client'].get<BoardCategoryListResponse>(
      `/boards/${boardCode}/categories`
    );
    return response.data;
  }

  async createCategory(
    boardCode: string,
    data: BoardCategoryCreateRequest
  ): Promise<BoardCategory> {
    const response = await api['client'].post<BoardCategory>(
      `/boards/${boardCode}/categories`,
      data
    );
    return response.data;
  }

  async updateCategory(
    boardCode: string,
    categoryId: string,
    data: BoardCategoryUpdateRequest
  ): Promise<BoardCategory> {
    const response = await api['client'].patch<BoardCategory>(
      `/boards/${boardCode}/categories/${categoryId}`,
      data
    );
    return response.data;
  }

  async deleteCategory(boardCode: string, categoryId: string): Promise<void> {
    await api['client'].delete(`/boards/${boardCode}/categories/${categoryId}`);
  }

  // ============ 게시글 ============

  async getPosts(boardCode: string, params?: PostListParams): Promise<PostListResponse> {
    const response = await api['client'].get<PostListResponse>(`/boards/${boardCode}/posts`, {
      params,
    });
    return response.data;
  }

  async getPost(boardCode: string, postId: string, password?: string): Promise<PostDetailResponse> {
    const response = await api['client'].get<PostDetailResponse>(
      `/boards/${boardCode}/posts/${postId}`,
      {
        params: password ? { password } : undefined,
      }
    );
    return response.data;
  }

  async createPost(boardCode: string, data: PostCreateRequest): Promise<Post> {
    const response = await api['client'].post<Post>(`/boards/${boardCode}/posts`, data);
    return response.data;
  }

  async updatePost(boardCode: string, postId: string, data: PostUpdateRequest): Promise<Post> {
    const response = await api['client'].patch<Post>(
      `/boards/${boardCode}/posts/${postId}`,
      data
    );
    return response.data;
  }

  async deletePost(boardCode: string, postId: string): Promise<void> {
    await api['client'].delete(`/boards/${boardCode}/posts/${postId}`);
  }

  async likePost(postId: string): Promise<LikeResponse> {
    const response = await api['client'].post<LikeResponse>(`/posts/${postId}/like`);
    return response.data;
  }

  async unlikePost(postId: string): Promise<LikeResponse> {
    const response = await api['client'].delete<LikeResponse>(`/posts/${postId}/like`);
    return response.data;
  }

  // ============ 댓글 ============

  async getComments(postId: string): Promise<CommentListResponse> {
    const response = await api['client'].get<CommentListResponse>(`/posts/${postId}/comments`);
    return response.data;
  }

  async createComment(postId: string, data: CommentCreateRequest): Promise<Comment> {
    const response = await api['client'].post<Comment>(`/posts/${postId}/comments`, data);
    return response.data;
  }

  async updateComment(commentId: string, data: CommentUpdateRequest): Promise<Comment> {
    const response = await api['client'].patch<Comment>(`/comments/${commentId}`, data);
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api['client'].delete(`/comments/${commentId}`);
  }

  async likeComment(commentId: string): Promise<LikeResponse> {
    const response = await api['client'].post<LikeResponse>(`/comments/${commentId}/like`);
    return response.data;
  }

  async unlikeComment(commentId: string): Promise<LikeResponse> {
    const response = await api['client'].delete<LikeResponse>(`/comments/${commentId}/like`);
    return response.data;
  }

  // ============ 첨부파일 ============

  async uploadAttachment(file: File): Promise<AttachmentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api['client'].post<AttachmentUploadResponse>(
      '/attachments/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    await api['client'].delete(`/attachments/${attachmentId}`);
  }

  getAttachmentDownloadUrl(attachmentId: string): string {
    const baseUrl = api['client'].defaults.baseURL || '';
    return `${baseUrl}/attachments/${attachmentId}/download`;
  }
}

export const boardApi = new BoardApiClient();
