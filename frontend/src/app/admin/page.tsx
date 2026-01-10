'use client';

import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import {
  Assignment,
  Group,
  LocalHospital,
  Payment,
  Reviews,
  Settings,
  TrendingUp,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface AdminMenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const menuItems: AdminMenuItem[] = [
  {
    title: '시스템 관리',
    description: '기능 on/off, 시스템 설정',
    icon: <Settings fontSize="large" />,
    path: '/admin/system',
    color: '#2563EB',
  },
  {
    title: '회원 관리',
    description: '고객/매니저 관리',
    icon: <Group fontSize="large" />,
    path: '/admin/users',
    color: '#10B981',
  },
  {
    title: '예약 관리',
    description: '예약 현황 및 매칭',
    icon: <Assignment fontSize="large" />,
    path: '/admin/reservations',
    color: '#F59E0B',
  },
  {
    title: '매니저 승인',
    description: '매니저 가입 승인',
    icon: <LocalHospital fontSize="large" />,
    path: '/admin/managers',
    color: '#7C3AED',
  },
  {
    title: '결제/정산',
    description: '결제 내역 및 정산',
    icon: <Payment fontSize="large" />,
    path: '/admin/payments',
    color: '#EF4444',
  },
  {
    title: '리뷰 관리',
    description: '리뷰 관리 및 신고',
    icon: <Reviews fontSize="large" />,
    path: '/admin/reviews',
    color: '#06B6D4',
  },
  {
    title: '통계',
    description: '대시보드 및 통계',
    icon: <TrendingUp fontSize="large" />,
    path: '/admin/stats',
    color: '#8B5CF6',
  },
];

export default function AdminPage() {
  const router = useRouter();

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        대시보드
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        관리자 메뉴를 선택하세요.
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.path}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => router.push(item.path)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    color: item.color,
                  }}
                >
                  {item.icon}
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ ml: 1 }}
                  >
                    {item.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
