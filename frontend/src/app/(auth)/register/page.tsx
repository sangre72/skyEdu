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
import { RoleSelection, TermsAgreement } from '@/components/auth';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useAuthRedirect } from '@/hooks';
import type { UserRole } from '@/types';

type Step = 'role' | 'terms' | 'phone' | 'verify' | 'name';

const STEP_TITLES: Record<Step, string> = {
  role: '회원가입',
  terms: '약관 동의',
  phone: '휴대폰 인증',
  verify: '인증번호 확인',
  name: '정보 입력',
};

const PROGRESS_STEPS: Step[] = ['terms', 'phone', 'verify', 'name'];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { isRedirecting } = useAuthRedirect();

  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<UserRole | null>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

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

  const handleSelectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('terms');
  };

  const handleTermsAgree = () => {
    setError('');
    setStep('phone');
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
      const response = await api.verifyCode({ phone: phoneNumbers, code });

      if (response.success && response.verification_token) {
        setVerificationToken(response.verification_token);
        setStep('name');
      } else {
        setError('인증에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '인증번호가 일치하지 않습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (name.trim().length < 2) {
      setError('이름을 2자 이상 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const phoneNumbers = phone.replace(/-/g, '');
      const response = await api.register({
        phone: phoneNumbers,
        name: name.trim(),
        role: role as 'customer' | 'companion',
        verification_token: verificationToken,
      });

      login(response.user, response.access_token, response.refresh_token);

      if (role === 'companion') {
        router.push('/companion/register');
      } else {
        router.push('/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '회원가입에 실패했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = (targetStep: Step) => {
    setError('');
    setStep(targetStep);
  };

  const currentStepIndex = PROGRESS_STEPS.indexOf(step);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb items={[{ label: '회원가입' }]} showBackButton={true} />

        <Box sx={{ maxWidth: 480, mx: 'auto', mt: 2 }}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>
              {STEP_TITLES[step]}
            </Typography>

            {/* 진행 표시 (role 단계 제외) */}
            {step !== 'role' && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                {PROGRESS_STEPS.map((s, i) => (
                  <Box
                    key={s}
                    sx={{
                      width: 40,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: currentStepIndex >= i ? 'primary.main' : 'grey.300',
                    }}
                  />
                ))}
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Step: 역할 선택 */}
            {step === 'role' && <RoleSelection onSelect={handleSelectRole} />}

            {/* Step: 약관 동의 */}
            {step === 'terms' && (
              <TermsAgreement onAgree={handleTermsAgree} onBack={() => handleBack('role')} />
            )}

            {/* Step: 휴대폰 입력 */}
            {step === 'phone' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  본인 확인을 위해 휴대폰 번호를 입력해주세요.
                </Typography>
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
                  disabled={isLoading || phone.replace(/-/g, '').length !== 11}
                >
                  {isLoading ? '발송 중...' : '인증번호 받기'}
                </Button>
                <Button fullWidth variant="text" sx={{ mt: 1 }} onClick={() => handleBack('terms')}>
                  이전으로
                </Button>
              </Box>
            )}

            {/* Step: 인증번호 확인 */}
            {step === 'verify' && (
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
                  sx={{ mb: 3 }}
                  inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                  helperText="개발 모드: 000000 입력"
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleVerifyCode}
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? '확인 중...' : '인증 확인'}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setCode('');
                    handleBack('phone');
                  }}
                >
                  다른 번호로 인증
                </Button>
              </Box>
            )}

            {/* Step: 이름 입력 */}
            {step === 'name' && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  서비스에서 사용할 이름을 입력해주세요.
                </Typography>
                <TextField
                  fullWidth
                  label="이름"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleRegister}
                  disabled={isLoading || name.trim().length < 2}
                >
                  {isLoading ? '가입 중...' : '가입 완료'}
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setName('');
                    handleBack('verify');
                  }}
                >
                  이전으로
                </Button>
              </Box>
            )}

            {/* 하단 링크 */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                이미 회원이신가요?{' '}
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => router.push('/login')}
                >
                  로그인
                </Typography>
              </Typography>
              {step !== 'role' && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, cursor: 'pointer' }}
                  onClick={() => router.push('/')}
                >
                  가입 취소
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
