/**
 * 게시판 타입 정의
 */
import type { Permission } from '@/lib/board/constants';

// ============================================
// 게시판
// ============================================

export interface Board {
  id: string;
  code: string;
  name: string;
  description?: string;
  readPermission: Permission;
  writePermission: Permission;
  commentPermission: Permission;
  useCategory: boolean;
  useNotice: boolean;
  useSecret: boolean;
  useAttachment: boolean;
  useLike: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface BoardCategory {
  id: string;
  boardId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isDeleted: boolean;
}

// ============================================
// 게시글
// ============================================

export interface Post {
  id: string;
  boardId: string;
  categoryId?: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  isNotice: boolean;
  isSecret: boolean;
  secretPassword?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isAnswered: boolean; // Q&A용
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isDeleted: boolean;

  // 관계 데이터
  category?: BoardCategory;
  attachments?: Attachment[];

  // 클라이언트 전용 (접근 권한 확인 후)
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface PostListItem {
  id: string;
  boardId: string;
  categoryId?: string;
  categoryName?: string;
  authorId: string;
  authorName: string;
  title: string;
  isNotice: boolean;
  isSecret: boolean;
  isAnswered: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// 댓글
// ============================================

export interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  content: string;
  isSecret: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isDeleted: boolean;

  // 관계 데이터
  replies?: Comment[];

  // 클라이언트 전용
  canEdit?: boolean;
  canDelete?: boolean;
}

// ============================================
// 첨부파일
// ============================================

export interface Attachment {
  id: string;
  postId: string;
  originalName: string;
  storedName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  downloadCount: number;
  createdAt: string;
}

// ============================================
// Request/Response 타입
// ============================================

// 게시판
export interface BoardCreateRequest {
  code: string;
  name: string;
  description?: string;
  readPermission: Permission;
  writePermission: Permission;
  commentPermission: Permission;
  useCategory: boolean;
  useNotice: boolean;
  useSecret: boolean;
  useAttachment: boolean;
  useLike: boolean;
  sortOrder?: number;
}

export interface BoardUpdateRequest {
  name?: string;
  description?: string;
  readPermission?: Permission;
  writePermission?: Permission;
  commentPermission?: Permission;
  useCategory?: boolean;
  useNotice?: boolean;
  useSecret?: boolean;
  useAttachment?: boolean;
  useLike?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface BoardListResponse {
  items: Board[];
  total: number;
}

// 게시판 분류
export interface BoardCategoryCreateRequest {
  name: string;
  sortOrder?: number;
}

export interface BoardCategoryUpdateRequest {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface BoardCategoryListResponse {
  items: BoardCategory[];
  total: number;
}

// 게시글
export interface PostCreateRequest {
  categoryId?: string;
  title: string;
  content: string;
  isNotice?: boolean;
  isSecret?: boolean;
  secretPassword?: string;
  attachmentIds?: string[];
}

export interface PostUpdateRequest {
  categoryId?: string;
  title?: string;
  content?: string;
  isNotice?: boolean;
  isSecret?: boolean;
  secretPassword?: string;
  attachmentIds?: string[];
}

export interface PostListParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  isNotice?: boolean;
  search?: string;
  searchField?: 'title' | 'content' | 'author' | 'all';
  sortBy?: 'created_at' | 'view_count' | 'like_count' | 'comment_count';
  sortOrder?: 'asc' | 'desc';
}

export interface PostListResponse {
  items: PostListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface PostDetailResponse extends Post {
  // 추가 정보 (예: 이전글/다음글)
  prevPost?: { id: string; title: string } | null;
  nextPost?: { id: string; title: string } | null;
}

// 댓글
export interface CommentCreateRequest {
  parentId?: string;
  content: string;
  isSecret?: boolean;
}

export interface CommentUpdateRequest {
  content?: string;
  isSecret?: boolean;
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
}

// 첨부파일
export interface AttachmentUploadResponse {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}

// 좋아요
export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

// ============================================
// 에러 타입
// ============================================

export interface BoardError {
  success: false;
  errorCode: string;
  message: string;
}
