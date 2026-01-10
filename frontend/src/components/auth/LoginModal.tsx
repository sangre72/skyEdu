'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Close, Phone, Verified } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';

import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({ open, onClose, onSwitchToRegister }: LoginModalProps) {
  const router = useRouter();
  const { login } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 모달 닫힐 때 초기화
  const handleClose = () => {
    setStep('phone');
    setPhone('');
    setCode('');
    setError('');
    onClose();
  };

  // 휴대폰 번호 포맷팅
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.replace(/-/g, '').length <= 11) {
      setPhone(formatted);
    }
  };

  const handleSendCode = async () => {
    const phoneNumbers = phone.replace(/-/g, '');
    if (phoneNumbers.length !== 11) {
      setError('휴대폰 번호를 정확히 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.sendVerificationCode({ phone: phoneNumbers });
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증번호 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('인증번호 6자리를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const phoneNumbers = phone.replace(/-/g, '');

      // 1. 인증번호 확인
      await api.verifyCode({ phone: phoneNumbers, code });

      // 2. 로그인
      const response = await api.login({ phone: phoneNumbers, code });

      login(response.user, response.access_token, response.refresh_token);
      handleClose();

      if (response.user.role === 'companion') {
        router.push('/companion/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'phone' && phone.replace(/-/g, '').length === 11) {
        handleSendCode();
      } else if (step === 'verify' && code.length === 6) {
        handleVerifyCode();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* 상단 비주얼 */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4FC3F7 0%, #0288D1 100%)',
          py: 4,
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          }}
        >
          <Close />
        </IconButton>

        {/* 로고 */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 3,
            bgcolor: 'white',
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 하늘 배경 */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, #81D4FA 0%, #B3E5FC 100%)',
            }}
          />
          {/* 구름 */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 40,
              height: 16,
              bgcolor: 'white',
              borderRadius: '16px 16px 6px 6px',
              '&::before': {
                content: '""',
                position: 'absolute',
                bottom: 5,
                left: 6,
                width: 16,
                height: 16,
                bgcolor: 'white',
                borderRadius: '50%',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 3,
                right: 8,
                width: 12,
                height: 12,
                bgcolor: 'white',
                borderRadius: '50%',
              },
            }}
          />
          {/* 태양 */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 14,
              height: 14,
              bgcolor: '#FFD54F',
              borderRadius: '50%',
              boxShadow: '0 0 8px #FFD54F',
            }}
          />
        </Box>

        <Typography variant="h5" fontWeight={700} color="white">
          스카이동행
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
          든든한 스카이동행이 되어드립니다
        </Typography>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {step === 'phone' ? (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
              휴대폰 번호로 로그인
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              가입하신 휴대폰 번호를 입력해주세요
            </Typography>

            <TextField
              fullWidth
              placeholder="010-0000-0000"
              value={phone}
              onChange={handlePhoneChange}
              onKeyPress={handleKeyPress}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: '#0288D1' }} />
                  </InputAdornment>
                ),
              }}
              inputProps={{ inputMode: 'numeric' }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSendCode}
              disabled={isLoading || phone.replace(/-/g, '').length !== 11}
              sx={{ mb: 2, py: 1.5, borderRadius: 2 }}
            >
              {isLoading ? '발송 중...' : '인증번호 받기'}
            </Button>

            {/* 테스트 계정 */}
            <Box
              sx={{
                p: 2,
                bgcolor: '#F8FAFC',
                borderRadius: 2,
                border: '1px dashed #E2E8F0',
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                테스트 계정
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="primary.main">동행인</Typography>
                  <Typography variant="body2" fontWeight={500}>010-0000-0000</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="secondary.main">고객</Typography>
                  <Typography variant="body2" fontWeight={500}>010-1111-1111</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                인증번호: 000000
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Verified sx={{ color: '#43A047' }} />
              <Typography variant="subtitle1" fontWeight={600}>
                인증번호 입력
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {phone}로 발송된 6자리 인증번호를 입력해주세요
            </Typography>

            <TextField
              fullWidth
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={handleKeyPress}
              sx={{
                mb: 2,
                '& input': {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.5em',
                },
              }}
              inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleVerifyCode}
              disabled={isLoading || code.length !== 6}
              sx={{ mb: 2, py: 1.5, borderRadius: 2 }}
            >
              {isLoading ? '확인 중...' : '로그인'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setStep('phone');
                setCode('');
                setError('');
              }}
              sx={{ color: 'text.secondary' }}
            >
              다른 번호로 로그인
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            아직 회원이 아니신가요?{' '}
            <Typography
              component="span"
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', fontWeight: 600 }}
              onClick={() => {
                handleClose();
                if (onSwitchToRegister) {
                  onSwitchToRegister();
                } else {
                  router.push('/register');
                }
              }}
            >
              회원가입
            </Typography>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
