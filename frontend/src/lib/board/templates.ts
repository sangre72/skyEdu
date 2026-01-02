/**
 * 게시판 템플릿 정의
 */
import type { Permission } from './constants';

export interface BoardTemplate {
  name: string;
  code: string;
  description: string;
  readPermission: Permission;
  writePermission: Permission;
  commentPermission: Permission;
  useCategory: boolean;
  useNotice: boolean;
  useSecret: boolean;
  useAttachment: boolean;
  useLike: boolean;
  categories?: string[];
}

export const BOARD_TEMPLATES: Record<string, BoardTemplate> = {
  notice: {
    name: '공지사항',
    code: 'notice',
    description: '중요한 공지사항을 알려드립니다.',
    readPermission: 'public',
    writePermission: 'admin',
    commentPermission: 'disabled',
    useCategory: false,
    useNotice: true,
    useSecret: false,
    useAttachment: true,
    useLike: false,
  },
  free: {
    name: '자유게시판',
    code: 'free',
    description: '자유롭게 의견을 나눠보세요.',
    readPermission: 'public',
    writePermission: 'member',
    commentPermission: 'member',
    useCategory: false,
    useNotice: true,
    useSecret: true,
    useAttachment: true,
    useLike: true,
  },
  qna: {
    name: '질문과 답변',
    code: 'qna',
    description: '궁금한 점을 질문해주세요.',
    readPermission: 'public',
    writePermission: 'member',
    commentPermission: 'member',
    useCategory: true,
    useNotice: true,
    useSecret: true,
    useAttachment: true,
    useLike: false,
    categories: ['서비스문의', '결제문의', '기타'],
  },
  faq: {
    name: '자주 묻는 질문',
    code: 'faq',
    description: '자주 묻는 질문과 답변입니다.',
    readPermission: 'public',
    writePermission: 'admin',
    commentPermission: 'disabled',
    useCategory: true,
    useNotice: false,
    useSecret: false,
    useAttachment: false,
    useLike: false,
    categories: ['서비스안내', '결제/환불', '이용방법'],
  },
};
