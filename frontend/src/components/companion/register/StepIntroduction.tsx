'use client';

import { Box, TextField, Typography, Paper } from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

interface StepIntroductionProps {
  value: string;
  onChange: (value: string) => void;
}

const EXAMPLE_INTRODUCTIONS = [
  '10년간 간호사로 근무한 경험을 바탕으로 따뜻하고 세심한 동행 서비스를 제공합니다.',
  '어르신들과 소통하는 것을 좋아하며, 편안한 병원 동행을 도와드립니다.',
  '요양보호사 자격증 보유, 5년간 요양원에서 근무했습니다. 믿고 맡겨주세요.',
];

export default function StepIntroduction({ value, onChange }: StepIntroductionProps) {
  return (
    <Box>
      {/* 질문 헤더 - 대화형 톤 */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        자기소개를 작성해주세요
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        고객이 매니저를 선택할 때 가장 먼저 보는 정보예요.
        <br />
        경력, 강점, 서비스 스타일 등을 자유롭게 적어주세요.
      </Typography>

      {/* 입력 필드 */}
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="예: 10년간 간호사로 근무한 경험을 바탕으로..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ maxLength: 200 }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            fontSize: '1.1rem',
          },
        }}
      />

      {/* 글자수 카운터 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="body2" color={value.length < 10 ? 'error.main' : 'text.secondary'}>
          {value.length < 10 ? '10자 이상 작성해주세요' : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value.length}/200자
        </Typography>
      </Box>

      {/* 예시 문구 */}
      <Paper
        sx={{
          bgcolor: 'grey.50',
          p: 2.5,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <LightbulbOutlinedIcon sx={{ fontSize: 20, color: 'warning.main' }} />
          <Typography variant="subtitle2" fontWeight={600}>
            이런 내용을 넣으면 좋아요
          </Typography>
        </Box>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {EXAMPLE_INTRODUCTIONS.map((example, index) => (
            <Box
              component="li"
              key={index}
              sx={{
                mb: 1,
                cursor: 'pointer',
                '&:hover': {
                  color: 'primary.main',
                },
                transition: 'color 0.2s',
              }}
              onClick={() => onChange(example)}
            >
              <Typography variant="body2" color="inherit">
                {example}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          * 예시를 클릭하면 자동 입력됩니다
        </Typography>
      </Paper>
    </Box>
  );
}
