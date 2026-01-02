'use client';

import { useParams, useRouter } from 'next/navigation';

import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  CalendarToday,
  Person,
  Announcement,
  AttachFile,
  Download,
} from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useBoard, usePost } from '@/hooks';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardCode = params.boardCode as string;
  const postId = params.postId as string;

  const { data: board, isLoading: boardLoading } = useBoard(boardCode);
  const { data: post, isLoading: postLoading, error: postError } = usePost(boardCode, postId);

  // 브레드크럼 아이템 (홈은 Breadcrumb 컴포넌트에서 자동 추가됨)
  const breadcrumbItems = [
    { label: board?.name || '게시판', href: `/boards/${boardCode}` },
    { label: post?.title || '게시글' },
  ];

  if (boardLoading || postLoading) {
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

  if (postError || !post) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Breadcrumb items={[{ label: board?.name || '게시판', href: `/boards/${boardCode}` }, { label: '게시글' }]} />
          <Alert severity="error" sx={{ mt: 2 }}>게시글을 찾을 수 없습니다.</Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/boards/${boardCode}`)}
            sx={{ mt: 2 }}
          >
            목록으로
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={breadcrumbItems} />

        {/* 헤더 */}
        <Box sx={{ mb: 3, mt: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/boards/${boardCode}`)}
            sx={{ mb: 2 }}
          >
            {board?.name || '목록'}으로
          </Button>
        </Box>

      {/* 게시글 */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* 제목 영역 */}
        <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E5E7EB' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {post.isNotice && (
              <Chip
                icon={<Announcement sx={{ fontSize: 14 }} />}
                label="공지"
                size="small"
                color="primary"
              />
            )}
            <Typography variant="h5" fontWeight={600}>
              {post.title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person sx={{ fontSize: 16 }} />
              <Typography variant="body2">{post.authorName || '관리자'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarToday sx={{ fontSize: 16 }} />
              <Typography variant="body2">
                {new Date(post.createdAt).toLocaleString('ko-KR')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility sx={{ fontSize: 16 }} />
              <Typography variant="body2">조회 {post.viewCount}</Typography>
            </Box>
          </Box>
        </Box>

        {/* 본문 */}
        <Box sx={{ p: 4, minHeight: 300 }}>
          <Typography
            component="div"
            sx={{
              lineHeight: 1.8,
              '& p': { mb: 2 },
              '& img': { maxWidth: '100%', height: 'auto' },
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </Box>

        {/* 첨부파일 */}
        {post.attachments && post.attachments.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 3, bgcolor: '#FAFAFA' }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachFile sx={{ fontSize: 18 }} />
                첨부파일 ({post.attachments.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {post.attachments.map((file) => (
                  <Box
                    key={file.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    <Typography variant="body2">{file.originalName}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {(file.fileSize / 1024).toFixed(1)} KB
                      </Typography>
                      <IconButton size="small" color="primary">
                        <Download fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}
      </Paper>

        {/* 하단 버튼 */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/boards/${boardCode}`)}
          >
            목록으로
          </Button>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
