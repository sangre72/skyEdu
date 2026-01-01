'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

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
  LinearProgress,
  Paper,
  Rating,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  CalendarMonth,
  CheckCircle,
  DirectionsCar,
  EmojiEvents,
  Favorite,
  LocalHospital,
  LocationOn,
  Person,
  Schedule,
  Star,
  TrendingUp,
  Verified,
  WorkHistory,
} from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import UISizeControl from '@/components/common/UISizeControl';
import { PROVINCES, DISTRICTS } from '@/lib/constants';
import { useSettingsStore } from '@/stores/settingsStore';

// 동행인 블로그 데이터 (서비스 이력, 통계 등)
interface ServiceHistory {
  id: string;
  date: string;
  serviceType: 'full_care' | 'hospital_care' | 'special_care';
  hospitalName: string;
  hospitalDepartment: string;
  duration: number; // 시간
  customerName: string; // 익명화된 이름
  rating?: number;
  review?: string;
  tags: string[];
}

interface CompanionBlog {
  id: string;
  name: string;
  profileImage?: string;
  introduction: string;
  joinedAt: string;
  isVerified: boolean;
  totalServices: number;
  totalHours: number;
  rating: number;
  totalReviews: number;
  badges: { icon: string; name: string; description: string }[];
  monthlyStats: { month: string; services: number }[];
  serviceTypeStats: { type: string; count: number; percentage: number }[];
  specialtyStats: { name: string; count: number }[];
  recentServices: ServiceHistory[];
  isNew?: boolean;
  discount?: { type: 'percent' | 'fixed'; value: number; description: string; validUntil?: string };
}

const SERVICE_TYPE_LABELS: Record<string, { label: string; color: 'primary' | 'secondary' | 'success' }> = {
  full_care: { label: '풀케어', color: 'primary' },
  hospital_care: { label: '병원케어', color: 'secondary' },
  special_care: { label: '특화케어', color: 'success' },
};

// 임시 블로그 데이터
const MOCK_COMPANION_BLOGS: Record<string, CompanionBlog> = {
  '1': {
    id: '1',
    name: '김미영',
    introduction: '15년간 대학병원 간호사로 근무한 경험을 바탕으로 세심하고 따뜻한 동행 서비스를 제공합니다.',
    joinedAt: '2023-06-01',
    isVerified: true,
    totalServices: 127,
    totalHours: 423,
    rating: 4.9,
    totalReviews: 89,
    badges: [
      { icon: '🏆', name: '베스트 동행인', description: '월간 최다 예약 달성' },
      { icon: '⭐', name: '별점 4.9+', description: '평균 별점 4.9 이상' },
      { icon: '💯', name: '100회 돌파', description: '동행 서비스 100회 달성' },
      { icon: '💖', name: '감사 편지', description: '고객 감사 편지 10회 이상' },
    ],
    monthlyStats: [
      { month: '7월', services: 12 },
      { month: '8월', services: 15 },
      { month: '9월', services: 18 },
      { month: '10월', services: 14 },
      { month: '11월', services: 16 },
      { month: '12월', services: 11 },
    ],
    serviceTypeStats: [
      { type: 'full_care', count: 78, percentage: 61 },
      { type: 'hospital_care', count: 34, percentage: 27 },
      { type: 'special_care', count: 15, percentage: 12 },
    ],
    specialtyStats: [
      { name: '내과 진료', count: 45 },
      { name: '건강검진', count: 32 },
      { name: '수술 동행', count: 18 },
      { name: '항암치료', count: 15 },
      { name: '정형외과', count: 12 },
    ],
    recentServices: [
      {
        id: 's1',
        date: '2024-12-28',
        serviceType: 'full_care',
        hospitalName: '서울대학교병원',
        hospitalDepartment: '내과',
        duration: 4,
        customerName: '이*순',
        rating: 5,
        review: '어머니 모시고 갔는데 정말 친절하시고 꼼꼼하게 챙겨주셨어요.',
        tags: ['내과', '정기검진'],
      },
      {
        id: 's2',
        date: '2024-12-26',
        serviceType: 'special_care',
        hospitalName: '삼성서울병원',
        hospitalDepartment: '건강검진센터',
        duration: 6,
        customerName: '박*철',
        rating: 5,
        review: '건강검진 동행으로 처음 이용했는데, 대기 시간 동안 계속 신경 써주셨습니다.',
        tags: ['건강검진', '종합검진'],
      },
      {
        id: 's3',
        date: '2024-12-24',
        serviceType: 'hospital_care',
        hospitalName: '강남세브란스병원',
        hospitalDepartment: '정형외과',
        duration: 3,
        customerName: '김*영',
        rating: 4,
        review: '시간 약속도 잘 지켜주시고, 친절하게 응대해주셨습니다.',
        tags: ['정형외과', '진료동행'],
      },
      {
        id: 's4',
        date: '2024-12-22',
        serviceType: 'full_care',
        hospitalName: '서울아산병원',
        hospitalDepartment: '외과',
        duration: 5,
        customerName: '최*수',
        tags: ['외과', '수술상담'],
      },
      {
        id: 's5',
        date: '2024-12-20',
        serviceType: 'hospital_care',
        hospitalName: '서울대학교병원',
        hospitalDepartment: '내과',
        duration: 2,
        customerName: '정*민',
        rating: 5,
        review: '매번 감사드립니다. 다음에도 꼭 부탁드릴게요.',
        tags: ['내과', '정기진료'],
      },
    ],
  },
  '2': {
    id: '2',
    name: '이순자',
    introduction: '요양보호사 자격증 보유, 어르신 동행 전문입니다.',
    joinedAt: '2023-08-15',
    isVerified: true,
    totalServices: 89,
    totalHours: 312,
    rating: 4.8,
    totalReviews: 62,
    badges: [
      { icon: '👵', name: '어르신 전문', description: '어르신 동행 50회 이상' },
      { icon: '♿', name: '휠체어 동행', description: '휠체어 동행 서비스 전문' },
    ],
    monthlyStats: [
      { month: '7월', services: 10 },
      { month: '8월', services: 12 },
      { month: '9월', services: 14 },
      { month: '10월', services: 11 },
      { month: '11월', services: 13 },
      { month: '12월', services: 8 },
    ],
    serviceTypeStats: [
      { type: 'full_care', count: 65, percentage: 73 },
      { type: 'hospital_care', count: 20, percentage: 22 },
      { type: 'special_care', count: 4, percentage: 5 },
    ],
    specialtyStats: [
      { name: '어르신 동행', count: 52 },
      { name: '휠체어 동행', count: 28 },
      { name: '정기 진료', count: 15 },
    ],
    recentServices: [
      {
        id: 's1',
        date: '2024-12-27',
        serviceType: 'full_care',
        hospitalName: '신촌세브란스병원',
        hospitalDepartment: '재활의학과',
        duration: 4,
        customerName: '최*민',
        rating: 5,
        review: '할머니 휠체어 동행이 필요했는데, 정말 편안하게 모셔주셨어요.',
        tags: ['휠체어', '재활'],
      },
    ],
  },
  '5': {
    id: '5',
    name: '정민수',
    introduction: '항암치료, 투석 등 정기 병원 방문 동행 경험이 많습니다.',
    joinedAt: '2023-05-01',
    isVerified: true,
    totalServices: 203,
    totalHours: 812,
    rating: 4.9,
    totalReviews: 156,
    badges: [
      { icon: '🏆', name: '베스트 동행인', description: '월간 최다 예약 달성' },
      { icon: '💪', name: '200회 돌파', description: '동행 서비스 200회 달성' },
      { icon: '🩺', name: '항암 전문', description: '항암치료 동행 50회 이상' },
      { icon: '⏰', name: '정시왕', description: '정시 도착률 99%' },
    ],
    monthlyStats: [
      { month: '7월', services: 28 },
      { month: '8월', services: 32 },
      { month: '9월', services: 30 },
      { month: '10월', services: 35 },
      { month: '11월', services: 33 },
      { month: '12월', services: 25 },
    ],
    serviceTypeStats: [
      { type: 'full_care', count: 142, percentage: 70 },
      { type: 'hospital_care', count: 41, percentage: 20 },
      { type: 'special_care', count: 20, percentage: 10 },
    ],
    specialtyStats: [
      { name: '항암치료', count: 68 },
      { name: '투석', count: 45 },
      { name: '정기진료', count: 52 },
      { name: '응급실', count: 12 },
    ],
    recentServices: [
      {
        id: 's1',
        date: '2024-12-28',
        serviceType: 'special_care',
        hospitalName: '서울아산병원',
        hospitalDepartment: '종양내과',
        duration: 6,
        customerName: '강*희',
        rating: 5,
        review: '항암치료 동행을 해주셨는데, 정말 세심하게 챙겨주셔서 감사했습니다.',
        tags: ['항암치료', '종양내과'],
      },
      {
        id: 's2',
        date: '2024-12-26',
        serviceType: 'full_care',
        hospitalName: '한양대학교병원',
        hospitalDepartment: '신장내과',
        duration: 5,
        customerName: '윤*수',
        rating: 5,
        review: '아버지 투석 동행을 정기적으로 부탁드리고 있어요.',
        tags: ['투석', '정기동행'],
      },
    ],
  },
  '6': {
    id: '6',
    name: '한수진',
    introduction: '경기도 성남, 분당 지역 전문입니다. 차량 보유로 이동이 편리합니다.',
    joinedAt: '2024-03-01',
    isVerified: true,
    totalServices: 78,
    totalHours: 289,
    rating: 4.8,
    totalReviews: 54,
    isNew: true,
    discount: {
      type: 'percent',
      value: 15,
      description: '신규 동행인 15% 할인',
      validUntil: '2025-03-01',
    },
    badges: [
      { icon: '🚗', name: '차량 픽업', description: '자차 보유, 픽업 서비스 가능' },
      { icon: '🏥', name: '대형병원 전문', description: '분당서울대, 분당차병원 전문' },
      { icon: '🌟', name: '신규 인기', description: '가입 후 빠른 성장' },
    ],
    monthlyStats: [
      { month: '7월', services: 8 },
      { month: '8월', services: 11 },
      { month: '9월', services: 14 },
      { month: '10월', services: 16 },
      { month: '11월', services: 15 },
      { month: '12월', services: 14 },
    ],
    serviceTypeStats: [
      { type: 'full_care', count: 58, percentage: 74 },
      { type: 'hospital_care', count: 15, percentage: 19 },
      { type: 'special_care', count: 5, percentage: 7 },
    ],
    specialtyStats: [
      { name: '자택 픽업', count: 45 },
      { name: '대형병원', count: 38 },
      { name: '건강검진', count: 22 },
    ],
    recentServices: [
      {
        id: 's1',
        date: '2024-12-27',
        serviceType: 'full_care',
        hospitalName: '분당서울대학교병원',
        hospitalDepartment: '내과',
        duration: 5,
        customerName: '서*영',
        rating: 5,
        review: '차로 픽업해주시고 병원까지 편하게 모셔주셨어요.',
        tags: ['픽업', '분당서울대'],
      },
    ],
  },
  '7': {
    id: '7',
    name: '조영희',
    introduction: '인천 지역 병원동행 전문입니다.',
    joinedAt: '2024-02-15',
    isVerified: true,
    totalServices: 92,
    totalHours: 315,
    rating: 4.7,
    totalReviews: 67,
    badges: [
      { icon: '🏙️', name: '인천 전문', description: '인천 지역 동행 전문' },
    ],
    monthlyStats: [
      { month: '7월', services: 12 },
      { month: '8월', services: 14 },
      { month: '9월', services: 16 },
      { month: '10월', services: 18 },
      { month: '11월', services: 17 },
      { month: '12월', services: 15 },
    ],
    serviceTypeStats: [
      { type: 'full_care', count: 52, percentage: 57 },
      { type: 'hospital_care', count: 32, percentage: 35 },
      { type: 'special_care', count: 8, percentage: 8 },
    ],
    specialtyStats: [
      { name: '인천 지역', count: 92 },
      { name: '대형병원', count: 48 },
    ],
    recentServices: [],
  },
};

export default function CompanionBlogPage() {
  const params = useParams();
  const router = useRouter();
  const scale = useSettingsStore((state) => state.getScale());
  const companionId = params.id as string;

  const [activeTab, setActiveTab] = useState(0);

  const blog = MOCK_COMPANION_BLOGS[companionId];

  // 최대 월별 서비스 수 (차트 스케일링용)
  const maxMonthlyServices = useMemo(() => {
    if (!blog) return 0;
    return Math.max(...blog.monthlyStats.map((s) => s.services));
  }, [blog]);

  // 날짜 포맷
  const formatServiceDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = differenceInDays(today, date);

    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return format(date, 'M월 d일', { locale: ko });
  };

  if (!blog) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            동행인 활동 정보를 찾을 수 없습니다 😢
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            요청하신 동행인의 활동 블로그가 존재하지 않습니다.
          </Typography>
          <Button variant="contained" onClick={() => router.push('/companions')}>
            동행인 목록으로 돌아가기
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
        {/* 상단 네비게이션 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ fontSize: `${0.95 * scale}rem` }}
          >
            뒤로가기
          </Button>
          <UISizeControl />
        </Box>

        {/* 프로필 헤더 */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: `${2.5 * scale}rem`,
                  }}
                >
                  {blog.name[0]}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ fontSize: `${1.5 * scale}rem` }}>
                      {blog.name} 동행인의 활동
                    </Typography>
                    {blog.isVerified && <Verified sx={{ color: 'primary.main' }} />}
                    {blog.isNew && (
                      <Chip label="NEW" size="small" color="error" sx={{ fontWeight: 700 }} />
                    )}
                  </Box>
                  <Typography color="text.secondary" sx={{ fontSize: `${0.95 * scale}rem`, mb: 1 }}>
                    {blog.introduction}
                  </Typography>
                  {blog.discount && (
                    <Chip
                      icon={<EmojiEvents />}
                      label={blog.discount.description}
                      color="warning"
                      sx={{ fontWeight: 600, fontSize: `${0.85 * scale}rem` }}
                    />
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => router.push(`/companions/${companionId}`)}
                  sx={{ fontSize: `${0.9 * scale}rem` }}
                >
                  프로필 보기
                </Button>
                <Button
                  variant="contained"
                  startIcon={<CalendarMonth />}
                  onClick={() => router.push(`/reservation/new?companion=${companionId}`)}
                  sx={{ fontSize: `${0.9 * scale}rem` }}
                >
                  예약하기
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 통계 요약 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="primary" sx={{ fontSize: `${2 * scale}rem` }}>
                {blog.totalServices}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: `${0.85 * scale}rem` }}>
                총 동행 횟수
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="primary" sx={{ fontSize: `${2 * scale}rem` }}>
                {blog.totalHours}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: `${0.85 * scale}rem` }}>
                총 동행 시간 (시간)
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <Star sx={{ color: '#FFB400', fontSize: `${2 * scale}rem` }} />
                <Typography variant="h4" fontWeight={700} color="primary" sx={{ fontSize: `${2 * scale}rem` }}>
                  {blog.rating}
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: `${0.85 * scale}rem` }}>
                평균 별점
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="primary" sx={{ fontSize: `${2 * scale}rem` }}>
                {blog.totalReviews}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: `${0.85 * scale}rem` }}>
                고객 후기
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* 뱃지 */}
        {blog.badges.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: `${1.2 * scale}rem` }}>
              🏅 획득 뱃지
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {blog.badges.map((badge, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'primary.50',
                    border: '1px solid',
                    borderColor: 'primary.100',
                  }}
                >
                  <Typography sx={{ fontSize: `${1.8 * scale}rem` }}>{badge.icon}</Typography>
                  <Box>
                    <Typography fontWeight={600} sx={{ fontSize: `${0.95 * scale}rem` }}>
                      {badge.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.75 * scale}rem` }}>
                      {badge.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* 탭 */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ '& .MuiTab-root': { fontSize: `${1 * scale}rem` } }}
          >
            <Tab label="서비스 이력" />
            <Tab label="통계" />
          </Tabs>
        </Paper>

        {/* 서비스 이력 탭 */}
        {activeTab === 0 && (
          <Box>
            {blog.recentServices.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem` }}>
                  아직 등록된 서비스 이력이 없습니다.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {blog.recentServices.map((service) => (
                  <Paper key={service.id} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip
                            label={SERVICE_TYPE_LABELS[service.serviceType].label}
                            color={SERVICE_TYPE_LABELS[service.serviceType].color}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: `${0.8 * scale}rem` }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.85 * scale}rem` }}>
                            {formatServiceDate(service.date)} · {service.duration}시간
                          </Typography>
                        </Box>
                        <Typography fontWeight={600} sx={{ fontSize: `${1.1 * scale}rem` }}>
                          {service.hospitalName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
                          {service.hospitalDepartment} · {service.customerName}님
                        </Typography>
                      </Box>
                      {service.rating && (
                        <Box sx={{ textAlign: 'right' }}>
                          <Rating value={service.rating} size="small" readOnly />
                        </Box>
                      )}
                    </Box>

                    {service.review && (
                      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 2 }}>
                        <Typography variant="body2" sx={{ fontSize: `${0.95 * scale}rem`, fontStyle: 'italic' }}>
                          &ldquo;{service.review}&rdquo;
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {service.tags.map((tag, i) => (
                        <Chip
                          key={i}
                          label={`#${tag}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: `${0.75 * scale}rem` }}
                        />
                      ))}
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* 통계 탭 */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            {/* 월별 서비스 */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3, fontSize: `${1.1 * scale}rem` }}>
                  📊 월별 동행 횟수
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {blog.monthlyStats.map((stat) => (
                    <Box key={stat.month}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: `${0.9 * scale}rem` }}>{stat.month}</Typography>
                        <Typography fontWeight={600} sx={{ fontSize: `${0.9 * scale}rem` }}>
                          {stat.services}회
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(stat.services / maxMonthlyServices) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* 서비스 유형별 */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3, fontSize: `${1.1 * scale}rem` }}>
                  📋 서비스 유형별 통계
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {blog.serviceTypeStats.map((stat) => (
                    <Box key={stat.type}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={SERVICE_TYPE_LABELS[stat.type].label}
                            color={SERVICE_TYPE_LABELS[stat.type].color}
                            size="small"
                            sx={{ fontSize: `${0.8 * scale}rem` }}
                          />
                        </Box>
                        <Typography fontWeight={600} sx={{ fontSize: `${0.9 * scale}rem` }}>
                          {stat.count}회 ({stat.percentage}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stat.percentage}
                        color={SERVICE_TYPE_LABELS[stat.type].color}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* 전문 분야별 */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3, fontSize: `${1.1 * scale}rem` }}>
                  💪 전문 분야별 동행 횟수
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {blog.specialtyStats.map((stat, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: index === 0 ? 'primary.50' : 'grey.50',
                        border: '1px solid',
                        borderColor: index === 0 ? 'primary.200' : 'grey.200',
                        minWidth: 120,
                        textAlign: 'center',
                      }}
                    >
                      <Typography fontWeight={700} color="primary" sx={{ fontSize: `${1.5 * scale}rem` }}>
                        {stat.count}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontSize: `${0.85 * scale}rem` }}>
                        {stat.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* 활동 기간 */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: 'primary.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <WorkHistory sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600} sx={{ fontSize: `${1.1 * scale}rem` }}>
                      {format(new Date(blog.joinedAt), 'yyyy년 M월')}부터 활동 중
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
                      {differenceInDays(new Date(), new Date(blog.joinedAt))}일간 함께했습니다 💙
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
