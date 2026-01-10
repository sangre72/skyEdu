'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useAuthRedirect, useMaintenanceMode } from '@/hooks';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { isRedirecting } = useAuthRedirect();
  const isMaintenanceMode = useMaintenanceMode();

  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 리다이렉트 중일 때 로딩 표시
  if (isRedirecting) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

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
      const errorMessage = err instanceof Error ? err.message : '인증번호 발송에 실패했습니다.';
      setError(errorMessage);
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
      const response = await api.login({ phone: phoneNumbers, code });

      // 사용자 정보 저장
      login(response.user, response.access_token, response.refresh_token);

      // 역할에 따라 다른 페이지로 이동
      if (response.user.role === 'companion') {
        router.push('/companion/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={[{ label: '로그인' }]} showBackButton={true} />

        <Box sx={{ maxWidth: 480, mx: 'auto', mt: 2 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>
              로그인
            </Typography>
            <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
              휴대폰 번호로 간편하게 로그인하세요
            </Typography>

            {isMaintenanceMode && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                현재 시스템 점검 중입니다. 잠시 후 다시 시도해주세요.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {step === 'phone' ? (
              <Box>
                <TextField
                  fullWidth
                  label="휴대폰 번호"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={handlePhoneChange}
                  sx={{ mb: 3 }}
                  inputProps={{ inputMode: 'numeric' }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSendCode}
                  disabled={isLoading || phone.replace(/-/g, '').length !== 11 || isMaintenanceMode}
                >
                  {isLoading ? '발송 중...' : '인증번호 받기'}
                </Button>

                {/* 개발용 안내 */}
                <Box sx={{ mt: 3, p: 2, bgcolor: '#F5F3EF', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    개발 모드 안내
                  </Typography>
                  <Typography variant="body2">인증번호: 000000 입력 시 인증 통과</Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {phone}로 발송된 인증번호를 입력해주세요.
                </Typography>
                <TextField
                  fullWidth
                  label="인증번호"
                  placeholder="6자리 숫자"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  sx={{ mb: 2 }}
                  inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                  helperText="개발 모드: 000000 입력"
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleVerifyCode}
                  disabled={isLoading || code.length !== 6 || isMaintenanceMode}
                  sx={{ mb: 2 }}
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
                >
                  다른 번호로 로그인
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                아직 회원이 아니신가요?{' '}
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => router.push('/register')}
                >
                  회원가입
                </Typography>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
