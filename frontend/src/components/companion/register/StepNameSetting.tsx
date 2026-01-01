'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface StepNameSettingProps {
  name: string;
  onNameChange: (value: string) => void;
  existingName?: string;
}

export default function StepNameSetting({
  name,
  onNameChange,
  existingName,
}: StepNameSettingProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  // 이름 유효성 검사
  const validateName = (value: string): string | null => {
    if (value.length < 2) {
      return '2자 이상 입력해주세요.';
    }
    if (value.length > 20) {
      return '20자 이하로 입력해주세요.';
    }
    // 한글, 영문, 숫자만 허용
    if (!/^[가-힣a-zA-Z0-9]+$/.test(value)) {
      return '한글, 영문, 숫자만 사용할 수 있습니다.';
    }
    // 부적절한 단어 체크 (예시)
    const forbiddenWords = ['관리자', 'admin', 'test', '운영자'];
    if (forbiddenWords.some((word) => value.toLowerCase().includes(word.toLowerCase()))) {
      return '사용할 수 없는 이름입니다.';
    }
    return null;
  };

  // 이름 중복 체크 (디바운스)
  useEffect(() => {
    if (name.length < 2) {
      setIsAvailable(null);
      return;
    }

    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      setIsAvailable(null);
      return;
    }

    setError('');
    setIsChecking(true);

    const timer = setTimeout(async () => {
      try {
        // TODO: API 호출 - 이름 중복 체크
        // const response = await api.get(`/users/check-name?name=${name}`);
        // setIsAvailable(response.data.available);

        // Mock: 1초 후 결과 반환
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock: '테스트', '홍길동'은 이미 사용 중
        const takenNames = ['테스트', '홍길동', '김동행'];
        setIsAvailable(!takenNames.includes(name));
      } catch {
        setError('중복 확인에 실패했습니다.');
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    onNameChange(value);
  };

  // 상태 아이콘 렌더링
  const renderStatusIcon = () => {
    if (isChecking) {
      return <CircularProgress size={20} />;
    }
    if (name.length >= 2 && isAvailable === true && !error) {
      return <CheckCircleIcon color="success" />;
    }
    if (name.length >= 2 && (isAvailable === false || error)) {
      return <ErrorIcon color="error" />;
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        활동명을 설정해주세요
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        고객에게 보여질 이름입니다.
        <br />
        실명 또는 닉네임을 사용할 수 있어요.
      </Typography>

      {/* 기존 이름이 있는 경우 표시 */}
      {existingName && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            회원가입 시 등록된 이름
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {existingName}
          </Typography>
        </Paper>
      )}

      {/* 이름 입력 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          활동명 (2~20자)
        </Typography>
        <TextField
          fullWidth
          placeholder="예: 김동행, 따뜻한케어"
          value={name}
          onChange={handleNameChange}
          error={!!error || isAvailable === false}
          helperText={
            error ||
            (isAvailable === false ? '이미 사용 중인 이름입니다.' : '') ||
            (isAvailable === true ? '사용 가능한 이름입니다.' : '')
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">{renderStatusIcon()}</InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.1rem',
            },
            '& .MuiFormHelperText-root': {
              color: isAvailable === true ? 'success.main' : undefined,
            },
          }}
        />
      </Box>

      {/* 안내 사항 */}
      <Paper
        sx={{
          bgcolor: 'primary.50',
          p: 2.5,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          활동명 작성 가이드
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          <Box component="li" sx={{ mb: 0.5 }}>
            <Typography variant="body2">한글, 영문, 숫자 조합 가능</Typography>
          </Box>
          <Box component="li" sx={{ mb: 0.5 }}>
            <Typography variant="body2">2자 이상 20자 이하</Typography>
          </Box>
          <Box component="li" sx={{ mb: 0.5 }}>
            <Typography variant="body2">특수문자, 공백 사용 불가</Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">등록 후에도 1회 변경 가능</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 추천 이름 */}
      {existingName && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            회원가입 시 등록한 이름 <strong>&quot;{existingName}&quot;</strong>을(를) 그대로 사용하시려면
            위 입력란에 동일하게 입력해주세요.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
