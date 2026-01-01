'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import {
  AccountCircle,
  ArrowBack,
  CalendarMonth,
  Campaign,
  CreditCard,
  LocalOffer,
  LocationOn,
  Notifications,
  Security,
  Verified,
} from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import UISizeControl from '@/components/common/UISizeControl';
import { useSettingsStore } from '@/stores/settingsStore';
import { Button } from '@mui/material';

interface SettingItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

const SETTING_ITEMS: SettingItem[] = [
  {
    icon: <AccountCircle sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: '프로필 관리',
    description: '이름, 소개, 사진 등 프로필 정보를 수정합니다.',
    href: '/companion/settings/profile',
  },
  {
    icon: <LocalOffer sx={{ fontSize: 40, color: 'warning.main' }} />,
    title: '할인/프로모션 설정',
    description: '신규 할인, 첫 이용 할인 등 프로모션을 관리합니다.',
    href: '/companion/settings/promotions',
    badge: 'HOT',
  },
  {
    icon: <LocationOn sx={{ fontSize: 40, color: 'success.main' }} />,
    title: '서비스 지역 설정',
    description: '서비스 가능한 지역을 설정합니다.',
    href: '/companion/settings/areas',
  },
  {
    icon: <CalendarMonth sx={{ fontSize: 40, color: 'info.main' }} />,
    title: '일정 관리',
    description: '서비스 가능 시간과 휴무일을 설정합니다.',
    href: '/companion/schedule',
  },
  {
    icon: <Verified sx={{ fontSize: 40, color: 'secondary.main' }} />,
    title: '자격증 관리',
    description: '보유 자격증을 등록하고 인증을 요청합니다.',
    href: '/companion/settings/certifications',
  },
  {
    icon: <CreditCard sx={{ fontSize: 40, color: 'error.main' }} />,
    title: '정산 정보',
    description: '정산 받을 계좌 정보를 관리합니다.',
    href: '/companion/settings/payment',
  },
  {
    icon: <Notifications sx={{ fontSize: 40, color: 'warning.main' }} />,
    title: '알림 설정',
    description: '예약 알림, 메시지 알림 등을 설정합니다.',
    href: '/companion/settings/notifications',
  },
  {
    icon: <Security sx={{ fontSize: 40, color: 'text.secondary' }} />,
    title: '보안 설정',
    description: '비밀번호 변경, 2단계 인증을 설정합니다.',
    href: '/companion/settings/security',
  },
];

export default function CompanionSettingsPage() {
  const router = useRouter();
  const scale = useSettingsStore((state) => state.getScale());

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push('/companion/dashboard')}
              sx={{ fontSize: `${0.95 * scale}rem` }}
            >
              대시보드로
            </Button>
          </Box>
          <UISizeControl />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1, fontSize: `${1.5 * scale}rem` }}>
            ⚙️ 동행인 설정
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem` }}>
            동행인 활동에 필요한 정보와 설정을 관리하세요.
          </Typography>
        </Box>

        {/* 설정 메뉴 */}
        <Grid container spacing={3}>
          {SETTING_ITEMS.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {item.badge && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'error.main',
                      color: 'white',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      fontSize: `${0.7 * scale}rem`,
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </Box>
                )}
                <CardActionArea
                  onClick={() => router.push(item.href)}
                  sx={{ height: '100%', p: 0 }}
                >
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>{item.icon}</Box>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1, fontSize: `${1.1 * scale}rem` }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 도움말 */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: '#FFF8E1' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Campaign sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: `${1 * scale}rem` }}>
              💡 동행인 활동 팁
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem`, lineHeight: 1.8 }}>
            • <strong>프로모션을 설정</strong>하면 더 많은 고객을 유치할 수 있어요! 신규 동행인 할인이 효과적이에요.
            <br />
            • <strong>프로필을 상세하게</strong> 작성하면 고객의 신뢰도가 높아져요.
            <br />
            • <strong>자격증을 인증</strong>받으면 프로필에 인증 뱃지가 표시됩니다.
            <br />
            • <strong>일정을 정확히</strong> 설정하면 예약 충돌을 방지할 수 있어요.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
