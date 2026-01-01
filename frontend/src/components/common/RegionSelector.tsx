'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { useRegions } from '@/hooks/useRegions';
import { useSettingsStore } from '@/stores/settingsStore';

// 지역별 동행인 수 타입
export interface RegionCompanionCount {
  [regionCode: string]: number;
}

interface RegionSelectorProps {
  // 선택된 값
  province?: string;
  district?: string;
  // 변경 핸들러
  onProvinceChange?: (provinceCode: string) => void;
  onDistrictChange?: (districtCode: string) => void;
  // 다중 선택 모드 (서비스 지역 설정 시)
  multiple?: boolean;
  selectedDistricts?: string[];
  onDistrictsChange?: (districtCodes: string[]) => void;
  // UI 옵션
  showLabel?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  // 동행인 수 표시 (지역 선택 시 참고용)
  showCompanionCount?: boolean;
  provinceCompanionCounts?: RegionCompanionCount;
  districtCompanionCounts?: RegionCompanionCount;
  // 스타일
  sx?: object;
}

/**
 * 지역 선택 컴포넌트
 * - 가입 시 지역 선택
 * - 서비스 지역 설정 (다중 선택)
 * - 동행인 검색 필터
 */
export default function RegionSelector({
  province = '',
  district = '',
  onProvinceChange,
  onDistrictChange,
  multiple = false,
  selectedDistricts = [],
  onDistrictsChange,
  showLabel = true,
  size = 'medium',
  fullWidth = true,
  required = false,
  disabled = false,
  showCompanionCount = false,
  provinceCompanionCounts = {},
  districtCompanionCounts = {},
  sx = {},
}: RegionSelectorProps) {
  const { provinces, isLoading, error, getDistrictsByProvince } = useRegions();
  const scale = useSettingsStore((state) => state.getScale());

  const [localProvince, setLocalProvince] = useState(province);
  const [localDistrict, setLocalDistrict] = useState(district);
  const [localSelectedDistricts, setLocalSelectedDistricts] = useState<string[]>(selectedDistricts);

  // Props 변경 시 로컬 상태 동기화
  useEffect(() => {
    setLocalProvince(province);
  }, [province]);

  useEffect(() => {
    setLocalDistrict(district);
  }, [district]);

  useEffect(() => {
    setLocalSelectedDistricts(selectedDistricts);
  }, [selectedDistricts]);

  // 시/도 변경 핸들러
  const handleProvinceChange = (event: SelectChangeEvent<string>) => {
    const newProvince = event.target.value;
    setLocalProvince(newProvince);
    setLocalDistrict('');
    setLocalSelectedDistricts([]);

    onProvinceChange?.(newProvince);
    onDistrictChange?.('');
    onDistrictsChange?.([]);
  };

  // 시/군/구 변경 핸들러 (단일 선택)
  const handleDistrictChange = (event: SelectChangeEvent<string>) => {
    const newDistrict = event.target.value;
    setLocalDistrict(newDistrict);
    onDistrictChange?.(newDistrict);
  };

  // 시/군/구 변경 핸들러 (다중 선택)
  const handleDistrictsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const newDistricts = typeof value === 'string' ? value.split(',') : value;
    setLocalSelectedDistricts(newDistricts);
    onDistrictsChange?.(newDistricts);
  };

  // 현재 선택된 시/도의 시/군/구 목록
  const currentDistricts = getDistrictsByProvince(localProvince);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          지역 정보 로딩 중...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={sx}>
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        ...sx,
      }}
    >
      {/* 시/도 선택 */}
      <FormControl
        size={size}
        fullWidth={fullWidth}
        required={required}
        disabled={disabled}
      >
        {showLabel && (
          <InputLabel sx={{ fontSize: `${0.95 * scale}rem` }}>시/도</InputLabel>
        )}
        <Select
          value={localProvince}
          label={showLabel ? '시/도' : undefined}
          onChange={handleProvinceChange}
          startAdornment={<LocationOn sx={{ mr: 1, color: 'text.secondary' }} />}
          sx={{ fontSize: `${1 * scale}rem` }}
        >
          <MenuItem value="">
            <em>선택하세요</em>
          </MenuItem>
          {provinces.map((p) => {
            const count = provinceCompanionCounts[p.code];
            return (
              <MenuItem key={p.code} value={p.code} sx={{ fontSize: `${0.95 * scale}rem` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span>{p.name}</span>
                  {showCompanionCount && count !== undefined && (
                    <Chip
                      label={`${count}명`}
                      size="small"
                      color={count === 0 ? 'default' : count < 3 ? 'success' : 'primary'}
                      sx={{ ml: 1, height: 20, fontSize: `${0.7 * scale}rem` }}
                    />
                  )}
                </Box>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>

      {/* 시/군/구 선택 */}
      {localProvince && currentDistricts.length > 0 && (
        <FormControl
          size={size}
          fullWidth={fullWidth}
          required={required}
          disabled={disabled}
        >
          {showLabel && (
            <InputLabel sx={{ fontSize: `${0.95 * scale}rem` }}>
              {multiple ? '시/군/구 (복수 선택)' : '시/군/구'}
            </InputLabel>
          )}
          {multiple ? (
            <Select
              multiple
              value={localSelectedDistricts}
              label={showLabel ? '시/군/구 (복수 선택)' : undefined}
              onChange={handleDistrictsChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((code) => {
                    const dist = currentDistricts.find((d) => d.code === code);
                    return (
                      <Chip
                        key={code}
                        label={dist?.name || code}
                        size="small"
                        sx={{ fontSize: `${0.8 * scale}rem` }}
                      />
                    );
                  })}
                </Box>
              )}
              sx={{ fontSize: `${1 * scale}rem` }}
            >
              {currentDistricts.map((d) => {
                const count = districtCompanionCounts[d.code];
                return (
                  <MenuItem key={d.code} value={d.code} sx={{ fontSize: `${0.95 * scale}rem` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>{d.name}</span>
                      {showCompanionCount && count !== undefined && (
                        <Chip
                          label={`${count}명`}
                          size="small"
                          color={count === 0 ? 'default' : count < 3 ? 'success' : 'primary'}
                          sx={{ ml: 1, height: 20, fontSize: `${0.7 * scale}rem` }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          ) : (
            <Select
              value={localDistrict}
              label={showLabel ? '시/군/구' : undefined}
              onChange={handleDistrictChange}
              sx={{ fontSize: `${1 * scale}rem` }}
            >
              <MenuItem value="">
                <em>전체</em>
              </MenuItem>
              {currentDistricts.map((d) => {
                const count = districtCompanionCounts[d.code];
                return (
                  <MenuItem key={d.code} value={d.code} sx={{ fontSize: `${0.95 * scale}rem` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>{d.name}</span>
                      {showCompanionCount && count !== undefined && (
                        <Chip
                          label={`${count}명`}
                          size="small"
                          color={count === 0 ? 'default' : count < 3 ? 'success' : 'primary'}
                          sx={{ ml: 1, height: 20, fontSize: `${0.7 * scale}rem` }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          )}
        </FormControl>
      )}
    </Box>
  );
}
