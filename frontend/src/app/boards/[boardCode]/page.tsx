'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  Visibility,
  Announcement,
  ExpandMore,
  QuestionAnswer,
} from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useBoard, usePosts } from '@/hooks';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardCode = params.boardCode as string;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: board, isLoading: boardLoading, error: boardError } = useBoard(boardCode);
  const { data: postsData, isLoading: postsLoading } = usePosts(boardCode, {
    page,
    limit: 20,
    search,
  });

  const posts = postsData?.items || [];
  const totalPages = postsData?.totalPages || 1;

  // 브레드크럼 아이템 (홈은 Breadcrumb 컴포넌트에서 자동 추가됨)
  const breadcrumbItems = [{ label: board?.name || '게시판' }];

  if (boardLoading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (boardError || !board) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Breadcrumb items={[{ label: '게시판' }]} />
          <Alert severity="error" sx={{ mt: 2 }}>게시판을 찾을 수 없습니다.</Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  // FAQ 게시판인 경우 아코디언 스타일로 표시 (클릭 시 상세 페이지로 이동)
  if (boardCode === 'faq') {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Breadcrumb items={breadcrumbItems} />

          <Box sx={{ mb: 4, mt: 2 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {board.name}
            </Typography>
            {board.description && (
              <Typography variant="body1" color="text.secondary">
                {board.description}
              </Typography>
            )}
          </Box>

          {/* 검색 */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="궁금한 내용을 검색해보세요"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
          </Box>

          {postsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : posts.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <QuestionAnswer sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                등록된 FAQ가 없습니다.
              </Typography>
            </Paper>
          ) : (
            <Box>
              {posts.map((post) => (
                <Paper
                  key={post.id}
                  sx={{
                    mb: 1,
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                  onClick={() => router.push(`/boards/${boardCode}/${post.id}`)}
                >
                  <QuestionAnswer sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={500}>{post.title}</Typography>
                    {post.categoryName && (
                      <Typography variant="caption" color="text.secondary">
                        {post.categoryName}
                      </Typography>
                    )}
                  </Box>
                  <ExpandMore sx={{ color: 'text.disabled' }} />
                </Paper>
              ))}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </Box>
          )}
        </Container>
        <Footer />
      </Box>
    );
  }

  // 일반 게시판 (공지사항 등)
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={breadcrumbItems} />

        <Box sx={{ mb: 4, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {board.name}
            </Typography>
            {board.description && (
              <Typography variant="body1" color="text.secondary">
                {board.description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* 검색 */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="검색어를 입력하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        {/* 게시글 목록 */}
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell width="60" align="center">번호</TableCell>
                <TableCell>제목</TableCell>
                <TableCell width="120" align="center">작성자</TableCell>
                <TableCell width="120" align="center">작성일</TableCell>
                <TableCell width="80" align="center">조회수</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {postsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">등록된 게시글이 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post, index) => (
                  <TableRow
                    key={post.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      bgcolor: post.isNotice ? 'rgba(33, 150, 243, 0.04)' : 'inherit',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => router.push(`/boards/${boardCode}/${post.id}`)}
                  >
                    <TableCell align="center">
                      {post.isNotice ? (
                        <Chip
                          icon={<Announcement sx={{ fontSize: 14 }} />}
                          label="공지"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        (page - 1) * 20 + index + 1
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: post.isNotice ? 600 : 400,
                            color: post.isNotice ? 'primary.main' : 'inherit',
                          }}
                        >
                          {post.title}
                        </Typography>
                        {post.commentCount > 0 && (
                          <Typography variant="caption" color="primary.main">
                            [{post.commentCount}]
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{post.authorName || '관리자'}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Visibility sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">
                          {post.viewCount}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
