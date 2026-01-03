'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  ToggleButton,
  ToggleButtonGroup,
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
  Star,
  FiberNew,
  Favorite,
  NearMe,
} from '@mui/icons-material';
// Tab, Tabs 제거됨 - Chip 기반 UI로 변경

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import UISizeControl from '@/components/common/UISizeControl';
import { CERTIFICATION_TYPES } from '@/lib/constants';
import { getLocationByIP, getBrowserLocation, calculateDistance } from '@/lib/geolocation';
import type { Coordinates } from '@/lib/geolocation';
import { useLocationStore } from '@/stores/locationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useRegions } from '@/hooks/useRegions';
import { useCompanions } from '@/hooks/useCompanions';

// 매니저 유형 탭
type ManagerTypeTab = 'expert' | 'new' | 'volunteer' | null;

// 반경 옵션
const RADIUS_OPTIONS = [
  { value: 0, label: '전체' },
  { value: 5, label: '5km' },
  { value: 10, label: '10km' },
  { value: 15, label: '15km' },
  { value: 20, label: '20km' },
];

// Companion UI 타입 정의
interface CompanionDiscount {
  type: 'percent' | 'fixed';
  value: number;
  description: string;
}

interface CompanionCertification {
  type: string;
  name: string;
  isVerified: boolean;
}

interface Companion {
  id: string;
  name: string;
  introduction: string;
  serviceAreas: string[];
  certifications: CompanionCertification[];
  rating: number;
  totalServices: number;
  reviewCount: number;
  isAvailable: boolean;
  isNew: boolean;
  discount: CompanionDiscount | null;
  blogPostCount: number;
  grade: 'new' | 'regular' | 'premium';
  isVolunteer?: boolean; // 자원봉사 여부 (별도 필드 또는 자격증으로 판단)
}

// MOCK 데이터 (폴백용)
const MOCK_COMPANIONS_FALLBACK = [
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
  const [page, setPage] = useState(1);
  const [apiArea, setApiArea] = useState<string | undefined>(undefined);

  // 새로운 필터 상태
  const [managerType, setManagerType] = useState<ManagerTypeTab>(null);
  const [radiusKm, setRadiusKm] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // API 호출 (지역/유형/자격증/정렬 필터 모두 서버에서 처리)
  const {
    companions: apiCompanions,
    total,
    isLoading: isCompanionsLoading,
    error: companionsError,
    refetch,
  } = useCompanions({
    page,
    limit: 20,
    area: apiArea,
    managerType: managerType,
    certification: selectedCert || undefined,
    sortBy: sortBy,
    autoFetch: true,
  });

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

  // 지역 필터 변경 시 API area 파라미터 업데이트
  useEffect(() => {
    if (showAllRegions) {
      setApiArea(undefined);
    } else if (selectedDistrict) {
      setApiArea(selectedDistrict);
    } else if (selectedProvince) {
      setApiArea(selectedProvince);
    } else {
      setApiArea(undefined);
    }
    setPage(1); // 필터 변경 시 첫 페이지로 이동
  }, [selectedProvince, selectedDistrict, showAllRegions]);

  // 자격증/정렬/매니저유형 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setPage(1);
  }, [selectedCert, sortBy, managerType]);

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

  // 브라우저 GPS로 현재 위치 가져오기 (반경 검색용)
  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await getBrowserLocation();
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch (error) {
      console.error('위치 정보를 가져오는데 실패했습니다:', error);
      alert('위치 정보를 가져올 수 없습니다. 위치 권한을 허용해주세요.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // 반경 선택 시 위치 자동 가져오기
  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    if (newRadius > 0 && !userLocation) {
      handleGetCurrentLocation();
    }
  };

  // 시/군/구 목록 (JSON에서 동적 로딩)
  const districts = useMemo(() => {
    return getDistrictsByProvince(selectedProvince);
  }, [selectedProvince, getDistrictsByProvince]);

  // API 데이터 변환 (백엔드 Manager → 프론트엔드 Companion 형식)
  const transformedCompanions = useMemo((): Companion[] => {
    if (companionsError || apiCompanions.length === 0) {
      // 에러 발생 시 또는 데이터 없을 때 빈 배열 반환
      return [];
    }

    return apiCompanions.map((manager): Companion => ({
      id: manager.id,
      name: manager.name || '익명',
      introduction: manager.introduction || '',
      serviceAreas: manager.available_areas || [],
      certifications: (manager.certifications || []).map((cert) => ({
        type: cert,
        name: CERTIFICATION_TYPES.find((c) => c.code === cert)?.name || cert,
        isVerified: manager.status === 'active', // 활성 매니저는 인증된 것으로 간주
      })),
      rating: Number(manager.rating) || 0,
      totalServices: manager.total_services || 0,
      reviewCount: 0, // TODO: 리뷰 API 연동 후 업데이트
      isAvailable: manager.status === 'active',
      isNew: manager.grade === 'new',
      discount: null, // TODO: 프로모션 API 연동 후 업데이트
      blogPostCount: 0, // TODO: 블로그 API 연동 후 업데이트
      grade: manager.grade as 'new' | 'regular' | 'premium',
      isVolunteer: manager.is_volunteer || false,
    }));
  }, [apiCompanions, companionsError]);

  // 지역 좌표 가져오기 (반경 필터용)
  const getAreaCoordinates = useCallback((areaCode: string): Coordinates | null => {
    // 시/도 코드인지 시/군/구 코드인지 확인
    const isDistrictCode = areaCode.includes('-');

    if (isDistrictCode) {
      // 시/군/구 코드에서 시/도 코드 추출
      const provinceCode = areaCode.split('-')[0];
      const districtList = getDistrictsByProvince(provinceCode);
      const found = districtList.find((d) => d.code === areaCode);
      if (found?.lat && found?.lng) {
        return { lat: found.lat, lng: found.lng };
      }
    }

    // 시/도에서 찾기
    const province = provinces.find((p) => p.code === areaCode);
    if (province?.lat && province?.lng) {
      return { lat: province.lat, lng: province.lng };
    }
    return null;
  }, [provinces, getDistrictsByProvince]);

  // 필터링 (클라이언트 측 - 반경만, 나머지는 서버에서 처리)
  // 지역, 자격증, 정렬, 매니저 유형은 모두 서버 측에서 처리
  const filteredCompanions = useMemo(() => {
    let result = [...transformedCompanions];

    // 반경 필터 (현재 위치 기준) - 클라이언트에서만 처리
    if (radiusKm > 0 && userLocation) {
      result = result.filter((companion) => {
        // 동행인의 서비스 지역 중 하나라도 반경 내에 있으면 표시
        return companion.serviceAreas.some((areaCode) => {
          const areaCoords = getAreaCoordinates(areaCode);
          if (!areaCoords) return false;
          const distance = calculateDistance(userLocation, areaCoords);
          return distance <= radiusKm;
        });
      });
    }

    return result;
  }, [transformedCompanions, radiusKm, userLocation, getAreaCoordinates]);

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

        {/* 현재 위치 안내 + 반경 필터 */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: showAllRegions ? '#FFF8E1' : '#E3F2FD',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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

            {/* 반경 필터 - 우측 */}
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NearMe sx={{ fontSize: 18, color: 'text.secondary' }} />
                <ToggleButtonGroup
                  value={radiusKm}
                  exclusive
                  onChange={(_, value) => value !== null && handleRadiusChange(value)}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      fontSize: `${0.75 * scale}rem`,
                      px: 1,
                      py: 0.5,
                    },
                  }}
                >
                  {RADIUS_OPTIONS.map((option) => (
                    <ToggleButton key={option.value} value={option.value}>
                      {option.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {userLocation ? (
                <Chip
                  icon={<MyLocation sx={{ fontSize: 14 }} />}
                  label="현재 위치"
                  size="small"
                  color="success"
                  sx={{ fontSize: `${0.75 * scale}rem` }}
                />
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<MyLocation />}
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingLocation}
                  sx={{ fontSize: `${0.8 * scale}rem` }}
                >
                  {isGettingLocation ? '확인 중...' : '현재 위치'}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* 매니저 유형 필터 */}
        <Paper sx={{ mb: 2, p: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: `${0.9 * scale}rem`, mr: 1 }}
            >
              유형
            </Typography>
            <Chip
              icon={<Star sx={{ fontSize: 16 }} />}
              label="전문매니저"
              size="small"
              color={managerType === 'expert' ? 'warning' : 'default'}
              variant={managerType === 'expert' ? 'filled' : 'outlined'}
              onClick={() => setManagerType(managerType === 'expert' ? null : 'expert')}
              sx={{ fontSize: `${0.85 * scale}rem`, fontWeight: 600 }}
            />
            <Chip
              icon={<FiberNew sx={{ fontSize: 16 }} />}
              label="신규매니저"
              size="small"
              color={managerType === 'new' ? 'error' : 'default'}
              variant={managerType === 'new' ? 'filled' : 'outlined'}
              onClick={() => setManagerType(managerType === 'new' ? null : 'new')}
              sx={{ fontSize: `${0.85 * scale}rem`, fontWeight: 600 }}
            />
            <Chip
              icon={<Favorite sx={{ fontSize: 16 }} />}
              label="자원봉사"
              size="small"
              color={managerType === 'volunteer' ? 'secondary' : 'default'}
              variant={managerType === 'volunteer' ? 'filled' : 'outlined'}
              onClick={() => setManagerType(managerType === 'volunteer' ? null : 'volunteer')}
              sx={{ fontSize: `${0.85 * scale}rem`, fontWeight: 600 }}
            />
          </Box>
        </Paper>

        {/* 시/도 서브탭 */}
        <Paper sx={{ mb: 2, p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: `${0.9 * scale}rem`, mr: 1 }}
            >
              지역
            </Typography>
            <Chip
              label="전국"
              size="small"
              color={selectedProvince === '' ? 'primary' : 'default'}
              variant={selectedProvince === '' ? 'filled' : 'outlined'}
              onClick={() => handleProvinceChange('')}
              sx={{ fontSize: `${0.8 * scale}rem` }}
            />
            {provinces.map((province) => (
              <Chip
                key={province.code}
                label={province.shortName}
                size="small"
                color={selectedProvince === province.code ? 'primary' : 'default'}
                variant={selectedProvince === province.code ? 'filled' : 'outlined'}
                onClick={() => handleProvinceChange(province.code)}
                sx={{ fontSize: `${0.8 * scale}rem` }}
              />
            ))}
          </Box>

          {/* 시/군/구 선택 (시/도 선택 시) */}
          {selectedProvince && districts.length > 0 && (
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #E0E0E0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: `${0.85 * scale}rem`, mr: 1, color: 'text.secondary' }}
                >
                  상세
                </Typography>
                <Chip
                  label="전체"
                  size="small"
                  color={selectedDistrict === '' ? 'secondary' : 'default'}
                  variant={selectedDistrict === '' ? 'filled' : 'outlined'}
                  onClick={() => setSelectedDistrict('')}
                  sx={{ fontSize: `${0.75 * scale}rem` }}
                />
                {districts.map((district) => (
                  <Chip
                    key={district.code}
                    label={district.name}
                    size="small"
                    color={selectedDistrict === district.code ? 'secondary' : 'default'}
                    variant={selectedDistrict === district.code ? 'filled' : 'outlined'}
                    onClick={() => setSelectedDistrict(district.code)}
                    sx={{ fontSize: `${0.75 * scale}rem` }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        {/* 추가 필터: 자격증, 정렬 */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            {/* 자격증 필터 */}
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            {isCompanionsLoading ? (
              <Skeleton width={150} height={24} />
            ) : companionsError ? (
              <span style={{ color: '#EF4444' }}>동행인을 불러올 수 없습니다</span>
            ) : (
              <>
                <strong>{filteredCompanions.length}</strong>명의 동행인을 찾았어요
                {filteredCompanions.length > 0 && ' 😊'}
              </>
            )}
          </Typography>
        </Box>

        {/* 에러 상태 */}
        {companionsError && !isCompanionsLoading && (
          <Paper
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              bgcolor: '#FFEBEE',
              borderRadius: 3,
              mb: 4,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontSize: `${1.2 * scale}rem`, color: '#EF4444' }}>
              동행인 목록을 불러오는데 실패했습니다
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, fontSize: `${0.95 * scale}rem` }}>
              {companionsError}
            </Typography>
            <Button
              variant="contained"
              onClick={() => refetch()}
              sx={{ fontSize: `${1 * scale}rem` }}
            >
              다시 시도
            </Button>
          </Paper>
        )}

        {/* 로딩 상태 */}
        {isCompanionsLoading && (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Skeleton variant="circular" width={72} height={72} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="40%" height={28} sx={{ mb: 1 }} />
                        <Skeleton width="60%" height={20} sx={{ mb: 2 }} />
                        <Skeleton width="100%" height={40} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* 빈 결과 */}
        {!isCompanionsLoading && !companionsError && filteredCompanions.length === 0 && (
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
        )}

        {/* 동행인 목록 */}
        {!isCompanionsLoading && !companionsError && filteredCompanions.length > 0 && (
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
                              {companion.serviceAreas?.length > 0
                                ? <>
                                    {companion.serviceAreas.slice(0, 2).map(getAreaName).join(', ')}
                                    {companion.serviceAreas.length > 2 && ` 외 ${companion.serviceAreas.length - 2}곳`}
                                  </>
                                : '지역 미설정'}
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
