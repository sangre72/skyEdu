'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  CalendarMonth,
  ChevronRight,
  Description,
  Edit,
  Logout,
  Person,
  PersonOff,
  Security,
  Settings,
  Star,
  Warning,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuthStore } from '@/stores/authStore';

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleWithdraw = async () => {
    // TODO: 백엔드 회원 탈퇴 API 호출
    // await api.delete('/users/me');
    logout();
    router.push('/');
  };

  const isCompanion = user?.role === 'companion';

  // 역할별 메뉴 구성
  // - 고객: 예약 내역 확인, 리뷰 관리, 프로필 수정
  // - 동행인: 스케줄 관리, 리뷰 관리, 동행인 프로필 수정
  const menuItems = isCompanion
    ? [
        { icon: <CalendarMonth />, label: '스케줄 관리', path: '/companion/schedule' },
        { icon: <Star />, label: '받은 리뷰', path: '/mypage/reviews' },
        { icon: <Settings />, label: '프로필 관리', path: '/companion/register' },
      ]
    : [
        { icon: <CalendarMonth />, label: '예약 내역', path: '/mypage/reservations' },
        { icon: <Star />, label: '작성한 리뷰', path: '/mypage/reviews' },
        { icon: <Person />, label: '내 정보 수정', path: '/mypage/profile' },
      ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb
          items={[{ label: '마이페이지' }]}
          showBackButton={true}
          backHref="/"
        />

        {/* 프로필 카드 */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#E3F2FD',
                color: '#0288D1',
                fontSize: '2rem',
              }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h5" fontWeight={700}>
                  {user?.name}
                </Typography>
                <Chip
                  label={isCompanion ? '동행인' : '고객'}
                  size="small"
                  sx={{
                    bgcolor: isCompanion ? '#E8F5E9' : '#E3F2FD',
                    color: isCompanion ? '#2E7D32' : '#0288D1',
                  }}
                />
              </Box>
              <Typography color="text.secondary">
                {user?.phone?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => router.push(isCompanion ? '/companion/register' : '/mypage/profile')}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              수정
            </Button>
          </Box>
        </Paper>

        {/* 동행인 전용: 통계 */}
        {isCompanion && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { label: '총 동행', value: '47건' },
              { label: '평균 평점', value: '4.8점' },
              { label: '이번 달', value: '8건' },
            ].map((stat, i) => (
              <Grid item xs={4} key={i}>
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* 동행인 전용: 대시보드 버튼 */}
        {isCompanion && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #0288D1 0%, #01579B 100%)',
              color: 'white',
              borderRadius: 3,
              '&:hover': { opacity: 0.95 },
            }}
            onClick={() => router.push('/companion/dashboard')}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  대시보드로 이동
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  예약 관리, 수익 현황, 통계를 확인하세요
                </Typography>
              </Box>
              <ChevronRight sx={{ fontSize: 32 }} />
            </Box>
          </Paper>
        )}

        {/* 메뉴 리스트 */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <List disablePadding>
            {menuItems.map((item, index) => (
              <ListItem key={item.path} disablePadding divider={index < menuItems.length - 1}>
                <ListItemButton onClick={() => router.push(item.path)} sx={{ py: 2 }}>
                  <ListItemIcon sx={{ color: '#0288D1' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  <ChevronRight sx={{ color: 'text.secondary' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* 약관 및 정책 */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, ml: 1 }}>
          약관 및 정책
        </Typography>
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <List disablePadding>
            <ListItem disablePadding divider>
              <ListItemButton onClick={() => router.push('/terms')} sx={{ py: 2 }}>
                <ListItemIcon sx={{ color: 'text.secondary' }}>
                  <Description />
                </ListItemIcon>
                <ListItemText primary="이용약관" />
                <ChevronRight sx={{ color: 'text.secondary' }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => router.push('/privacy')} sx={{ py: 2 }}>
                <ListItemIcon sx={{ color: 'text.secondary' }}>
                  <Security />
                </ListItemIcon>
                <ListItemText primary="개인정보처리방침" />
                <ChevronRight sx={{ color: 'text.secondary' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Paper>

        {/* 로그아웃 */}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{ mt: 4 }}
        >
          로그아웃
        </Button>

        {/* 회원 탈퇴 */}
        <Button
          fullWidth
          variant="text"
          color="inherit"
          startIcon={<PersonOff />}
          onClick={() => setWithdrawOpen(true)}
          sx={{ mt: 2, color: 'text.secondary' }}
        >
          회원 탈퇴
        </Button>
      </Container>

      {/* 회원 탈퇴 확인 다이얼로그 */}
      <Dialog
        open={withdrawOpen}
        onClose={() => {
          setWithdrawOpen(false);
          setConfirmText('');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          회원 탈퇴
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            정말 탈퇴하시겠습니까?
          </DialogContentText>
          <DialogContentText sx={{ mb: 2, fontSize: '0.875rem' }}>
            • 계정이 비활성화되며 서비스 이용이 불가합니다
            <br />
            • 진행 중인 예약이 있다면 완료 후 탈퇴해주세요
            <br />
            {isCompanion && (
              <>
                • 미정산 수익이 있다면 정산 완료 후 탈퇴해주세요
                <br />
              </>
            )}
            • 재가입 시 기존 정보는 복구되지 않습니다
          </DialogContentText>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            탈퇴를 원하시면 아래에 <strong>탈퇴합니다</strong>를 입력해주세요.
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="탈퇴합니다"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setWithdrawOpen(false);
              setConfirmText('');
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={confirmText !== '탈퇴합니다'}
            onClick={handleWithdraw}
          >
            탈퇴하기
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
