'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

import {
  AccessTime,
  CalendarMonth,
  CheckCircle,
  EventAvailable,
  KeyboardArrowDown,
  KeyboardArrowUp,
  LocalHospital,
  Person,
  Phone,
  Star,
  TrendingUp,
  Sort,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import UISizeControl from '@/components/common/UISizeControl';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

// 오늘 날짜 기준 샘플 데이터 생성
const generateSampleReservations = () => {
  const today = new Date();
  return [
    {
      id: '1',
      customerName: '김영희',
      customerPhone: '010-1234-5678',
      date: format(today, 'yyyy-MM-dd'),
      time: '14:00',
      estimatedHours: 3,
      serviceType: 'full_care',
      hospital: '서울대학교병원',
      department: '내과',
      status: 'confirmed',
      memo: '휠체어 이용, 보호자 연락처: 010-9999-8888',
    },
    {
      id: '2',
      customerName: '이순자',
      customerPhone: '010-2345-6789',
      date: format(addDays(today, 1), 'yyyy-MM-dd'),
      time: '09:00',
      estimatedHours: 4,
      serviceType: 'hospital_care',
      hospital: '세브란스병원',
      department: '정형외과',
      status: 'confirmed',
      memo: '정기 검진',
    },
    {
      id: '3',
      customerName: '박철수',
      customerPhone: '010-3456-7890',
      date: format(addDays(today, 2), 'yyyy-MM-dd'),
      time: '10:30',
      estimatedHours: 2,
      serviceType: 'special_care',
      hospital: '삼성서울병원',
      department: '건강검진센터',
      status: 'pending',
      memo: '건강검진 동행',
    },
    {
      id: '4',
      customerName: '최영수',
      customerPhone: '010-4567-8901',
      date: format(addDays(today, 3), 'yyyy-MM-dd'),
      time: '13:00',
      estimatedHours: 3,
      serviceType: 'full_care',
      hospital: '아산병원',
      department: '심장내과',
      status: 'confirmed',
      memo: '',
    },
    {
      id: '5',
      customerName: '정미영',
      customerPhone: '010-5678-9012',
      date: format(addDays(today, 5), 'yyyy-MM-dd'),
      time: '11:00',
      estimatedHours: 2,
      serviceType: 'hospital_care',
      hospital: '강남세브란스병원',
      department: '피부과',
      status: 'pending',
      memo: '첫 방문 고객',
    },
  ];
};

const SERVICE_TYPE_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  full_care: { label: '풀케어', color: '#0288D1', bgColor: '#E3F2FD' },
  hospital_care: { label: '병원케어', color: '#7C3AED', bgColor: '#EDE9FE' },
  special_care: { label: '특화케어', color: '#D97706', bgColor: '#FEF3C7' },
};

const STATUS_CONFIG: Record<string, { label: string; color: 'warning' | 'success' | 'error' | 'default' | 'info' }> = {
  pending: { label: '수락 대기', color: 'warning' },
  confirmed: { label: '예약 확정', color: 'success' },
  in_progress: { label: '진행중', color: 'info' },
  completed: { label: '완료', color: 'default' },
  cancelled: { label: '취소됨', color: 'error' },
};

type SortOption = 'date_asc' | 'date_desc' | 'time_asc' | 'status';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_asc', label: '날짜 가까운 순' },
  { value: 'date_desc', label: '날짜 먼 순' },
  { value: 'time_asc', label: '시간 빠른 순' },
  { value: 'status', label: '상태별' },
];

export default function CompanionDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const scale = useSettingsStore((state) => state.getScale());

  const [reservations] = useState(generateSampleReservations);
  const [sortBy, setSortBy] = useState<SortOption>('date_asc');
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.role !== 'companion') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // 정렬된 예약 목록
  const sortedReservations = useMemo(() => {
    const sorted = [...reservations];

    switch (sortBy) {
      case 'date_asc':
        return sorted.sort((a, b) => {
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateCompare === 0) {
            return a.time.localeCompare(b.time);
          }
          return dateCompare;
        });
      case 'date_desc':
        return sorted.sort((a, b) => {
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateCompare === 0) {
            return a.time.localeCompare(b.time);
          }
          return dateCompare;
        });
      case 'time_asc':
        return sorted.sort((a, b) => a.time.localeCompare(b.time));
      case 'status':
        const statusOrder = { pending: 0, confirmed: 1, in_progress: 2, completed: 3, cancelled: 4 };
        return sorted.sort((a, b) => statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]);
      default:
        return sorted;
    }
  }, [reservations, sortBy]);

  // 날짜 표시 헬퍼
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return '오늘';
    if (isTomorrow(date)) return '내일';
    const days = differenceInDays(date, new Date());
    if (days > 0 && days <= 7) return `${days}일 후`;
    return format(date, 'M월 d일 (EEE)', { locale: ko });
  };

  // 날짜 강조 색상
  const getDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return '#D32F2F';
    if (isTomorrow(date)) return '#F57C00';
    return 'text.primary';
  };

  if (!isAuthenticated || user?.role !== 'companion') {
    return null;
  }

  const stats = {
    totalServices: 47,
    thisMonth: 8,
    rating: 4.8,
    responseRate: 95,
  };

  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const todayCount = reservations.filter(r => isToday(new Date(r.date))).length;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Breadcrumb
            items={[
              { label: '마이페이지', href: '/mypage' },
              { label: '대시보드' },
            ]}
            backHref="/mypage"
          />
          <UISizeControl />
        </Box>

        {/* 환영 메시지 */}
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            background: 'linear-gradient(135deg, #0288D1 0%, #01579B 100%)',
            color: 'white',
            borderRadius: 3,
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1, fontSize: `${1.8 * scale}rem` }}>
                안녕하세요, {user?.name}님! 👋
              </Typography>
              <Typography sx={{ opacity: 0.95, fontSize: `${1.1 * scale}rem`, lineHeight: 1.8 }}>
                오늘 하루도 화이팅이에요! 🌟
                <br />
                따뜻한 동행으로 고객분들께 큰 힘이 되어주세요.
              </Typography>

              {/* 오늘의 알림 */}
              {(todayCount > 0 || pendingCount > 0) && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {todayCount > 0 && (
                    <Chip
                      icon={<EventAvailable sx={{ color: 'white !important' }} />}
                      label={`오늘 예약 ${todayCount}건`}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: `${0.9 * scale}rem`,
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                  )}
                  {pendingCount > 0 && (
                    <Chip
                      label={`수락 대기 ${pendingCount}건`}
                      sx={{
                        bgcolor: '#FFC107',
                        color: '#333',
                        fontWeight: 600,
                        fontSize: `${0.9 * scale}rem`,
                      }}
                    />
                  )}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/companion/schedule')}
                startIcon={<CalendarMonth />}
                sx={{
                  bgcolor: 'white',
                  color: '#0288D1',
                  fontSize: `${1 * scale}rem`,
                  py: 1.5,
                  px: 3,
                  '&:hover': { bgcolor: '#F5F5F5' },
                }}
              >
                스케줄 관리
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* 통계 카드 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { icon: <CheckCircle />, label: '총 동행 횟수', value: stats.totalServices, unit: '건', color: '#0288D1', desc: '지금까지 함께한 동행' },
            { icon: <CalendarMonth />, label: '이번 달 동행', value: stats.thisMonth, unit: '건', color: '#00897B', desc: '이번 달 완료 + 예정' },
            { icon: <Star />, label: '고객 평점', value: stats.rating, unit: '점', color: '#FFC107', desc: '고객님들의 평가' },
            { icon: <TrendingUp />, label: '응답률', value: stats.responseRate, unit: '%', color: '#43A047', desc: '예약 요청 응답률' },
          ].map((stat, i) => (
            <Grid item xs={6} md={3} key={i}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.85 * scale}rem` }}>
                      {stat.label}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} sx={{ fontSize: `${1.8 * scale}rem` }}>
                    {stat.value}
                    <Typography component="span" variant="body1" color="text.secondary" sx={{ fontSize: `${1 * scale}rem`, ml: 0.5 }}>
                      {stat.unit}
                    </Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.75 * scale}rem` }}>
                    {stat.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 예정된 예약 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ fontSize: `${1.4 * scale}rem` }}>
              📋 예정된 예약
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem`, mt: 0.5 }}>
              가까운 날짜순으로 정렬되어 있어요. 예약을 클릭하면 상세 정보를 볼 수 있어요.
            </Typography>
          </Box>

          {/* 정렬 버튼 */}
          <Button
            variant="outlined"
            startIcon={<Sort />}
            onClick={(e) => setSortMenuAnchor(e.currentTarget)}
            sx={{ fontSize: `${0.9 * scale}rem` }}
          >
            {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
          </Button>
          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={() => setSortMenuAnchor(null)}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                selected={sortBy === option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setSortMenuAnchor(null);
                }}
                sx={{ fontSize: `${0.95 * scale}rem` }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {sortedReservations.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ fontSize: `${1.1 * scale}rem` }}>
              아직 예정된 예약이 없어요. 😊
              <br />
              스케줄을 등록하면 고객님들의 예약을 받을 수 있어요!
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/companion/schedule')}
              sx={{ mt: 2, fontSize: `${1 * scale}rem` }}
            >
              스케줄 등록하기
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sortedReservations.map((reservation) => {
              const isExpanded = expandedCard === reservation.id;
              const serviceConfig = SERVICE_TYPE_LABELS[reservation.serviceType];
              const statusConfig = STATUS_CONFIG[reservation.status];

              return (
                <Card
                  key={reservation.id}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isToday(new Date(reservation.date)) ? '2px solid #0288D1' : '1px solid #E0E0E0',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                    },
                  }}
                  onClick={() => setExpandedCard(isExpanded ? null : reservation.id)}
                >
                  <CardContent sx={{ pb: isExpanded ? 2 : '16px !important' }}>
                    {/* 메인 정보 */}
                    <Grid container spacing={2} alignItems="center">
                      {/* 날짜/시간 */}
                      <Grid item xs={12} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              bgcolor: isToday(new Date(reservation.date)) ? '#0288D1' : '#F5F5F5',
                              color: isToday(new Date(reservation.date)) ? 'white' : 'text.primary',
                              borderRadius: 2,
                              p: 1.5,
                              textAlign: 'center',
                              minWidth: 60,
                            }}
                          >
                            <Typography variant="caption" sx={{ fontSize: `${0.7 * scale}rem`, display: 'block' }}>
                              {format(new Date(reservation.date), 'M월', { locale: ko })}
                            </Typography>
                            <Typography fontWeight={700} sx={{ fontSize: `${1.3 * scale}rem` }}>
                              {format(new Date(reservation.date), 'd')}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: `${0.7 * scale}rem` }}>
                              {format(new Date(reservation.date), 'EEE', { locale: ko })}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              fontWeight={700}
                              sx={{ color: getDateColor(reservation.date), fontSize: `${1.1 * scale}rem` }}
                            >
                              {getDateLabel(reservation.date)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ fontSize: `${0.95 * scale}rem` }}>
                                {reservation.time} ({reservation.estimatedHours}시간)
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>

                      {/* 고객 정보 */}
                      <Grid item xs={6} sm={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: '#E3F2FD', color: '#0288D1', width: 36, height: 36 }}>
                            <Person sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600} sx={{ fontSize: `${1 * scale}rem` }}>
                              {reservation.customerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.8 * scale}rem` }}>
                              고객님
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* 병원 정보 */}
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalHospital sx={{ fontSize: 20, color: 'text.secondary' }} />
                          <Box>
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ fontSize: `${0.95 * scale}rem` }}>
                              {reservation.hospital}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.8 * scale}rem` }}>
                              {reservation.department}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* 서비스 타입 */}
                      <Grid item xs={6} sm={2}>
                        <Chip
                          label={serviceConfig.label}
                          size="small"
                          sx={{
                            bgcolor: serviceConfig.bgColor,
                            color: serviceConfig.color,
                            fontWeight: 600,
                            fontSize: `${0.85 * scale}rem`,
                          }}
                        />
                      </Grid>

                      {/* 상태 + 확장 버튼 */}
                      <Grid item xs={6} sm={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Chip
                          label={statusConfig.label}
                          color={statusConfig.color}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: `${0.85 * scale}rem` }}
                        />
                        <IconButton size="small">
                          {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </Grid>
                    </Grid>

                    {/* 확장된 상세 정보 */}
                    {isExpanded && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, fontSize: `${0.95 * scale}rem` }}>
                                📞 연락처 정보
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography sx={{ fontSize: `${1 * scale}rem` }}>
                                  {reservation.customerPhone}
                                </Typography>
                                <Tooltip title="전화걸기">
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    href={`tel:${reservation.customerPhone}`}
                                    sx={{ ml: 'auto', fontSize: `${0.85 * scale}rem` }}
                                  >
                                    전화
                                  </Button>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ bgcolor: '#FFF8E1', p: 2, borderRadius: 2, height: '100%' }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: `${0.95 * scale}rem` }}>
                                📝 메모
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
                                {reservation.memo || '등록된 메모가 없어요.'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* 액션 버튼 */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
                          {reservation.status === 'pending' && (
                            <>
                              <Button
                                variant="outlined"
                                color="error"
                                sx={{ fontSize: `${0.9 * scale}rem` }}
                              >
                                거절하기
                              </Button>
                              <Button
                                variant="contained"
                                color="success"
                                sx={{ fontSize: `${0.9 * scale}rem` }}
                              >
                                수락하기
                              </Button>
                            </>
                          )}
                          {reservation.status === 'confirmed' && (
                            <Button
                              variant="contained"
                              sx={{ fontSize: `${0.9 * scale}rem` }}
                            >
                              상세 보기
                            </Button>
                          )}
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {/* 이번 달 성과 */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3, fontSize: `${1.2 * scale}rem` }}>
            📊 이번 달 성과
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: `${0.95 * scale}rem` }}>
                    목표 달성률 (10건 목표)
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: `${0.95 * scale}rem` }}>
                    80%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={80}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.8 * scale}rem`, mt: 0.5, display: 'block' }}>
                  조금만 더 화이팅! 목표까지 2건 남았어요 💪
                </Typography>
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: `${0.95 * scale}rem` }}>
                    고객 만족도
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: `${0.95 * scale}rem` }}>
                    96%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={96}
                  sx={{ height: 10, borderRadius: 5 }}
                  color="success"
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.8 * scale}rem`, mt: 0.5, display: 'block' }}>
                  정말 훌륭해요! 고객분들이 만족하고 계세요 ⭐
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: '#F0FDF4', p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: `${0.9 * scale}rem` }}>
                  💰 예상 수익 (이번 달)
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main" sx={{ fontSize: `${2 * scale}rem` }}>
                  840,000원
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: `${0.85 * scale}rem` }}>
                  📅 정산 예정일: 다음 달 10일
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.8 * scale}rem` }}>
                  * 정산금은 등록하신 계좌로 자동 입금됩니다.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 도움말 */}
        <Paper sx={{ p: 3, mt: 3, bgcolor: '#E3F2FD' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, fontSize: `${1 * scale}rem` }}>
            💡 도움이 필요하신가요?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
            예약 관련 문의나 긴급 상황 발생 시 고객센터 <strong>1588-0000</strong>으로 연락해주세요.
            <br />
            평일 09:00 ~ 18:00 운영 (공휴일 제외)
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
