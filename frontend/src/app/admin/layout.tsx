'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings,
  Group,
  Assignment,
  LocalHospital,
  Payment,
  Reviews,
  TrendingUp,
  ExitToApp,
  ViewList,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '@/hooks';

const DRAWER_WIDTH = 240;

const adminMenuItems = [
  { title: '시스템 관리', icon: <Settings />, path: '/admin/system' },
  { title: '메뉴 관리', icon: <ViewList />, path: '/admin/menus' },
  { title: '회원 관리', icon: <Group />, path: '/admin/users' },
  { title: '유저 그룹', icon: <Group />, path: '/admin/groups' },
  { title: '예약 관리', icon: <Assignment />, path: '/admin/reservations' },
  { title: '매니저 승인', icon: <LocalHospital />, path: '/admin/managers' },
  { title: '결제/정산', icon: <Payment />, path: '/admin/payments' },
  { title: '리뷰 관리', icon: <Reviews />, path: '/admin/reviews' },
  { title: '통계', icon: <TrendingUp />, path: '/admin/stats' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // 개발 모드: 권한 체크 비활성화
  const isDevelopment = process.env.NODE_ENV === 'development';

  // 관리자 권한 체크 (프로덕션에만 적용)
  useEffect(() => {
    if (!isDevelopment && user && !isAdmin) {
      alert('관리자만 접근할 수 있습니다.');
      router.push('/');
    }
  }, [user, isAdmin, router, isDevelopment]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          관리자 패널
        </Typography>
      </Toolbar>
      <List>
        {adminMenuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton onClick={() => router.push(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // 로그인 안되어 있거나 권한 없으면 로딩 (개발 모드에서는 스킵)
  if (!isDevelopment && (!user || !isAdmin)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Typography>권한을 확인하는 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: '#1976d2',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            스카이동행 관리자
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
