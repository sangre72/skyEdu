'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Rating,
  Select,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  Verified,
  LocalHospital,
  MyLocation,
  LocationOn,
  Search,
  Public,
  LocalOffer,
  Article,
  NewReleases,
} from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import UISizeControl from '@/components/common/UISizeControl';
import { CERTIFICATION_TYPES } from '@/lib/constants';
import { getLocationByIP } from '@/lib/geolocation';
import { useLocationStore } from '@/stores/locationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useRegions } from '@/hooks/useRegions';

// 임시 동행인 데이터 (2depth 지역 코드 사용)
const MOCK_COMPANIONS = [
  {
    id: '1',
    name: '김미영',
    introduction: '15년간 대학병원 간호사로 근무한 경험을 바탕으로 세심하고 따뜻한 동행 서비스를 제공합니다.',
    serviceAreas: ['seoul-gangnam', 'seoul-seocho', 'seoul-songpa'],
    certifications: [{ type: 'nurse', name: '간호사', isVerified: true }],
    rating: 4.9,
    totalServices: 127,
    reviewCount: 89,
    isAvailable: true,
    isNew: false,
    discount: null,
    blogPostCount: 15,
  },
  {
    id: '2',
    name: '이순자',
    introduction: '요양보호사 자격증 보유, 어르신 동행 전문입니다. 편안하고 안전한 병원 방문을 도와드립니다.',
    serviceAreas: ['seoul-mapo', 'seoul-seodaemun', 'seoul-eunpyeong'],
    certifications: [{ type: 'careWorker', name: '요양보호사', isVerified: true }],
    rating: 4.8,
    totalServices: 89,
    reviewCount: 62,
    isAvailable: true,
    isNew: false,
    discount: null,
    blogPostCount: 8,
  },
  {
    id: '3',
    name: '박정희',
    introduction: '사회복지사로 10년간 복지관에서 근무했습니다. 친절하고 꼼꼼한 동행 서비스를 약속드립니다.',
    serviceAreas: ['seoul-gangdong', 'seoul-songpa', 'seoul-gwangjin'],
    certifications: [{ type: 'socialWorker', name: '사회복지사', isVerified: true }],
    rating: 4.7,
    totalServices: 56,
    reviewCount: 41,
    isAvailable: true,
    isNew: false,
    discount: { type: 'percent', value: 10, description: '첫 이용 10% 할인' },
    blogPostCount: 5,
  },
  {
    id: '4',
    name: '최영수',
    introduction: '간호조무사 출신으로 병원 시스템을 잘 알고 있습니다. 검사, 진료 동행 전문입니다.',
    serviceAreas: ['seoul-yongsan', 'seoul-jung', 'seoul-jongno'],
    certifications: [{ type: 'nurseAide', name: '간호조무사', isVerified: false }],
    rating: 4.6,
    totalServices: 34,
    reviewCount: 25,
    isAvailable: false,
    isNew: false,
    discount: null,
    blogPostCount: 3,
  },
  {
    id: '5',
    name: '정민수',
    introduction: '항암치료, 투석 등 정기 병원 방문 동행 경험이 많습니다. 환자분의 마음을 이해합니다.',
    serviceAreas: ['seoul-nowon', 'seoul-dobong', 'seoul-gangbuk'],
    certifications: [{ type: 'careWorker', name: '요양보호사', isVerified: true }],
    rating: 4.9,
    totalServices: 203,
    reviewCount: 156,
    isAvailable: true,
    isNew: false,
    discount: null,
    blogPostCount: 23,
  },
  {
    id: '6',
    name: '한수진',
    introduction: '경기도 성남, 분당 지역 전문입니다. 차량 보유로 이동이 편리합니다.',
    serviceAreas: ['gyeonggi-seongnam', 'gyeonggi-yongin', 'gyeonggi-hanam'],
    certifications: [{ type: 'careWorker', name: '요양보호사', isVerified: true }],
    rating: 4.8,
    totalServices: 78,
    reviewCount: 54,
    isAvailable: true,
    isNew: true,
    discount: { type: 'percent', value: 20, description: '신규 동행인 20% 할인' },
    blogPostCount: 4,
  },
  {
    id: '7',
    name: '조영희',
    introduction: '인천 지역 병원동행 전문입니다. 대형병원 동행 경험이 풍부합니다.',
    serviceAreas: ['incheon-namdong', 'incheon-yeonsu', 'incheon-bupyeong'],
    certifications: [{ type: 'nurse', name: '간호사', isVerified: true }],
    rating: 4.7,
    totalServices: 92,
    reviewCount: 67,
    isAvailable: true,
    isNew: true,
    discount: { type: 'percent', value: 15, description: '신규 가입 기념 15% 할인' },
    blogPostCount: 2,
  },
  {
    id: '8',
    name: '김태호',
    introduction: '부산 해운대, 수영구 지역 전문입니다. 부산대병원, 동아대병원 동행 경험 다수.',
    serviceAreas: ['busan-haeundae', 'busan-suyeong', 'busan-nam'],
    certifications: [{ type: 'careWorker', name: '요양보호사', isVerified: true }],
    rating: 4.6,
    totalServices: 45,
    reviewCount: 32,
    isAvailable: true,
    isNew: true,
    discount: { type: 'percent', value: 20, description: '신규 동행인 20% 할인' },
    blogPostCount: 1,
  },
];

export default function CompanionsPage() {
  const router = useRouter();
  const scale = useSettingsStore((state) => state.getScale());
  const {
    provinces,
    isLoading: isRegionsLoading,
    getDistrictsByProvince,
    getFullRegionName,
    getProvinceName,
  } = useRegions();
  const {
    province: savedProvince,
    district: savedDistrict,
    detectedProvince,
    detectedDistrict,
    isDetecting,
    setLocation,
    setDetectedLocation,
    setIsDetecting,
  } = useLocationStore();

  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCert, setSelectedCert] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'services' | 'reviews'>('rating');
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [showAllRegions, setShowAllRegions] = useState(false);

  // 초기 지역 설정 (저장된 값 또는 감지된 값)
  useEffect(() => {
    const initLocation = async () => {
      // 저장된 지역이 있으면 사용
      if (savedProvince) {
        setSelectedProvince(savedProvince);
        setSelectedDistrict(savedDistrict);
        setIsLocationLoading(false);
        return;
      }

      // 감지된 지역이 있으면 사용
      if (detectedProvince) {
        setSelectedProvince(detectedProvince);
        setSelectedDistrict(detectedDistrict);
        setIsLocationLoading(false);
        return;
      }

      // IP 기반 위치 감지 시도
      setIsDetecting(true);
      try {
        const location = await getLocationByIP();
        if (location) {
          setDetectedLocation(location.province, location.district);
          setSelectedProvince(location.province);
          setSelectedDistrict(location.district);
        } else {
          // 기본값: 전국
          setSelectedProvince('');
          setShowAllRegions(true);
        }
      } catch {
        setSelectedProvince('');
        setShowAllRegions(true);
      } finally {
        setIsLocationLoading(false);
        setIsDetecting(false);
      }
    };

    initLocation();
  }, [savedProvince, savedDistrict, detectedProvince, detectedDistrict, setDetectedLocation, setIsDetecting]);

  // 시/도 변경 시 시/군/구 초기화
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedDistrict('');
    setShowAllRegions(province === '');
  };

  // 전국 보기 토글
  const handleShowAllRegions = () => {
    setShowAllRegions(true);
    setSelectedProvince('');
    setSelectedDistrict('');
  };

  // 내 지역으로 보기
  const handleShowMyRegion = () => {
    setShowAllRegions(false);
    const province = savedProvince || detectedProvince || 'seoul';
    setSelectedProvince(province);
    setSelectedDistrict(savedDistrict || detectedDistrict || '');
  };

  // 지역 설정 저장
  const handleSaveLocation = () => {
    setLocation(selectedProvince, selectedDistrict);
  };

  // 현재 위치로 설정
  const handleDetectLocation = async () => {
    setIsLocationLoading(true);
    setIsDetecting(true);
    try {
      const location = await getLocationByIP();
      if (location) {
        setDetectedLocation(location.province, location.district);
        setSelectedProvince(location.province);
        setSelectedDistrict(location.district);
        setShowAllRegions(false);
      }
    } finally {
      setIsLocationLoading(false);
      setIsDetecting(false);
    }
  };

  // 시/군/구 목록 (JSON에서 동적 로딩)
  const districts = useMemo(() => {
    return getDistrictsByProvince(selectedProvince);
  }, [selectedProvince, getDistrictsByProvince]);

  // 필터링 및 정렬
  const filteredCompanions = useMemo(() => {
    let result = [...MOCK_COMPANIONS];

    // 전국 보기가 아닐 때만 지역 필터 적용
    if (!showAllRegions) {
      // 시/도 필터
      if (selectedProvince) {
        result = result.filter((c) =>
          c.serviceAreas.some((area) => area.startsWith(selectedProvince))
        );
      }

      // 시/군/구 필터
      if (selectedDistrict) {
        result = result.filter((c) => c.serviceAreas.includes(selectedDistrict));
      }
    }

    // 자격증 필터
    if (selectedCert) {
      result = result.filter((c) =>
        c.certifications.some((cert) => cert.type === selectedCert)
      );
    }

    // 정렬
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'services':
        result.sort((a, b) => b.totalServices - a.totalServices);
        break;
      case 'reviews':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return result;
  }, [selectedProvince, selectedDistrict, selectedCert, sortBy, showAllRegions]);

  // 지역명 가져오기 (useRegions 훅에서 제공)
  const getAreaName = (code: string) => {
    return getFullRegionName(code);
  };

  const getProvinceDisplayName = (code: string, useShort: boolean = false) => {
    return getProvinceName(code, useShort);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Breadcrumb
            items={[{ label: '동행인 찾기' }]}
            showBackButton={true}
          />
          <UISizeControl />
        </Box>

        {/* 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1, fontSize: `${1.5 * scale}rem` }}>
            동행인 찾기
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem` }}>
            검증된 전문 동행인을 찾아보세요. 프로필을 클릭하면 상세 정보를 볼 수 있어요.
          </Typography>
        </Box>

        {/* 현재 위치 안내 */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: showAllRegions ? '#FFF8E1' : '#E3F2FD',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {showAllRegions ? (
            <Public sx={{ color: '#F57C00' }} />
          ) : (
            <LocationOn sx={{ color: '#0288D1' }} />
          )}

          {isLocationLoading || isDetecting ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton width={150} height={24} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
                위치를 확인하고 있어요...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography sx={{ fontSize: `${1 * scale}rem` }}>
                {showAllRegions ? (
                  <><strong>전국</strong> 동행인을 보여드리고 있어요.</>
                ) : (
                  <>
                    <strong>
                      {getProvinceDisplayName(selectedProvince)}
                      {selectedDistrict && ` ${districts.find(d => d.code === selectedDistrict)?.name || ''}`}
                    </strong>
                    {' '}지역의 동행인을 보여드리고 있어요.
                  </>
                )}
              </Typography>
              {!showAllRegions && savedProvince !== selectedProvince && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSaveLocation}
                  sx={{ fontSize: `${0.85 * scale}rem` }}
                >
                  이 지역을 기본으로 설정
                </Button>
              )}
            </>
          )}

          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            {showAllRegions ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<MyLocation />}
                onClick={handleShowMyRegion}
                sx={{ fontSize: `${0.85 * scale}rem` }}
              >
                내 지역 보기
              </Button>
            ) : (
              <>
                <Button
                  size="small"
                  startIcon={<Public />}
                  onClick={handleShowAllRegions}
                  sx={{ fontSize: `${0.85 * scale}rem` }}
                >
                  전국 보기
                </Button>
                <Button
                  size="small"
                  startIcon={<MyLocation />}
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  sx={{ fontSize: `${0.85 * scale}rem` }}
                >
                  {isDetecting ? '감지 중...' : '현재 위치로'}
                </Button>
              </>
            )}
          </Box>
        </Paper>

        {/* 필터 */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontSize: `${1.1 * scale}rem` }}>
            🔍 검색 조건
          </Typography>
          <Grid container spacing={2}>
            {/* 시/도 선택 */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={isRegionsLoading}>
                <InputLabel sx={{ fontSize: `${0.9 * scale}rem` }}>시/도</InputLabel>
                <Select
                  value={selectedProvince}
                  label="시/도"
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  sx={{ fontSize: `${1 * scale}rem` }}
                >
                  <MenuItem value="" sx={{ fontSize: `${0.95 * scale}rem` }}>전국</MenuItem>
                  {provinces.map((province) => (
                    <MenuItem key={province.code} value={province.code} sx={{ fontSize: `${0.95 * scale}rem` }}>
                      {province.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 시/군/구 선택 */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={!selectedProvince || isRegionsLoading}>
                <InputLabel sx={{ fontSize: `${0.9 * scale}rem` }}>시/군/구</InputLabel>
                <Select
                  value={selectedDistrict}
                  label="시/군/구"
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  sx={{ fontSize: `${1 * scale}rem` }}
                >
                  <MenuItem value="" sx={{ fontSize: `${0.95 * scale}rem` }}>
                    {selectedProvince ? '전체' : '시/도를 먼저 선택하세요'}
                  </MenuItem>
                  {districts.map((district) => (
                    <MenuItem key={district.code} value={district.code} sx={{ fontSize: `${0.95 * scale}rem` }}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 자격증 필터 */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: `${0.9 * scale}rem` }}>자격증</InputLabel>
                <Select
                  value={selectedCert}
                  label="자격증"
                  onChange={(e) => setSelectedCert(e.target.value)}
                  sx={{ fontSize: `${1 * scale}rem` }}
                >
                  <MenuItem value="" sx={{ fontSize: `${0.95 * scale}rem` }}>전체</MenuItem>
                  {CERTIFICATION_TYPES.map((cert) => (
                    <MenuItem key={cert.code} value={cert.code} sx={{ fontSize: `${0.95 * scale}rem` }}>
                      {cert.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 정렬 */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: `${0.9 * scale}rem` }}>정렬</InputLabel>
                <Select
                  value={sortBy}
                  label="정렬"
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'services' | 'reviews')}
                  sx={{ fontSize: `${1 * scale}rem` }}
                >
                  <MenuItem value="rating" sx={{ fontSize: `${0.95 * scale}rem` }}>⭐ 평점 높은 순</MenuItem>
                  <MenuItem value="services" sx={{ fontSize: `${0.95 * scale}rem` }}>🏆 경험 많은 순</MenuItem>
                  <MenuItem value="reviews" sx={{ fontSize: `${0.95 * scale}rem` }}>💬 후기 많은 순</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* 결과 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" sx={{ fontSize: `${1 * scale}rem` }}>
            <strong>{filteredCompanions.length}</strong>명의 동행인을 찾았어요
            {filteredCompanions.length > 0 && ' 😊'}
          </Typography>
        </Box>

        {/* 결과 목록 */}
        {filteredCompanions.length === 0 ? (
          <Paper
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              bgcolor: '#FFF8E1',
              borderRadius: 3,
            }}
          >
            <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontSize: `${1.2 * scale}rem` }}>
              조건에 맞는 동행인이 없어요 😢
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, fontSize: `${0.95 * scale}rem` }}>
              검색 조건을 변경하시거나, 전국 보기를 선택해보세요.
              <br />
              곧 더 많은 동행인이 등록될 예정이에요!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Public />}
                onClick={handleShowAllRegions}
                sx={{ fontSize: `${1 * scale}rem` }}
              >
                전국 동행인 보기
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedProvince('');
                  setSelectedDistrict('');
                  setSelectedCert('');
                  setShowAllRegions(true);
                }}
                sx={{ fontSize: `${1 * scale}rem` }}
              >
                필터 초기화
              </Button>
            </Box>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredCompanions.map((companion) => (
              <Grid item xs={12} md={6} key={companion.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                    },
                    opacity: companion.isAvailable ? 1 : 0.7,
                    border: companion.isAvailable ? '1px solid transparent' : '1px solid #E0E0E0',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                  onClick={() => router.push(`/companions/${companion.id}`)}
                >
                  {/* 신규/할인 뱃지 */}
                  {(companion.isNew || companion.discount) && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: 16,
                        display: 'flex',
                        gap: 0.5,
                      }}
                    >
                      {companion.isNew && (
                        <Chip
                          icon={<NewReleases sx={{ fontSize: 14 }} />}
                          label="NEW"
                          size="small"
                          color="error"
                          sx={{
                            fontSize: `${0.7 * scale}rem`,
                            fontWeight: 700,
                            height: 24,
                          }}
                        />
                      )}
                      {companion.discount && (
                        <Chip
                          icon={<LocalOffer sx={{ fontSize: 14 }} />}
                          label={`${companion.discount.value}% 할인`}
                          size="small"
                          color="warning"
                          sx={{
                            fontSize: `${0.7 * scale}rem`,
                            fontWeight: 700,
                            height: 24,
                          }}
                        />
                      )}
                    </Box>
                  )}

                  <CardContent sx={{ p: 3, pt: companion.isNew || companion.discount ? 4 : 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 72,
                          height: 72,
                          bgcolor: companion.isAvailable ? 'primary.main' : 'grey.400',
                          fontSize: `${1.8 * scale}rem`,
                        }}
                      >
                        {companion.name[0]}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography variant="h6" fontWeight={600} sx={{ fontSize: `${1.15 * scale}rem` }}>
                            {companion.name}
                          </Typography>
                          {companion.certifications.some((c) => c.isVerified) && (
                            <Chip
                              icon={<Verified sx={{ fontSize: 14 }} />}
                              label="인증됨"
                              size="small"
                              color="primary"
                              sx={{ height: 22, fontSize: `${0.75 * scale}rem` }}
                            />
                          )}
                          {!companion.isAvailable && (
                            <Chip
                              label="예약 마감"
                              size="small"
                              color="default"
                              sx={{ height: 22, fontSize: `${0.75 * scale}rem` }}
                            />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Rating
                            value={companion.rating}
                            precision={0.1}
                            size="small"
                            readOnly
                          />
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: `${0.95 * scale}rem` }}>
                            {companion.rating}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem` }}>
                            · 동행 <strong>{companion.totalServices}</strong>회
                            · 후기 <strong>{companion.reviewCount}</strong>개
                          </Typography>
                        </Box>

                        {/* 할인 정보 */}
                        {companion.discount && (
                          <Box
                            sx={{
                              bgcolor: '#FFF3E0',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              mb: 1,
                              display: 'inline-block',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#E65100',
                                fontWeight: 600,
                                fontSize: `${0.8 * scale}rem`,
                              }}
                            >
                              🎉 {companion.discount.description}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                          {companion.certifications.map((cert, i) => (
                            <Chip
                              key={i}
                              label={cert.name}
                              size="small"
                              icon={<LocalHospital sx={{ fontSize: 14 }} />}
                              color={cert.isVerified ? 'success' : 'default'}
                              variant={cert.isVerified ? 'filled' : 'outlined'}
                              sx={{ fontSize: `${0.8 * scale}rem` }}
                            />
                          ))}
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            mb: 1.5,
                            lineHeight: 1.6,
                            fontSize: `${0.9 * scale}rem`,
                          }}
                        >
                          {companion.introduction}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: `${0.8 * scale}rem` }}>
                              {companion.serviceAreas.slice(0, 2).map(getAreaName).join(', ')}
                              {companion.serviceAreas.length > 2 && ` 외 ${companion.serviceAreas.length - 2}곳`}
                            </Typography>
                          </Box>

                          {/* 블로그/활동 내역 버튼 */}
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<Article sx={{ fontSize: 16 }} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/companions/${companion.id}/blog`);
                            }}
                            sx={{
                              fontSize: `${0.8 * scale}rem`,
                              color: 'text.secondary',
                              '&:hover': { color: 'primary.main' },
                            }}
                          >
                            활동 {companion.blogPostCount}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* 안내 메시지 */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: '#F0FDF4' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, fontSize: `${1 * scale}rem` }}>
            💡 동행인 선택 팁
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem`, lineHeight: 1.8 }}>
            • 프로필을 클릭하면 상세 정보와 후기를 볼 수 있어요.
            <br />
            • <Article sx={{ fontSize: 14, verticalAlign: 'middle', color: 'text.secondary' }} /> &quot;활동&quot; 버튼을 누르면 동행인의 서비스 후기와 활동 내역을 볼 수 있어요.
            <br />
            • <LocalOffer sx={{ fontSize: 14, verticalAlign: 'middle', color: 'warning.main' }} /> 할인 뱃지가 있는 동행인은 특별 할인 중이에요!
            <br />
            • <NewReleases sx={{ fontSize: 14, verticalAlign: 'middle', color: 'error.main' }} /> NEW 뱃지는 신규 동행인이에요. 첫 이용 할인이 있을 수 있어요.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
