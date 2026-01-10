'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Close, Menu as MenuIcon, Phone } from '@mui/icons-material';
import * as MuiIcons from '@mui/icons-material';
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
import { useMainMenus, useHeaderUtilityMenus } from '@/hooks';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import type { Menu } from '@/types/menu';

// MUI 아이콘 동적 로딩 헬퍼
const getIcon = (iconName: string | null | undefined) => {
  if (!iconName) return null;
  const Icon = (MuiIcons as any)[iconName];
  return Icon ? <Icon sx={{ fontSize: 20 }} /> : null;
};

export default function Header() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const { isFeatureEnabled } = useFeatureFlags();

  // 메뉴 데이터 로드
  const { menus: mainMenus, isLoading: mainMenusLoading } = useMainMenus('user');
  const { menus: utilityMenus, isLoading: utilityMenusLoading } = useHeaderUtilityMenus();

  // 홈 메뉴 찾기 (menu_code가 'home', 'Home', 'HOME' 중 하나)
  const homeMenu = mainMenus.find((menu) =>
    menu.depth === 0 && ['home', 'Home', 'HOME'].includes(menu.menu_code)
  );

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleUtilityMenuClick = (menu: Menu) => {
    if (menu.link_type === 'none') {
      // 로그아웃과 같은 액션
      if (menu.menu_code === 'logout') {
        handleLogout();
      }
    } else if (menu.link_url) {
      if (menu.link_type === 'new_window') {
        window.open(menu.link_url, '_blank');
      } else {
        handleNavClick(menu.link_url);
      }
    }
  };

  // 권한 및 기능 플래그에 따라 메뉴 필터링
  const getVisibleMenus = (menus: Menu[]) => {
    return menus.filter((menu) => {
      // is_visible 체크: 숨김 처리된 메뉴는 표시하지 않음
      if (!menu.is_visible) {
        return false;
      }

      // Feature Flag 체크: feature_key가 있으면 해당 기능이 활성화되어 있어야 함
      if (menu.feature_key) {
        if (!isFeatureEnabled(menu.feature_key)) {
          return false; // 기능이 비활성화되어 있으면 메뉴 숨김
        }
      }

      // 권한 타입에 따른 필터링
      switch (menu.permission_type) {
        case 'public':
          return true;
        case 'member':
          return isAuthenticated;
        case 'admin':
          return user?.role === 'admin';
        case 'roles':
          // role 기반 필터링 (추가 구현 필요 시)
          return isAuthenticated;
        default:
          return true;
      }
    });
  };

  // 홈 메뉴를 제외한 메뉴만 표시
  const visibleMainMenus = getVisibleMenus(mainMenus).filter(
    (menu) => !['home', 'Home', 'HOME'].includes(menu.menu_code)
  );
  const visibleUtilityMenus = getVisibleMenus(utilityMenus);

  // 로그인/로그아웃 메뉴 분리
  const authMenus = visibleUtilityMenus.filter((menu) =>
    ['login', 'register', 'logout', 'mypage_icon'].includes(menu.menu_code)
  );

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
            onClick={() => {
              const targetPath = homeMenu?.link_url || '/';
              router.push(targetPath);
            }}
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
          {!isMobile && !mainMenusLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {visibleMainMenus.map((menu) => (
                <Button
                  key={menu.id}
                  onClick={() => menu.link_url && handleNavClick(menu.link_url)}
                  startIcon={getIcon(menu.icon)}
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
                  {menu.menu_name}
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
            {!utilityMenusLoading && (
              <>
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
                    {authMenus
                      .filter((menu) => menu.permission_type === 'member')
                      .map((menu) => (
                        <Button
                          key={menu.id}
                          size="small"
                          onClick={() => handleUtilityMenuClick(menu)}
                          startIcon={getIcon(menu.icon)}
                          sx={{
                            display: { xs: 'none', md: 'inline-flex' },
                            color: menu.menu_code === 'logout' ? '#94A3B8' : '#5A6A7A',
                            '&:hover': {
                              color: menu.menu_code === 'logout' ? '#E53935' : '#0288D1',
                            },
                          }}
                        >
                          {menu.menu_name}
                        </Button>
                      ))}
                  </Box>
                ) : (
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                    {authMenus
                      .filter((menu) => menu.permission_type === 'public')
                      .map((menu) => (
                        <Button
                          key={menu.id}
                          size="small"
                          variant={menu.menu_code === 'register' ? 'contained' : 'text'}
                          onClick={() => {
                            if (menu.menu_code === 'login') {
                              openLoginModal();
                            } else if (menu.link_url) {
                              handleNavClick(menu.link_url);
                            }
                          }}
                          startIcon={getIcon(menu.icon)}
                          sx={{
                            ...(menu.menu_code === 'register'
                              ? {
                                  borderRadius: 2,
                                  px: 2.5,
                                  boxShadow: '0 2px 8px rgba(2, 136, 209, 0.3)',
                                }
                              : {
                                  color: '#5A6A7A',
                                  fontWeight: 500,
                                  '&:hover': { color: '#0288D1' },
                                }),
                          }}
                        >
                          {menu.menu_name}
                        </Button>
                      ))}
                  </Box>
                )}
              </>
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
                <MenuIcon sx={{ color: '#0288D1' }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Container>

      {/* 모바일 드로어 메뉴 */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
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
              <Typography fontWeight={600}>{user?.name}님</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === 'companion' ? '동행인' : '고객'}
              </Typography>
            </Box>
          )}

          <List>
            {/* 메인 메뉴 */}
            {!mainMenusLoading &&
              visibleMainMenus.map((menu) => (
                <ListItem key={menu.id} disablePadding>
                  <ListItemButton onClick={() => menu.link_url && handleNavClick(menu.link_url)}>
                    {getIcon(menu.icon) && (
                      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                        {getIcon(menu.icon)}
                      </Box>
                    )}
                    <ListItemText primary={menu.menu_name} />
                  </ListItemButton>
                </ListItem>
              ))}

            {/* 유틸리티 메뉴 */}
            {!utilityMenusLoading &&
              authMenus.map((menu) => {
                // 권한에 따라 필터링
                if (
                  (menu.permission_type === 'public' && isAuthenticated) ||
                  (menu.permission_type === 'member' && !isAuthenticated)
                ) {
                  return null;
                }

                return (
                  <ListItem key={menu.id} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        if (menu.menu_code === 'login') {
                          setMobileMenuOpen(false);
                          openLoginModal();
                        } else {
                          handleUtilityMenuClick(menu);
                        }
                      }}
                    >
                      {getIcon(menu.icon) && (
                        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                          {getIcon(menu.icon)}
                        </Box>
                      )}
                      <ListItemText
                        primary={menu.menu_name}
                        primaryTypographyProps={{
                          ...(menu.menu_code === 'register' && {
                            color: 'primary.main',
                            fontWeight: 600,
                          }),
                          ...(menu.menu_code === 'logout' && { color: 'error.main' }),
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
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
