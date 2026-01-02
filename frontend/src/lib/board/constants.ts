/**
 * 게시판 공유 상수
 */

export type Permission = 'public' | 'member' | 'admin' | 'disabled';

export const BoardErrorCode = {
  BOARD_NOT_FOUND: 'BOARD_NOT_FOUND',
  BOARD_CODE_DUPLICATE: 'BOARD_CODE_DUPLICATE',
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  COMMENT_NOT_FOUND: 'COMMENT_NOT_FOUND',
  ACCESS_DENIED: 'ACCESS_DENIED',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  SECRET_POST_ACCESS_DENIED: 'SECRET_POST_ACCESS_DENIED',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  FILE_SIZE_EXCEEDED: 'FILE_SIZE_EXCEEDED',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  INVALID_FILENAME: 'INVALID_FILENAME',
  COMMENT_DISABLED: 'COMMENT_DISABLED',
} as const;

export type BoardErrorCodeType =
  (typeof BoardErrorCode)[keyof typeof BoardErrorCode];

// 파일 업로드 설정
export const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 페이지네이션
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// 권한 라벨
export const PERMISSION_LABELS: Record<Permission, string> = {
  public: '전체 공개',
  member: '회원만',
  admin: '관리자만',
  disabled: '비활성화',
};
