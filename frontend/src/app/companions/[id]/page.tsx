'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  Refresh,
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
import { useCompanion } from '@/hooks/useCompanions';

export default function CompanionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const scale = useSettingsStore((state) => state.getScale());
  const companionId = params.id as string;

  const [activeTab, setActiveTab] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // API 연동: 동행인 정보 조회
  const { companion, isLoading, error, refetch } = useCompanion(companionId);

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

  // 로딩 상태
  if (isLoading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }} color="text.secondary">
            동행인 정보를 불러오는 중입니다...
          </Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" startIcon={<Refresh />} onClick={refetch}>
                다시 시도
              </Button>
            }
          >
            {error}
          </Alert>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="outlined" onClick={() => router.push('/companions')}>
              동행인 목록으로 돌아가기
            </Button>
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

  // 404 처리
  if (!companion) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            동행인을 찾을 수 없습니다
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

  // isAvailable 계산 (status가 'active'이면 예약 가능)
  const isAvailable = companion.status === 'active';

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 상단 네비게이션 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Breadcrumb
            items={[
              { label: '동행인 찾기', href: '/companions' },
              { label: companion.name || '동행인' },
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
                  src={companion.profileImage}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: isAvailable ? 'primary.main' : 'grey.400',
                    fontSize: `${3 * scale}rem`,
                  }}
                >
                  {companion.name?.[0] || '?'}
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ fontSize: `${1.5 * scale}rem` }}>
                    {companion.name || '동행인'}
                  </Typography>
                  {companion.certifications.length > 0 && (
                    <Verified sx={{ color: 'primary.main' }} />
                  )}
                </Box>
                {!isAvailable && (
                  <Chip label="현재 예약 불가" color="default" size="small" sx={{ mb: 1 }} />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Rating value={companion.rating} precision={0.1} size="small" readOnly />
                  <Typography fontWeight={600} sx={{ fontSize: `${1 * scale}rem` }}>
                    {companion.rating.toFixed(1)}
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
                    {companion.reviewsCount ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.75 * scale}rem` }}>
                    후기
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={700} color="primary" sx={{ fontSize: `${1.3 * scale}rem` }}>
                    {companion.avgRating ? companion.avgRating.toFixed(1) : '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.75 * scale}rem` }}>
                    평균 평점
                  </Typography>
                </Grid>
              </Grid>

              {/* 정보 항목들 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkHistory sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ fontSize: `${0.9 * scale}rem` }}>
                    {format(new Date(companion.createdAt), 'yyyy년 M월', { locale: ko })}부터 활동
                  </Typography>
                </Box>
              </Box>

              {/* 자격증 */}
              {companion.certifications.length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: `${0.95 * scale}rem` }}>
                    보유 자격증
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                    {companion.certifications.map((cert, i) => (
                      <Chip
                        key={i}
                        icon={<CheckCircle sx={{ fontSize: 14 }} />}
                        label={cert}
                        size="small"
                        color="success"
                        variant="filled"
                        sx={{ fontSize: `${0.8 * scale}rem` }}
                      />
                    ))}
                  </Box>
                </>
              )}

              {/* 서비스 지역 */}
              {companion.availableAreas.length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, fontSize: `${0.95 * scale}rem` }}>
                    서비스 지역
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
                    {companion.availableAreas.map((area, i) => (
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
                </>
              )}

              {/* 액션 버튼 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!isAvailable}
                  startIcon={<CalendarMonth />}
                  onClick={() => router.push(`/reservation/new?companion=${companion.id}`)}
                  sx={{ fontSize: `${1 * scale}rem`, py: 1.5 }}
                >
                  {isAvailable ? '예약하기' : '현재 예약 불가'}
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
                <Tab label={`후기 (${companion.reviewsCount ?? 0})`} />
                <Tab label="가능 시간" />
              </Tabs>
            </Paper>

            {/* 탭 내용 */}
            {activeTab === 0 && (
              <Box>
                {/* 소개 */}
                {companion.introduction ? (
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontSize: `${1.1 * scale}rem` }}>
                      소개
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: 'pre-line',
                        lineHeight: 1.8,
                        fontSize: `${1 * scale}rem`,
                      }}
                    >
                      {companion.introduction}
                    </Typography>
                  </Paper>
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem` }}>
                      아직 등록된 소개가 없습니다.
                    </Typography>
                  </Paper>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem` }}>
                    후기 기능은 준비 중입니다.
                  </Typography>
                  {companion.reviewsCount && companion.reviewsCount > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      총 {companion.reviewsCount}개의 후기가 있습니다.
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}

            {activeTab === 2 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontSize: `${1.1 * scale}rem` }}>
                  서비스 가능 시간
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem`, mb: 2 }}>
                  스케줄 기능은 준비 중입니다.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: `${0.8 * scale}rem` }}>
                  실제 예약 가능 여부는 예약 시 확인해주세요.
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
