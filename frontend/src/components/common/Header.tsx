'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Close, Menu, Phone } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

interface NavItem {
  label: string;
  path: string;
  roles?: ('customer' | 'companion' | 'admin')[];
  authRequired?: boolean;
  guestOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: '동행인 찾기', path: '/companions' },
  { label: '예약하기', path: '/reservation/new' },
  { label: '동행인 등록', path: '/companion/register', guestOnly: true },
  { label: '스케줄 관리', path: '/companion/schedule', roles: ['companion'], authRequired: true },
  { label: '대시보드', path: '/companion/dashboard', roles: ['companion'], authRequired: true },
  { label: '내 예약', path: '/mypage/reservations', roles: ['customer'], authRequired: true },
];

export default function Header() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { openLoginModal } = useUIStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const getVisibleNavItems = () => {
    return NAV_ITEMS.filter((item) => {
      // 게스트 전용 메뉴
      if (item.guestOnly && isAuthenticated) return false;

      // 로그인 필요 메뉴
      if (item.authRequired && !isAuthenticated) return false;

      // 역할 기반 필터
      if (item.roles && user) {
        return item.roles.includes(user.role);
      }

      // 역할 지정 없으면 모두에게 표시
      if (!item.roles) return true;

      return false;
    });
  };

  const visibleNavItems = getVisibleNavItems();

  return (
    <Box
      component="header"
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        py: 1.5,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* 로고 */}
          <Box
            onClick={() => router.push('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
            }}
          >
            {/* 하늘과 구름 로고 */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                background: 'linear-gradient(180deg, #4FC3F7 0%, #81D4FA 50%, #B3E5FC 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(79, 195, 247, 0.4)',
              }}
            >
              {/* 구름 */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 28,
                  height: 12,
                  bgcolor: 'white',
                  borderRadius: '12px 12px 4px 4px',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    width: 12,
                    height: 12,
                    bgcolor: 'white',
                    borderRadius: '50%',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 2,
                    right: 6,
                    width: 10,
                    height: 10,
                    bgcolor: 'white',
                    borderRadius: '50%',
                  },
                }}
              />
              {/* 태양 */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 10,
                  height: 10,
                  bgcolor: '#FFD54F',
                  borderRadius: '50%',
                  boxShadow: '0 0 6px #FFD54F',
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0288D1 0%, #01579B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              스카이동행
            </Typography>
          </Box>

          {/* 데스크톱 네비게이션 */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {visibleNavItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    color: '#1A1A2E',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(2, 136, 209, 0.08)',
                      color: '#0288D1',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* 우측 영역 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* 전화번호 */}
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 0.5,
                px: 2,
                py: 0.5,
                bgcolor: '#F8FAFC',
                borderRadius: 2,
              }}
            >
              <Phone sx={{ fontSize: 16, color: '#0288D1' }} />
              <Typography variant="body2" fontWeight={500} color="#5A6A7A">
                1588-0000
              </Typography>
            </Box>

            {/* 인증 버튼 */}
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.5,
                    bgcolor: '#E3F2FD',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="#0288D1">
                    {user?.name}님
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => router.push('/mypage')}
                  sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    color: '#5A6A7A',
                    '&:hover': { color: '#0288D1' },
                  }}
                >
                  마이페이지
                </Button>
                <Button
                  size="small"
                  onClick={handleLogout}
                  sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                    color: '#94A3B8',
                    '&:hover': { color: '#E53935' },
                  }}
                >
                  로그아웃
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button
                  size="small"
                  onClick={openLoginModal}
                  sx={{
                    color: '#5A6A7A',
                    fontWeight: 500,
                    '&:hover': { color: '#0288D1' },
                  }}
                >
                  로그인
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => router.push('/register')}
                  sx={{
                    borderRadius: 2,
                    px: 2.5,
                    boxShadow: '0 2px 8px rgba(2, 136, 209, 0.3)',
                  }}
                >
                  회원가입
                </Button>
              </Box>
            )}

            {/* 모바일 메뉴 버튼 */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{
                  bgcolor: '#F8FAFC',
                  '&:hover': { bgcolor: '#E3F2FD' },
                }}
              >
                <Menu sx={{ color: '#0288D1' }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Container>

      {/* 모바일 드로어 메뉴 */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              메뉴
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {isAuthenticated && (
            <Box sx={{ bgcolor: '#F5F3EF', p: 2, borderRadius: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                안녕하세요,
              </Typography>
              <Typography fontWeight={600}>
                {user?.name}님
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === 'companion' ? '동행인' : '고객'}
              </Typography>
            </Box>
          )}

          <List>
            {visibleNavItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton onClick={() => handleNavClick(item.path)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}

            {isAuthenticated ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavClick('/mypage')}>
                    <ListItemText primary="마이페이지" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ListItemText primary="로그아웃" sx={{ color: 'error.main' }} />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLoginModal();
                    }}
                  >
                    <ListItemText primary="로그인" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/register');
                    }}
                  >
                    <ListItemText
                      primary="회원가입"
                      primaryTypographyProps={{ color: 'primary.main', fontWeight: 600 }}
                    />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>

          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E5E5E5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                1588-0000
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
