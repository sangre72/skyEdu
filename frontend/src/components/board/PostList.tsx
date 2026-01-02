/**
 * 게시글 목록 컴포넌트
 */

'use client';

import { useRouter } from 'next/navigation';

import {
  Box,
  Chip,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ChatBubbleOutline, FavoriteBorder, Lock, Visibility } from '@mui/icons-material';

import type { Post } from '@/types';

interface PostListProps {
  boardCode: string;
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function PostList({ boardCode, posts, total, page, limit, onPageChange }: PostListProps) {
  const router = useRouter();

  const handlePostClick = (postId: string) => {
    router.push(`/boards/${boardCode}/${postId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const totalPages = Math.ceil(total / limit);

  if (posts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">등록된 게시글이 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB' }}>
        <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
              <TableCell width="60px" align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                번호
              </TableCell>
              <TableCell>제목</TableCell>
              <TableCell width="100px" align="center" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                작성자
              </TableCell>
              <TableCell width="100px" align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                날짜
              </TableCell>
              <TableCell width="80px" align="center" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                조회
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post, index) => (
              <TableRow
                key={post.id}
                hover
                onClick={() => handlePostClick(post.id)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F9FAFB' },
                  bgcolor: post.isNotice ? '#FFFBEB' : 'inherit',
                }}
              >
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  {post.isNotice ? (
                    <Chip label="공지" color="error" size="small" sx={{ fontWeight: 600 }} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {total - (page - 1) * limit - index}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    {post.isSecret && <Lock fontSize="small" sx={{ color: 'text.secondary' }} />}
                    {post.category && (
                      <Chip
                        label={post.category.name}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: '#E3F2FD',
                          color: '#1976D2',
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      fontWeight={post.isNotice ? 600 : 400}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: { xs: 'normal', sm: 'nowrap' },
                        display: '-webkit-box',
                        WebkitLineClamp: { xs: 2, sm: 'unset' },
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {post.title}
                    </Typography>
                    {post.commentCount > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: '#0288D1' }}>
                        <ChatBubbleOutline fontSize="small" sx={{ fontSize: 14 }} />
                        <Typography variant="caption" fontWeight={600}>
                          {post.commentCount}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ display: { xs: 'flex', sm: 'none' }, mt: 0.5 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {post.authorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(post.createdAt)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      •
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <Visibility fontSize="small" sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {post.viewCount}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Typography variant="body2" color="text.secondary">
                    {post.authorName}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(post.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {post.viewCount}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => onPageChange(newPage)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Stack>
  );
}
