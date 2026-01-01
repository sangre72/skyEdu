'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  AccessTime,
  CalendarMonth,
  ChevronRight,
  LocalHospital,
  Person,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuthStore } from '@/stores/authStore';

// 샘플 예약 데이터
const SAMPLE_RESERVATIONS = [
  {
    id: '1',
    companionName: '김간호',
    companionRating: 4.9,
    date: '2025-01-05',
    time: '09:00',
    serviceType: 'full_care',
    hospital: '서울대학교병원',
    department: '내과',
    status: 'confirmed',
    price: 105000,
  },
  {
    id: '2',
    companionName: '이요양',
    companionRating: 4.7,
    date: '2025-01-10',
    time: '14:00',
    serviceType: 'hospital_care',
    hospital: '세브란스병원',
    department: '정형외과',
    status: 'pending',
    price: 75000,
  },
  {
    id: '3',
    companionName: '박복지',
    companionRating: 4.8,
    date: '2024-12-20',
    time: '10:30',
    serviceType: 'full_care',
    hospital: '삼성서울병원',
    department: '건강검진센터',
    status: 'completed',
    price: 140000,
  },
  {
    id: '4',
    companionName: '최간호',
    companionRating: 4.6,
    date: '2024-12-15',
    time: '11:00',
    serviceType: 'hospital_care',
    hospital: '서울아산병원',
    department: '외과',
    status: 'completed',
    price: 50000,
  },
];

const SERVICE_TYPE_LABELS: Record<string, string> = {
  full_care: '풀케어',
  hospital_care: '병원케어',
  special_care: '특화케어',
};

const STATUS_CONFIG: Record<string, { label: string; color: 'warning' | 'success' | 'error' | 'default' | 'info' }> = {
  pending: { label: '대기중', color: 'warning' },
  confirmed: { label: '확정', color: 'info' },
  in_progress: { label: '진행중', color: 'success' },
  completed: { label: '완료', color: 'default' },
  cancelled: { label: '취소', color: 'error' },
};

export default function MyReservationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const upcomingReservations = SAMPLE_RESERVATIONS.filter(
    (r) => r.status === 'pending' || r.status === 'confirmed' || r.status === 'in_progress'
  );
  const pastReservations = SAMPLE_RESERVATIONS.filter(
    (r) => r.status === 'completed' || r.status === 'cancelled'
  );

  const displayedReservations = tab === 0 ? upcomingReservations : pastReservations;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumb
          items={[
            { label: '마이페이지', href: '/mypage' },
            { label: '예약 내역' },
          ]}
          backHref="/mypage"
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            예약 내역
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/reservation/new')}
          >
            새 예약
          </Button>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`예정된 예약 (${upcomingReservations.length})`} />
          <Tab label={`지난 예약 (${pastReservations.length})`} />
        </Tabs>

        {displayedReservations.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {tab === 0 ? '예정된 예약이 없습니다.' : '지난 예약이 없습니다.'}
            </Typography>
            {tab === 0 && (
              <Button variant="outlined" onClick={() => router.push('/reservation/new')}>
                예약하기
              </Button>
            )}
          </Card>
        ) : (
          <Grid container spacing={2}>
            {displayedReservations.map((reservation) => (
              <Grid item xs={12} key={reservation.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#E3F2FD', color: '#0288D1' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={600}>{reservation.companionName}</Typography>
                            <Chip
                              label={`★ ${reservation.companionRating}`}
                              size="small"
                              sx={{ bgcolor: '#FFF8E1', color: '#F57C00', height: 22 }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            동행 매니저
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={STATUS_CONFIG[reservation.status].label}
                        color={STATUS_CONFIG[reservation.status].color}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2, mb: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">{reservation.date}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">{reservation.time}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Chip
                            label={SERVICE_TYPE_LABELS[reservation.serviceType]}
                            size="small"
                            sx={{ bgcolor: '#E3F2FD', color: '#0288D1' }}
                          />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {reservation.price.toLocaleString()}원
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocalHospital sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {reservation.hospital} · {reservation.department}
                        </Typography>
                      </Box>
                      <ChevronRight sx={{ color: 'text.secondary' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
