'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';

interface StepPhoneVerificationProps {
  phone: string;
  onPhoneChange: (value: string) => void;
  isVerified: boolean;
  onVerified: (verified: boolean) => void;
  // 이미 인증된 번호가 있는 경우 (로그인한 사용자)
  existingPhone?: string;
  existingPhoneVerified?: boolean;
}

export default function StepPhoneVerification({
  phone,
  onPhoneChange,
  isVerified,
  onVerified,
  existingPhone,
  existingPhoneVerified = false,
}: StepPhoneVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [useExisting, setUseExisting] = useState(existingPhoneVerified);

  // 기존 인증 번호 사용 시 자동 설정
  useEffect(() => {
    if (existingPhone && existingPhoneVerified && useExisting) {
      onPhoneChange(existingPhone);
      onVerified(true);
    }
  }, [existingPhone, existingPhoneVerified, useExisting, onPhoneChange, onVerified]);

  // 타이머 카운트다운
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // 전화번호 포맷팅 (010-1234-5678)
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 번호 마스킹 (010-****-5678)
  const maskPhoneNumber = (phoneNumber: string) => {
    const numbers = phoneNumber.replace(/-/g, '');
    if (numbers.length !== 11) return phoneNumber;
    return `${numbers.slice(0, 3)}-****-${numbers.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (formatted.replace(/-/g, '').length <= 11) {
      onPhoneChange(formatted);
      // 번호가 변경되면 인증 상태 초기화
      if (isVerified) {
        onVerified(false);
        setCodeSent(false);
        setVerificationCode('');
      }
    }
  };

  // 다른 번호로 인증하기
  const handleUseNewNumber = () => {
    setUseExisting(false);
    onPhoneChange('');
    onVerified(false);
    setCodeSent(false);
    setVerificationCode('');
    setError('');
  };

  // 기존 번호 사용하기
  const handleUseExisting = () => {
    if (existingPhone && existingPhoneVerified) {
      setUseExisting(true);
      onPhoneChange(existingPhone);
      onVerified(true);
      setError('');
    }
  };

  // 인증번호 발송
  const handleSendCode = useCallback(async () => {
    const phoneNumbers = phone.replace(/-/g, '');
    if (phoneNumbers.length !== 11) {
      setError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: API 호출 - 인증번호 발송
      // await api.post('/auth/verify-phone/send', { phone: phoneNumbers });

      // Mock: 1초 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCodeSent(true);
      setTimer(180); // 3분 타이머
    } catch {
      setError('인증번호 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [phone]);

  // 인증번호 확인
  const handleVerifyCode = useCallback(async () => {
    if (verificationCode.length !== 6) {
      setError('6자리 인증번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: API 호출 - 인증번호 확인
      // await api.post('/auth/verify-phone/verify', {
      //   phone: phone.replace(/-/g, ''),
      //   code: verificationCode,
      // });

      // Mock: 1초 대기 후 성공
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock: 인증번호가 123456이면 성공
      if (verificationCode === '123456') {
        onVerified(true);
      } else {
        setError('인증번호가 일치하지 않습니다.');
      }
    } catch {
      setError('인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, onVerified]);

  // 타이머 포맷
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        휴대폰 인증
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        동행인 등록을 위해 휴대폰 인증이 필요합니다.
        <br />
        인증된 번호로 예약 알림을 받으실 수 있어요.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 기존 인증된 번호가 있는 경우 */}
      {existingPhone && existingPhoneVerified && (
        <Paper
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: useExisting ? 'success.50' : 'grey.50',
            border: '1px solid',
            borderColor: useExisting ? 'success.main' : 'grey.300',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {useExisting && <CheckCircleIcon color="success" />}
              <Box>
                <Typography variant="subtitle2" color={useExisting ? 'success.dark' : 'text.secondary'}>
                  이미 인증된 번호
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {maskPhoneNumber(existingPhone)}
                </Typography>
              </Box>
            </Box>
            {useExisting ? (
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={handleUseNewNumber}
              >
                다른 번호 사용
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={handleUseExisting}
              >
                이 번호 사용
              </Button>
            )}
          </Box>
        </Paper>
      )}

      {/* 기존 번호 사용 시 - 완료 상태 표시 */}
      {useExisting && isVerified ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            기존 인증 번호를 사용합니다
          </Typography>
          <Typography variant="body1" color="text.secondary">
            다음 단계로 진행해주세요
          </Typography>
        </Box>
      ) : !useExisting && isVerified ? (
        // 새 번호 인증 완료 상태
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
            인증이 완료되었습니다
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {phone}
          </Typography>
          <Button
            size="small"
            sx={{ mt: 2 }}
            onClick={() => {
              onVerified(false);
              setCodeSent(false);
              setVerificationCode('');
            }}
          >
            다른 번호로 인증
          </Button>
        </Box>
      ) : !useExisting ? (
        <>
          {/* 구분선 (기존 번호가 있는 경우) */}
          {existingPhone && existingPhoneVerified && (
            <Box sx={{ mb: 3 }}>
              <Divider>
                <Typography variant="body2" color="text.secondary">
                  또는 새 번호로 인증
                </Typography>
              </Divider>
            </Box>
          )}

          {/* 휴대폰 번호 입력 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              휴대폰 번호
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="010-0000-0000"
                value={phone}
                onChange={handlePhoneChange}
                disabled={codeSent && timer > 0}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneAndroidIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '1.1rem',
                  },
                }}
              />
              <Button
                variant={codeSent ? 'outlined' : 'contained'}
                onClick={handleSendCode}
                disabled={isLoading || phone.replace(/-/g, '').length !== 11 || (codeSent && timer > 0)}
                sx={{ minWidth: 120, whiteSpace: 'nowrap' }}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : codeSent ? (
                  '재발송'
                ) : (
                  '인증번호 받기'
                )}
              </Button>
            </Box>
          </Box>

          {/* 인증번호 입력 */}
          {codeSent && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                인증번호
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="6자리 입력"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 6) {
                      setVerificationCode(value);
                    }
                  }}
                  InputProps={{
                    endAdornment: timer > 0 && (
                      <InputAdornment position="end">
                        <Typography
                          variant="body2"
                          color={timer < 60 ? 'error.main' : 'primary.main'}
                          fontWeight={600}
                        >
                          {formatTime(timer)}
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      letterSpacing: '0.2em',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6 || timer === 0}
                  sx={{ minWidth: 100 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : '확인'}
                </Button>
              </Box>
              {timer === 0 && codeSent && (
                <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                  인증 시간이 만료되었습니다. 다시 인증번호를 받아주세요.
                </Typography>
              )}
            </Box>
          )}

          {/* 안내 문구 */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              테스트 환경에서는 인증번호 <strong>123456</strong>을 입력해주세요.
            </Typography>
          </Alert>
        </>
      ) : null}
    </Box>
  );
}
