'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PROVINCES, DISTRICTS } from '@/lib/constants';

interface StepAreaSelectionProps {
  selectedAreas: string[];
  onChange: (areas: string[]) => void;
}

export default function StepAreaSelection({
  selectedAreas,
  onChange,
}: StepAreaSelectionProps) {
  const [expandedProvince, setExpandedProvince] = useState<string | null>(null);

  // 시/도별 선택된 구/군 개수 계산
  const getSelectedCountByProvince = (provinceCode: string) => {
    const districts = DISTRICTS[provinceCode] || [];
    return districts.filter((d) => selectedAreas.includes(d.code)).length;
  };

  // 시/도 전체 선택 여부
  const isProvinceFullySelected = (provinceCode: string) => {
    const districts = DISTRICTS[provinceCode] || [];
    return districts.every((d) => selectedAreas.includes(d.code));
  };

  // 시/도 토글 (펼치기/접기)
  const handleProvinceClick = (provinceCode: string) => {
    setExpandedProvince(expandedProvince === provinceCode ? null : provinceCode);
  };

  // 시/도 전체 선택/해제
  const handleSelectAllProvince = (provinceCode: string) => {
    const districts = DISTRICTS[provinceCode] || [];
    const districtCodes = districts.map((d) => d.code);

    if (isProvinceFullySelected(provinceCode)) {
      // 전체 해제
      onChange(selectedAreas.filter((code) => !districtCodes.includes(code)));
    } else {
      // 전체 선택
      const newAreas = [...selectedAreas];
      districtCodes.forEach((code) => {
        if (!newAreas.includes(code)) {
          newAreas.push(code);
        }
      });
      onChange(newAreas);
    }
  };

  // 개별 구/군 토글
  const handleDistrictToggle = (districtCode: string) => {
    if (selectedAreas.includes(districtCode)) {
      onChange(selectedAreas.filter((code) => code !== districtCode));
    } else {
      onChange([...selectedAreas, districtCode]);
    }
  };

  return (
    <Box>
      {/* 질문 헤더 */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        어느 지역에서 활동하시겠어요?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        서비스를 제공할 수 있는 지역을 선택해주세요.
      </Typography>

      {/* 선택된 지역 수 표시 */}
      {selectedAreas.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={`${selectedAreas.length}개 지역 선택됨`}
            color="primary"
            variant="filled"
          />
        </Box>
      )}

      {/* 시/도 목록 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {PROVINCES.map((province) => {
          const selectedCount = getSelectedCountByProvince(province.code);
          const totalCount = (DISTRICTS[province.code] || []).length;
          const isExpanded = expandedProvince === province.code;
          const isFullySelected = isProvinceFullySelected(province.code);

          return (
            <Paper
              key={province.code}
              variant="outlined"
              sx={{
                overflow: 'hidden',
                borderColor: selectedCount > 0 ? 'primary.main' : 'grey.300',
                borderWidth: selectedCount > 0 ? 2 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {/* 시/도 헤더 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: isExpanded ? 'grey.50' : 'transparent',
                  '&:hover': {
                    bgcolor: 'grey.50',
                  },
                }}
                onClick={() => handleProvinceClick(province.code)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {province.name}
                  </Typography>
                  {selectedCount > 0 && (
                    <Chip
                      size="small"
                      label={
                        isFullySelected
                          ? '전체'
                          : `${selectedCount}/${totalCount}`
                      }
                      color="primary"
                      variant={isFullySelected ? 'filled' : 'outlined'}
                    />
                  )}
                </Box>
                <IconButton size="small">
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {/* 구/군 목록 */}
              <Collapse in={isExpanded}>
                <Box sx={{ px: 2, pb: 2 }}>
                  {/* 전체 선택 버튼 */}
                  <Box sx={{ mb: 2 }}>
                    <Button
                      size="small"
                      variant={isFullySelected ? 'contained' : 'outlined'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAllProvince(province.code);
                      }}
                    >
                      {isFullySelected
                        ? `${province.name} 전체 해제`
                        : `${province.name} 전체 선택`}
                    </Button>
                  </Box>

                  {/* 구/군 칩 목록 */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(DISTRICTS[province.code] || []).map((district) => {
                      const isSelected = selectedAreas.includes(district.code);
                      return (
                        <Chip
                          key={district.code}
                          label={district.name}
                          onClick={() => handleDistrictToggle(district.code)}
                          color={isSelected ? 'primary' : 'default'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{
                            cursor: 'pointer',
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Box>

      {/* 안내 문구 */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        * 여러 지역을 선택하면 더 많은 예약을 받을 수 있어요
      </Typography>
    </Box>
  );
}
