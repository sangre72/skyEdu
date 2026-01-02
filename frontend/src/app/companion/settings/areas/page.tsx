'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  Delete,
  LocationOn,
  Add,
  TrendingUp,
  People,
} from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import UISizeControl from '@/components/common/UISizeControl';
import RegionSelector, { RegionCompanionCount } from '@/components/common/RegionSelector';
import { useSettingsStore } from '@/stores/settingsStore';
import { useRegions } from '@/hooks/useRegions';
import { api } from '@/lib/api';

// 임시 동행인 현황 데이터 (실제로는 API에서 가져옴)
// TODO: 백엔드 API 구현 시 실제 데이터로 대체
const MOCK_PROVINCE_COMPANION_COUNTS: RegionCompanionCount = {
  seoul: 42,
  gyeonggi: 18,
  incheon: 8,
  busan: 12,
  daegu: 5,
  gwangju: 3,
  daejeon: 4,
  ulsan: 2,
  sejong: 0,
  gangwon: 1,
  chungbuk: 2,
  chungnam: 3,
  jeonbuk: 2,
  jeonnam: 1,
  gyeongbuk: 3,
  gyeongnam: 4,
  jeju: 2,
};

const MOCK_DISTRICT_COMPANION_COUNTS: RegionCompanionCount = {
  'seoul-gangnam': 8,
  'seoul-seocho': 6,
  'seoul-songpa': 5,
  'seoul-mapo': 4,
  'seoul-yongsan': 3,
  'seoul-gangdong': 2,
  'seoul-nowon': 2,
  'seoul-seodaemun': 2,
  'seoul-eunpyeong': 1,
  'seoul-gwanak': 1,
  'seoul-gwangjin': 1,
  'seoul-guro': 1,
  'seoul-dobong': 1,
  'seoul-dongdaemun': 1,
  'seoul-dongjak': 1,
  'seoul-seongdong': 1,
  'seoul-seongbuk': 1,
  'seoul-yangcheon': 0,
  'seoul-yeongdeungpo': 0,
  'seoul-jongno': 0,
  'seoul-jung': 0,
  'seoul-jungnang': 0,
  'seoul-gangbuk': 0,
  'seoul-gangseo': 0,
  'seoul-geumcheon': 0,
  'gyeonggi-seongnam': 4,
  'gyeonggi-yongin': 3,
  'gyeonggi-suwon': 2,
  'gyeonggi-goyang': 2,
  'gyeonggi-bucheon': 1,
  'gyeonggi-ansan': 1,
  'gyeonggi-anyang': 1,
  'gyeonggi-namyangju': 1,
  'gyeonggi-hwaseong': 1,
  'gyeonggi-hanam': 1,
  'gyeonggi-pyeongtaek': 1,
  'incheon-namdong': 3,
  'incheon-yeonsu': 2,
  'incheon-bupyeong': 2,
  'incheon-seo': 1,
  'busan-haeundae': 4,
  'busan-suyeong': 3,
  'busan-nam': 2,
  'busan-busanjin': 2,
  'busan-dongnae': 1,
};

export default function ServiceAreasPage() {
  const router = useRouter();
  const scale = useSettingsStore((state) => state.getScale());
  const { provinces, getFullRegionName, getProvinceName } = useRegions();

  // 저장된 서비스 지역
  const [savedAreas, setSavedAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 새로 추가할 지역 선택 상태
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // 매니저 프로필에서 지역 정보 조회
  const fetchAreas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await api.getMyManagerProfile();
      setSavedAreas(profile.availableAreas || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '지역 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // 지역 저장 API 호출
  const saveAreas = useCallback(async (areas: string[]) => {
    try {
      setIsSaving(true);
      setError(null);
      await api.updateMyManagerProfile({ availableAreas: areas });
      setSavedAreas(areas);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '지역 저장에 실패했습니다.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // 총 동행인 수
  const totalCompanions = useMemo(() => {
    return Object.values(MOCK_PROVINCE_COMPANION_COUNTS).reduce((sum, count) => sum + count, 0);
  }, []);

  // 기회 지역 (동행인이 적은 지역) - 상위 5개
  const opportunityRegions = useMemo(() => {
    const districts = Object.entries(MOCK_DISTRICT_COMPANION_COUNTS)
      .filter(([_, count]) => count <= 2)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 8);
    return districts;
  }, []);

  // 지역 추가
  const handleAddAreas = async () => {
    if (selectedDistricts.length === 0) return;

    // 중복 제거하여 추가
    const newAreas = selectedDistricts.filter((d) => !savedAreas.includes(d));
    if (newAreas.length > 0) {
      try {
        await saveAreas([...savedAreas, ...newAreas]);
      } catch {
        return;
      }
    }

    // 선택 초기화
    setSelectedProvince('');
    setSelectedDistricts([]);
  };

  // 지역 삭제
  const handleRemoveArea = async (areaCode: string) => {
    const newAreas = savedAreas.filter((a) => a !== areaCode);
    try {
      await saveAreas(newAreas);
    } catch {
      // 에러 처리는 saveAreas에서 함
    }
  };

  // 전체 삭제
  const handleClearAll = async () => {
    if (window.confirm('모든 서비스 지역을 삭제하시겠습니까?')) {
      try {
        await saveAreas([]);
      } catch {
        // 에러 처리는 saveAreas에서 함
      }
    }
  };

  // 시/도별로 그룹화
  const groupedAreas = savedAreas.reduce((acc, area) => {
    const [provinceCode] = area.split('-');
    if (!acc[provinceCode]) {
      acc[provinceCode] = [];
    }
    acc[provinceCode].push(area);
    return acc;
  }, {} as Record<string, string[]>);

  // 로딩 상태
  if (isLoading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
              sx={{ fontSize: `${0.95 * scale}rem` }}
            >
              뒤로가기
            </Button>
          </Box>
          <UISizeControl />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1, fontSize: `${1.5 * scale}rem` }}>
            📍 서비스 지역 설정
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: `${1 * scale}rem` }}>
            동행 서비스를 제공할 수 있는 지역을 설정하세요. 설정한 지역의 고객에게 노출됩니다.
          </Typography>
        </Box>

        {/* 성공 알림 */}
        {showSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            서비스 지역이 저장되었습니다!
          </Alert>
        )}

        {/* 에러 알림 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 지역별 동행인 현황 */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#FFF8E1' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TrendingUp sx={{ color: 'warning.main' }} />
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: `${1.1 * scale}rem` }}>
              📊 지역별 동행인 현황
            </Typography>
            <Chip
              label={`전국 ${totalCompanions}명`}
              size="small"
              color="primary"
              sx={{ ml: 'auto', fontSize: `${0.85 * scale}rem` }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: `${0.9 * scale}rem` }}>
            동행인이 적은 지역에서 활동하면 더 많은 예약을 받을 수 있어요!
            <Chip label="초록색" size="small" color="success" sx={{ mx: 0.5, height: 18, fontSize: '0.7rem' }} />
            표시된 지역은 경쟁이 적은 기회 지역이에요.
          </Typography>

          {/* 시/도별 현황 */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, fontSize: `${0.9 * scale}rem` }}>
            시/도별 현황
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {provinces.slice(0, 10).map((province) => {
              const count = MOCK_PROVINCE_COMPANION_COUNTS[province.code] || 0;
              return (
                <Chip
                  key={province.code}
                  icon={<People sx={{ fontSize: 14 }} />}
                  label={`${province.shortName} ${count}명`}
                  size="small"
                  color={count === 0 ? 'default' : count <= 3 ? 'success' : 'primary'}
                  variant={count <= 3 ? 'filled' : 'outlined'}
                  sx={{ fontSize: `${0.8 * scale}rem` }}
                />
              );
            })}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 기회 지역 */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, fontSize: `${0.9 * scale}rem` }}>
            🎯 추천 기회 지역 (동행인 2명 이하)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {opportunityRegions.map(([code, count]) => (
              <Chip
                key={code}
                label={`${getFullRegionName(code)} (${count}명)`}
                size="small"
                color="success"
                onClick={() => {
                  const [provinceCode] = code.split('-');
                  setSelectedProvince(provinceCode);
                  setSelectedDistricts([code]);
                }}
                sx={{
                  fontSize: `${0.8 * scale}rem`,
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              />
            ))}
          </Box>
        </Paper>

        <Grid container spacing={4}>
          {/* 지역 추가 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3, fontSize: `${1.1 * scale}rem` }}>
                <Add sx={{ verticalAlign: 'middle', mr: 1 }} />
                지역 추가
              </Typography>

              <RegionSelector
                province={selectedProvince}
                onProvinceChange={setSelectedProvince}
                multiple={true}
                selectedDistricts={selectedDistricts}
                onDistrictsChange={setSelectedDistricts}
                showCompanionCount={true}
                provinceCompanionCounts={MOCK_PROVINCE_COMPANION_COUNTS}
                districtCompanionCounts={MOCK_DISTRICT_COMPANION_COUNTS}
                sx={{ mb: 3 }}
              />

              {selectedDistricts.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontSize: `${0.9 * scale}rem` }}>
                    선택된 지역 ({selectedDistricts.length}개)
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedDistricts.map((code) => (
                      <Chip
                        key={code}
                        label={getFullRegionName(code)}
                        size="small"
                        color="primary"
                        sx={{ fontSize: `${0.8 * scale}rem` }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                disabled={selectedDistricts.length === 0 || isSaving}
                onClick={handleAddAreas}
                sx={{ fontSize: `${1 * scale}rem` }}
              >
                {isSaving ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                선택한 지역 추가하기
              </Button>
            </Paper>
          </Grid>

          {/* 현재 서비스 지역 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: `${1.1 * scale}rem` }}>
                  <LocationOn sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
                  현재 서비스 지역 ({savedAreas.length}개)
                </Typography>
                {savedAreas.length > 0 && (
                  <Button
                    size="small"
                    color="error"
                    onClick={handleClearAll}
                    sx={{ fontSize: `${0.85 * scale}rem` }}
                  >
                    전체 삭제
                  </Button>
                )}
              </Box>

              {savedAreas.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <LocationOn sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary" sx={{ fontSize: `${0.95 * scale}rem` }}>
                    등록된 서비스 지역이 없습니다.
                    <br />
                    왼쪽에서 지역을 추가해주세요.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(groupedAreas).map(([provinceCode, areas]) => (
                    <Box key={provinceCode}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 1, color: 'primary.main', fontSize: `${0.9 * scale}rem` }}
                      >
                        {getProvinceName(provinceCode, false)}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {areas.map((areaCode) => (
                          <Chip
                            key={areaCode}
                            label={getFullRegionName(areaCode)}
                            onDelete={() => handleRemoveArea(areaCode)}
                            deleteIcon={<Delete sx={{ fontSize: 16 }} />}
                            sx={{ fontSize: `${0.85 * scale}rem` }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* 안내 */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: '#E3F2FD' }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, fontSize: `${1 * scale}rem` }}>
            💡 서비스 지역 설정 안내
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${0.9 * scale}rem`, lineHeight: 1.8 }}>
            • 설정한 지역에서 동행인을 찾는 고객에게 프로필이 노출됩니다.
            <br />
            • 실제로 서비스가 가능한 지역만 등록해주세요.
            <br />
            • 지역이 많을수록 더 많은 예약 요청을 받을 수 있어요.
            <br />
            • 지역 변경은 언제든지 가능합니다.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
