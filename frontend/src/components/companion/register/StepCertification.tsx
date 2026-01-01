'use client';

import { Box, Typography, Paper, Checkbox, Chip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CERTIFICATION_TYPES } from '@/lib/constants';

interface StepCertificationProps {
  selectedCerts: string[];
  onChange: (certs: string[]) => void;
}

// 자격증별 아이콘/설명
const CERT_DETAILS: Record<string, { description: string; badge: string }> = {
  nurse: {
    description: '병원 진료 동행에 전문성을 발휘할 수 있어요',
    badge: '의료 전문가',
  },
  careWorker: {
    description: '어르신 케어에 대한 전문 교육을 받으셨어요',
    badge: '케어 전문가',
  },
  socialWorker: {
    description: '복지 상담 및 연계 서비스를 제공할 수 있어요',
    badge: '복지 전문가',
  },
  nurseAide: {
    description: '기본적인 간호 보조 업무를 수행할 수 있어요',
    badge: '간호 보조',
  },
  other: {
    description: '기타 관련 자격증이 있으시면 선택해주세요',
    badge: '기타 자격',
  },
};

export default function StepCertification({
  selectedCerts,
  onChange,
}: StepCertificationProps) {
  const handleToggle = (certCode: string) => {
    if (selectedCerts.includes(certCode)) {
      onChange(selectedCerts.filter((code) => code !== certCode));
    } else {
      onChange([...selectedCerts, certCode]);
    }
  };

  return (
    <Box>
      {/* 질문 헤더 */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        보유한 자격증이 있으신가요?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        자격증이 있으면 프로필에 인증 배지가 표시되어 신뢰도가 높아져요.
      </Typography>

      {/* 선택사항 표시 */}
      <Chip
        label="선택사항"
        size="small"
        variant="outlined"
        sx={{ mb: 3 }}
      />

      {/* 자격증 목록 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {CERTIFICATION_TYPES.map((cert) => {
          const isSelected = selectedCerts.includes(cert.code);
          const details = CERT_DETAILS[cert.code];

          return (
            <Paper
              key={cert.code}
              variant="outlined"
              onClick={() => handleToggle(cert.code)}
              sx={{
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                borderColor: isSelected ? 'primary.main' : 'grey.300',
                borderWidth: isSelected ? 2 : 1,
                bgcolor: isSelected ? 'primary.50' : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: isSelected ? 'primary.50' : 'grey.50',
                },
              }}
            >
              <Checkbox
                checked={isSelected}
                sx={{
                  p: 0,
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {cert.name}
                  </Typography>
                  {isSelected && (
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                      label={details?.badge}
                      size="small"
                      color="primary"
                      variant="filled"
                      sx={{ height: 24 }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {details?.description}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* 안내 문구 */}
      <Paper
        sx={{
          mt: 3,
          p: 2,
          bgcolor: 'info.50',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        <InfoOutlinedIcon sx={{ color: 'info.main', fontSize: 20, mt: 0.25 }} />
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            자격증 인증 안내
          </Typography>
          <Typography variant="body2" color="text.secondary">
            선택하신 자격증은 등록 후 관리자 확인 절차를 거쳐 프로필에 인증 배지로 표시됩니다.
            자격증 사본은 추후 별도로 요청드릴 예정이에요.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
