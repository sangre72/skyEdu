'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
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
  IconButton,
  Paper,
  Rating,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  CalendarMonth,
  Chat,
  CheckCircle,
  DirectionsCar,
  Favorite,
  FavoriteBorder,
  LocalHospital,
  LocationOn,
  Phone,
  Schedule,
  Star,
  Verified,
  WorkHistory,
} from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import UISizeControl from '@/components/common/UISizeControl';
import { PROVINCES, DISTRICTS, CERTIFICATION_TYPES } from '@/lib/constants';
import { useSettingsStore } from '@/stores/settingsStore';

// 임시 동행인 상세 데이터
const MOCK_COMPANIONS_DETAIL: Record<string, {
  id: string;
  name: string;
  profileImage?: string;
  introduction: string;
  detailedIntro: string;
  serviceAreas: string[];
  certifications: { type: string; name: string; isVerified: boolean; verifiedAt?: string }[];
  rating: number;
  totalServices: number;
  totalReviews: number;
  isAvailable: boolean;
  joinedAt: string;
  specialties: string[];
  hasVehicle: boolean;
  responseTime: string;
  responseRate: number;
  reviews: {
    id: string;
    customerName: string;
    rating: number;
    content: string;
    serviceType: string;
    createdAt: string;
  }[];
  availableTimes: {
    day: string;
    times: string[];
  }[];
}> = {
  '1': {
    id: '1',
    name: '김미영',
    introduction: '15년간 대학병원 간호사로 근무한 경험을 바탕으로 세심하고 따뜻한 동행 서비스를 제공합니다.',
    detailedIntro: `안녕하세요, 김미영입니다.

저는 서울대학교병원에서 15년간 간호사로 근무하며 수많은 환자분들을 돌봐왔습니다.
특히 내과, 외과 병동에서의 경험을 통해 다양한 진료과의 검사와 치료 과정을 잘 알고 있습니다.

병원이 낯설고 두려우신 분들, 혼자 병원에 가기 어려우신 어르신들께
마치 가족처럼 함께하며 안심하고 진료받으실 수 있도록 도와드리겠습니다.

의료진과의 소통, 검사 안내, 약 수령까지 꼼꼼하게 챙겨드립니다.`,
    serviceAreas: ['seoul-gangnam', 'seoul-seocho', 'seoul-songpa'],
    certifications: [
      { type: 'nurse', name: '간호사', isVerified: true, verifiedAt: '2024-01-15' },
      { type: 'careWorker', name: '요양보호사', isVerified: true, verifiedAt: '2024-02-20' },
    ],
    rating: 4.9,
    totalServices: 127,
    totalReviews: 89,
    isAvailable: true,
    joinedAt: '2023-06-01',
    specialties: ['내과 진료', '건강검진', '수술 동행', '항암치료'],
    hasVehicle: true,
    responseTime: '평균 30분 이내',
    responseRate: 98,
    reviews: [
      {
        id: 'r1',
        customerName: '이*순',
        rating: 5,
        content: '어머니 모시고 갔는데 정말 친절하시고 꼼꼼하게 챙겨주셨어요. 의사선생님 설명도 잘 정리해서 알려주셔서 감사했습니다.',
        serviceType: '풀케어',
        createdAt: '2024-12-20',
      },
      {
        id: 'r2',
        customerName: '박*철',
        rating: 5,
        content: '건강검진 동행으로 처음 이용했는데, 대기 시간 동안 계속 신경 써주시고 검사 순서도 잘 안내해주셨습니다.',
        serviceType: '특화케어',
        createdAt: '2024-12-15',
      },
      {
        id: 'r3',
        customerName: '김*영',
        rating: 4,
        content: '시간 약속도 잘 지켜주시고, 친절하게 응대해주셨습니다. 다음에도 이용하고 싶어요.',
        serviceType: '병원케어',
        createdAt: '2024-12-10',
      },
    ],
    availableTimes: [
      { day: '월', times: ['09:00-12:00', '14:00-18:00'] },
      { day: '화', times: ['09:00-12:00', '14:00-18:00'] },
      { day: '수', times: ['09:00-12:00'] },
      { day: '목', times: ['09:00-12:00', '14:00-18:00'] },
      { day: '금', times: ['09:00-12:00', '14:00-18:00'] },
    ],
  },
  '2': {
    id: '2',
    name: '이순자',
    introduction: '요양보호사 자격증 보유, 어르신 동행 전문입니다. 편안하고 안전한 병원 방문을 도와드립니다.',
    detailedIntro: `안녕하세요, 이순자입니다.

10년간 요양보호사로 근무하며 어르신들을 돌봐왔습니다.
거동이 불편하신 분들, 휠체어 이용이 필요하신 분들의 병원 동행을 전문으로 합니다.

어르신들의 불편함과 걱정을 잘 이해하고 있어,
마치 딸처럼, 며느리처럼 따뜻하게 모시겠습니다.`,
    serviceAreas: ['seoul-mapo', 'seoul-seodaemun', 'seoul-eunpyeong'],
    certifications: [
      { type: 'careWorker', name: '요양보호사', isVerified: true, verifiedAt: '2023-08-10' },
    ],
    rating: 4.8,
    totalServices: 89,
    totalReviews: 62,
    isAvailable: true,
    joinedAt: '2023-08-15',
    specialties: ['어르신 동행', '휠체어 동행', '정기 진료'],
    hasVehicle: false,
    responseTime: '평균 1시간 이내',
    responseRate: 95,
    reviews: [
      {
        id: 'r1',
        customerName: '최*민',
        rating: 5,
        content: '할머니 휠체어 동행이 필요했는데, 정말 편안하게 모셔주셨어요. 감사합니다.',
        serviceType: '풀케어',
        createdAt: '2024-12-18',
      },
    ],
    availableTimes: [
      { day: '월', times: ['09:00-17:00'] },
      { day: '화', times: ['09:00-17:00'] },
      { day: '목', times: ['09:00-17:00'] },
      { day: '금', times: ['09:00-17:00'] },
    ],
  },
  '3': {
    id: '3',
    name: '박정희',
    introduction: '사회복지사로 10년간 복지관에서 근무했습니다. 친절하고 꼼꼼한 동행 서비스를 약속드립니다.',
    detailedIntro: `안녕하세요, 박정희입니다.

지역 복지관에서 10년간 사회복지사로 일하며 다양한 분들을 만나왔습니다.
복잡한 병원 시스템이 어려우신 분들, 진료 내용을 정리해드려야 하는 분들께
특히 도움이 될 수 있습니다.`,
    serviceAreas: ['seoul-gangdong', 'seoul-songpa', 'seoul-gwangjin'],
    certifications: [
      { type: 'socialWorker', name: '사회복지사', isVerified: true, verifiedAt: '2023-09-01' },
    ],
    rating: 4.7,
    totalServices: 56,
    totalReviews: 41,
    isAvailable: true,
    joinedAt: '2023-09-10',
    specialties: ['진료 정리', '복지 상담', '의료비 지원 안내'],
    hasVehicle: true,
    responseTime: '평균 2시간 이내',
    responseRate: 92,
    reviews: [],
    availableTimes: [
      { day: '월', times: ['10:00-18:00'] },
      { day: '수', times: ['10:00-18:00'] },
      { day: '금', times: ['10:00-18:00'] },
    ],
  },
  '4': {
    id: '4',
    name: '최영수',
    introduction: '간호조무사 출신으로 병원 시스템을 잘 알고 있습니다. 검사, 진료 동행 전문입니다.',
    detailedIntro: `안녕하세요, 최영수입니다.

대형병원에서 간호조무사로 5년간 근무한 경험이 있습니다.
병원 시스템과 검사 절차를 잘 알고 있어 효율적인 동행이 가능합니다.`,
    serviceAreas: ['seoul-yongsan', 'seoul-jung', 'seoul-jongno'],
    certifications: [
      { type: 'nurseAide', name: '간호조무사', isVerified: false },
    ],
    rating: 4.6,
    totalServices: 34,
    totalReviews: 25,
    isAvailable: false,
    joinedAt: '2024-01-15',
    specialties: ['검사 동행', '진료 동행'],
    hasVehicle: false,
    responseTime: '평균 1시간 이내',
    responseRate: 90,
    reviews: [],
    availableTimes: [],
  },
  '5': {
    id: '5',
    name: '정민수',
    introduction: '항암치료, 투석 등 정기 병원 방문 동행 경험이 많습니다. 환자분의 마음을 이해합니다.',
    detailedIntro: `안녕하세요, 정민수입니다.

저도 가족이 항암치료를 받은 경험이 있어,
정기적으로 병원을 다녀야 하는 분들의 마음을 잘 이해합니다.

항암치료, 투석, 정기 검진 등 꾸준히 병원을 방문해야 하는 분들께
믿을 수 있는 동행인이 되어드리겠습니다.`,
    serviceAreas: ['seoul-nowon', 'seoul-dobong', 'seoul-gangbuk'],
    certifications: [
      { type: 'careWorker', name: '요양보호사', isVerified: true, verifiedAt: '2023-05-20' },
    ],
    rating: 4.9,
    totalServices: 203,
    totalReviews: 156,
    isAvailable: true,
    joinedAt: '2023-05-01',
    specialties: ['항암치료 동행', '투석 동행', '정기 진료'],
    hasVehicle: true,
    responseTime: '평균 30분 이내',
    responseRate: 99,
    reviews: [
      {
        id: 'r1',
        customerName: '강*희',
        rating: 5,
        content: '항암치료 동행을 해주셨는데, 정말 세심하게 챙겨주셔서 감사했습니다. 힘든 시간인데 큰 힘이 되었어요.',
        serviceType: '특화케어',
        createdAt: '2024-12-22',
      },
      {
        id: 'r2',
        customerName: '윤*수',
        rating: 5,
        content: '아버지 투석 동행을 정기적으로 부탁드리고 있어요. 항상 시간 잘 지켜주시고 친절하세요.',
        serviceType: '풀케어',
        createdAt: '2024-12-19',
      },
    ],
    availableTimes: [
      { day: '월', times: ['07:00-20:00'] },
      { day: '화', times: ['07:00-20:00'] },
      { day: '수', times: ['07:00-20:00'] },
      { day: '목', times: ['07:00-20:00'] },
      { day: '금', times: ['07:00-20:00'] },
      { day: '토', times: ['09:00-15:00'] },
    ],
  },
  '6': {
    id: '6',
    name: '한수진',
    introduction: '경기도 성남, 분당 지역 전문입니다. 차량 보유로 이동이 편리합니다.',
    detailedIntro: `안녕하세요, 한수진입니다.

경기도 성남, 분당, 용인 지역에서 활동하고 있습니다.
자차를 보유하고 있어 자택에서 병원까지 편안하게 모셔드릴 수 있습니다.

대형병원(분당서울대병원, 분당차병원 등) 동행 경험이 풍부합니다.`,
    serviceAreas: ['gyeonggi-seongnam', 'gyeonggi-yongin', 'gyeonggi-hanam'],
    certifications: [
      { type: 'careWorker', name: '요양보호사', isVerified: true, verifiedAt: '2024-03-10' },
    ],
    rating: 4.8,
    totalServices: 78,
    totalReviews: 54,
    isAvailable: true,
    joinedAt: '2024-03-01',
    specialties: ['자택 픽업', '대형병원 동행', '건강검진'],
    hasVehicle: true,
    responseTime: '평균 1시간 이내',
    responseRate: 96,
    reviews: [
      {
        id: 'r1',
        customerName: '서*영',
        rating: 5,
        content: '차로 픽업해주시고 병원까지 편하게 모셔주셨어요. 분당서울대병원 동행이었는데 병원도 잘 아시더라구요.',
        serviceType: '풀케어',
        createdAt: '2024-12-21',
      },
    ],
    availableTimes: [
      { day: '월', times: ['08:00-18:00'] },
      { day: '화', times: ['08:00-18:00'] },
      { day: '수', times: ['08:00-18:00'] },
      { day: '목', times: ['08:00-18:00'] },
      { day: '금', times: ['08:00-18:00'] },
    ],
  },
  '7': {
    id: '7',
    name: '조영희',
    introduction: '인천 지역 병원동행 전문입니다. 대형병원 동행 경험이 풍부합니다.',
    detailedIntro: `안녕하세요, 조영희입니다.

인천 지역(남동구, 연수구, 부평구)에서 활동하고 있습니다.
인하대병원, 가천대길병원, 인천성모병원 등 인천 주요 병원 동행 경험이 많습니다.`,
    serviceAreas: ['incheon-namdong', 'incheon-yeonsu', 'incheon-bupyeong'],
    certifications: [
      { type: 'nurse', name: '간호사', isVerified: true, verifiedAt: '2024-02-01' },
    ],
    rating: 4.7,
    totalServices: 92,
    totalReviews: 67,
    isAvailable: true,
    joinedAt: '2024-02-15',
    specialties: ['인천 지역 전문', '대형병원 동행'],
    hasVehicle: false,
    responseTime: '평균 1시간 이내',
    responseRate: 94,
    reviews: [],
    availableTimes: [
      { day: '월', times: ['09:00-17:00'] },
      { day: '화', times: ['09:00-17:00'] },
      { day: '수', times: ['09:00-17:00'] },
      { day: '목', times: ['09:00-17:00'] },
      { day: '금', times: ['09:00-17:00'] },
    ],
  },
};

export default function CompanionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scale = useSettingsStore((state) => state.getScale());
  const companionId = params.id as string;

  const [activeTab, setActiveTab] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const companion = MOCK_COMPANIONS_DETAIL[companionId];

  // 지역명 가져오기
  const getAreaName = (code: string) => {
    const [provinceCode] = code.split('-');
    const provinceDistricts = DISTRICTS[provinceCode];
    if (provinceDistricts) {
      const district = provinceDistricts.find((d) => d.code === code);
      if (district) {
        const province = PROVINCES.find((p) => p.code === provinceCode);
        return `${province?.name?.replace(/특별시|광역시|특별자치시|도|특별자치도/, '') || ''} ${district.name}`;
      }
    }
    return code;
  };

  if (!companion) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            동행인을 찾을 수 없습니다 😢
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            요청하신 동행인 정보가 존재하지 않습니다.
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
          <Breadcrumb
            items={[
              { label: '동행인 찾기', href: '/companions' },
              { label: companion.name },
            ]}
            backHref="/companions"
          />
          <UISizeControl />
        </Box>

        <Grid container spacing={4}>
          {/* 왼쪽: 프로필 정보 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
              {/* 프로필 헤더 */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: companion.isAvailable ? 'primary.main' : 'grey.400',
                    fontSize: `${3 * scale}rem`,
                  }}
                >
                  {companion.name[0]}
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: `${1.5 * scale}rem` }}>
                    {companion.name}
                  </Typography>
                  {companion.certifications.some((c) => c.isVerified) && (
                    <Verified sx={{ color: 'primary.main' }} />
                  )}
                </Box>
                {!companion.isAvailable && (
                  <Chip label="현재 예약 불가" color="default" size="small" sx={{ mb: 1 }} />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Rating value={companion.rating} precision={0.1} size="small" readOnly />
                  <Typography fontWeight={600} sx={{ fontSize: `${1 * scale}rem` }}>
                    {companion.rating}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* 통계 */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color="primary" sx={{ fontSize: `${1.3 * scale}rem` }}>
                    {companion.totalServices}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.75 * scale}rem` }}>
                    동행 횟수
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color="primary" sx={{ fontSize: `${1.3 * scale}rem` }}>
                    {companion.totalReviews}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.75 * scale}rem` }}>
                    후기
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color="primary" sx={{ fontSize: `${1.3 * scale}rem` }}>
                    {companion.responseRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.75 * scale}rem` }}>
                    응답률
                  </Typography>
                </Grid>
              </Grid>

              {/* 정보 항목들 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontSize: `${0.9 * scale}rem` }}>
                    {companion.responseTime} 응답
                  </Typography>
                </Box>
                {companion.hasVehicle && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCar sx={{ fontSize: 20, color: 'success.main' }} />
                    <Typography variant="body2" sx={{ fontSize: `${0.9 * scale}rem` }}>
                      차량 보유 (픽업 가능)
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkHistory sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontSize: `${0.9 * scale}rem` }}>
                    {format(new Date(companion.joinedAt), 'yyyy년 M월')}부터 활동
                  </Typography>
                </Box>
              </Box>

              {/* 자격증 */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: `${0.95 * scale}rem` }}>
                보유 자격증
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {companion.certifications.map((cert, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={cert.isVerified ? <CheckCircle sx={{ fontSize: 14 }} /> : <LocalHospital sx={{ fontSize: 14 }} />}
                      label={cert.name}
                      size="small"
                      color={cert.isVerified ? 'success' : 'default'}
                      variant={cert.isVerified ? 'filled' : 'outlined'}
                      sx={{ fontSize: `${0.8 * scale}rem` }}
                    />
                    {cert.isVerified && cert.verifiedAt && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.7 * scale}rem` }}>
                        {format(new Date(cert.verifiedAt), 'yyyy.MM.dd')} 인증
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>

              {/* 서비스 지역 */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: `${0.95 * scale}rem` }}>
                서비스 지역
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
                {companion.serviceAreas.map((area, i) => (
                  <Chip
                    key={i}
                    icon={<LocationOn sx={{ fontSize: 14 }} />}
                    label={getAreaName(area)}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: `${0.8 * scale}rem` }}
                  />
                ))}
              </Box>

              {/* 액션 버튼 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!companion.isAvailable}
                  startIcon={<CalendarMonth />}
                  onClick={() => router.push(`/reservation/new?companion=${companion.id}`)}
                  sx={{ fontSize: `${1 * scale}rem`, py: 1.5 }}
                >
                  {companion.isAvailable ? '예약하기' : '현재 예약 불가'}
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Chat />}
                    sx={{ fontSize: `${0.9 * scale}rem` }}
                  >
                    문의하기
                  </Button>
                  <IconButton
                    onClick={() => setIsFavorite(!isFavorite)}
                    sx={{
                      border: '1px solid',
                      borderColor: isFavorite ? 'error.main' : 'divider',
                      color: isFavorite ? 'error.main' : 'text.secondary',
                    }}
                  >
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* 오른쪽: 상세 정보 */}
          <Grid item xs={12} md={8}>
            {/* 탭 메뉴 */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                sx={{
                  '& .MuiTab-root': { fontSize: `${1 * scale}rem` },
                }}
              >
                <Tab label="소개" />
                <Tab label={`후기 (${companion.totalReviews})`} />
                <Tab label="가능 시간" />
              </Tabs>
            </Paper>

            {/* 탭 내용 */}
            {activeTab === 0 && (
              <Box>
                {/* 한 줄 소개 */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: `${1.2 * scale}rem` }}>
                    {companion.introduction}
                  </Typography>
                </Paper>

                {/* 상세 소개 */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontSize: `${1.1 * scale}rem` }}>
                    📝 상세 소개
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-line',
                      lineHeight: 1.8,
                      fontSize: `${1 * scale}rem`,
                    }}
                  >
                    {companion.detailedIntro}
                  </Typography>
                </Paper>

                {/* 전문 분야 */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontSize: `${1.1 * scale}rem` }}>
                    💪 전문 분야
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {companion.specialties.map((specialty, i) => (
                      <Chip
                        key={i}
                        label={specialty}
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: `${0.9 * scale}rem` }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                {companion.reviews.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem` }}>
                      아직 등록된 후기가 없습니다.
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {companion.reviews.map((review) => (
                      <Paper key={review.id} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography fontWeight={600} sx={{ fontSize: `${1 * scale}rem` }}>
                                {review.customerName}
                              </Typography>
                              <Chip
                                label={review.serviceType}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: `${0.7 * scale}rem` }}
                              />
                            </Box>
                            <Rating value={review.rating} size="small" readOnly />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.8 * scale}rem` }}>
                            {format(new Date(review.createdAt), 'yyyy.MM.dd')}
                          </Typography>
                        </Box>
                        <Typography sx={{ lineHeight: 1.7, fontSize: `${0.95 * scale}rem` }}>
                          {review.content}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontSize: `${1.1 * scale}rem` }}>
                  🕐 서비스 가능 시간
                </Typography>
                {companion.availableTimes.length === 0 ? (
                  <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem` }}>
                    현재 등록된 가능 시간이 없습니다.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {['월', '화', '수', '목', '금', '토', '일'].map((day) => {
                      const daySchedule = companion.availableTimes.find((t) => t.day === day);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={day}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: daySchedule ? '#E3F2FD' : '#F5F5F5',
                              textAlign: 'center',
                            }}
                          >
                            <Typography
                              fontWeight={600}
                              sx={{
                                mb: 1,
                                color: daySchedule ? 'primary.main' : 'text.disabled',
                                fontSize: `${1 * scale}rem`,
                              }}
                            >
                              {day}요일
                            </Typography>
                            {daySchedule ? (
                              daySchedule.times.map((time, i) => (
                                <Typography key={i} variant="body2" sx={{ fontSize: `${0.9 * scale}rem` }}>
                                  {time}
                                </Typography>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.disabled" sx={{ fontSize: `${0.9 * scale}rem` }}>
                                휴무
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontSize: `${0.8 * scale}rem` }}>
                  * 실제 예약 가능 여부는 예약 시 확인해주세요.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}
