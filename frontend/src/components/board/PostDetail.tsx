/**
 * 게시글 상세 컴포넌트
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  ChatBubbleOutline,
  Delete,
  Edit,
  Favorite,
  FavoriteBorder,
  Lock,
  Visibility,
} from '@mui/icons-material';

import type { Post } from '@/types';
import { useAuth } from '@/hooks';

interface PostDetailProps {
  boardCode: string;
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: () => void;
}

export default function PostDetail({ boardCode, post, onEdit, onDelete, onLike }: PostDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);

  const isAuthor = user?.id === post.authorId;
  const isAdmin = user?.role === 'admin';
  const canEdit = isAuthor || isAdmin;

  const handleLike = () => {
    setLiked(!liked);
    onLike?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card elevation={0} sx={{ border: '1px solid #E5E7EB' }}>
      {/* 제목 영역 */}
      <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid #E5E7EB' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {post.isNotice && (
              <Chip label="공지" color="error" size="small" sx={{ fontWeight: 600 }} />
            )}
            {post.isSecret && <Lock fontSize="small" sx={{ color: 'text.secondary' }} />}
            {post.category && (
              <Chip
                label={post.category.name}
                size="small"
                sx={{ bgcolor: '#E3F2FD', color: '#1976D2' }}
              />
            )}
            <Typography variant="h6" fontWeight={600} sx={{ flex: 1, minWidth: 200 }}>
              {post.title}
            </Typography>
          </Stack>

          {/* 작성자 정보 */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#0288D1' }}>
                {post.authorName[0]}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {post.authorName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(post.createdAt)}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility fontSize="small" />
                <Typography variant="body2">{post.viewCount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ChatBubbleOutline fontSize="small" />
                <Typography variant="body2">{post.commentCount}</Typography>
              </Box>
              {post.likeCount > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#E53935' }}>
                  <Favorite fontSize="small" />
                  <Typography variant="body2">{post.likeCount}</Typography>
                </Box>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {/* 본문 영역 */}
      <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: 200 }}>
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.8,
          }}
        >
          {post.content}
        </Typography>
      </Box>

      {/* 첨부파일 */}
      {post.attachments && post.attachments.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              첨부파일 ({post.attachments.length})
            </Typography>
            <Stack spacing={1}>
              {post.attachments.map((file) => (
                <Paper
                  key={file.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: '1px solid #E5E7EB',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': { bgcolor: '#F9FAFB', cursor: 'pointer' },
                  }}
                >
                  <Typography variant="body2">{file.originalName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.fileSize)}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        </>
      )}

      {/* 액션 버튼 */}
      <Divider />
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push(`/boards/${boardCode}`)}
          >
            목록
          </Button>
          {canEdit && (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit />}
                onClick={onEdit}
              >
                수정
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={onDelete}
              >
                삭제
              </Button>
            </>
          )}
        </Stack>

        {onLike && (
          <IconButton
            onClick={handleLike}
            sx={{
              color: liked ? '#E53935' : 'text.secondary',
              '&:hover': { bgcolor: liked ? '#FFEBEE' : '#F5F5F5' },
            }}
          >
            {liked ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        )}
      </Box>
    </Card>
  );
}
