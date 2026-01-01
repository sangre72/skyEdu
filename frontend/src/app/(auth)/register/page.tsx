'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  DirectionsCar,
  Home,
  Person,
  RadioButtonUnchecked,
} from '@mui/icons-material';

import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

type Step = 'role' | 'terms' | 'phone' | 'verify' | 'name';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<UserRole | null>(null);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  // 약관 동의 상태
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeInsurance, setAgreeInsurance] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

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

  // 필수 약관 동의 여부
  const isRequiredAgreed = agreeTerms && agreePrivacy && agreeInsurance;

  // 전체 동의
  const isAllAgreed = agreeTerms && agreePrivacy && agreeInsurance && agreeMarketing;

  const handleAgreeAll = (checked: boolean) => {
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeInsurance(checked);
    setAgreeMarketing(checked);
  };

  const handleTermsNext = () => {
    if (!isRequiredAgreed) {
      setError('필수 약관에 모두 동의해주세요.');
      return;
    }
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

      // 사용자 정보 저장
      login(response.user, response.access_token, response.refresh_token);

      // 동행인이면 프로필 등록 페이지로, 고객이면 홈으로
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

  const renderRoleSelection = () => (
    <Box>
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
        어떤 서비스를 이용하시겠습니까?
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Card
          sx={{
            cursor: 'pointer',
            border: '2px solid transparent',
            '&:hover': { borderColor: 'primary.main' },
          }}
          onClick={() => handleSelectRole('customer')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Person sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                동행 서비스 이용
              </Typography>
              <Typography variant="body2" color="text.secondary">
                병원에 함께 갈 동행인을 찾고 있어요
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            cursor: 'pointer',
            border: '2px solid transparent',
            '&:hover': { borderColor: 'primary.main' },
          }}
          onClick={() => handleSelectRole('companion')}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DirectionsCar sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                동행인으로 활동
              </Typography>
              <Typography variant="body2" color="text.secondary">
                병원동행 서비스를 제공하고 싶어요
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderTermsAgreement = () => (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        서비스 이용을 위해 약관에 동의해주세요.
      </Typography>

      {/* 전체 동의 */}
      <Box
        sx={{
          p: 2,
          mb: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: isAllAgreed ? 'primary.main' : 'grey.300',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllAgreed}
              onChange={(e) => handleAgreeAll(e.target.checked)}
              icon={<RadioButtonUnchecked />}
              checkedIcon={<CheckCircle />}
            />
          }
          label={
            <Typography fontWeight={600}>전체 동의</Typography>
          }
        />
      </Box>

      {/* 개별 약관 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        {/* 이용약관 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                <Typography component="span" color="error.main" fontWeight={600}>
                  [필수]
                </Typography>{' '}
                이용약관 동의
              </Typography>
            }
          />
          <Link href="/terms" target="_blank" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              보기
            </Typography>
          </Link>
        </Box>

        {/* 개인정보처리방침 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                <Typography component="span" color="error.main" fontWeight={600}>
                  [필수]
                </Typography>{' '}
                개인정보처리방침 동의
              </Typography>
            }
          />
          <Link href="/privacy" target="_blank" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              보기
            </Typography>
          </Link>
        </Box>

        {/* 보험 안내 동의 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeInsurance}
                onChange={(e) => setAgreeInsurance(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2">
                <Typography component="span" color="error.main" fontWeight={600}>
                  [필수]
                </Typography>{' '}
                보험 및 책임 안내 동의
              </Typography>
            }
          />
          <Link href="/terms#insurance" target="_blank" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
              보기
            </Typography>
          </Link>
        </Box>

        {/* 마케팅 동의 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeMarketing}
                onChange={(e) => setAgreeMarketing(e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                [선택] 마케팅 정보 수신 동의
              </Typography>
            }
          />
        </Box>
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleTermsNext}
        disabled={!isRequiredAgreed}
      >
        동의하고 계속하기
      </Button>
      <Button
        fullWidth
        variant="text"
        sx={{ mt: 1 }}
        onClick={() => {
          setStep('role');
          setAgreeTerms(false);
          setAgreePrivacy(false);
          setAgreeInsurance(false);
          setAgreeMarketing(false);
          setError('');
        }}
      >
        이전으로
      </Button>
    </Box>
  );

  const renderPhoneInput = () => (
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
      <Button
        fullWidth
        variant="text"
        sx={{ mt: 1 }}
        onClick={() => {
          setStep('role');
          setPhone('');
          setError('');
        }}
      >
        이전으로
      </Button>
    </Box>
  );

  const renderCodeVerify = () => (
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
          setStep('phone');
          setCode('');
          setError('');
        }}
      >
        다른 번호로 인증
      </Button>
    </Box>
  );

  const renderNameInput = () => (
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
          setStep('verify');
          setName('');
          setError('');
        }}
      >
        이전으로
      </Button>
    </Box>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'role':
        return '회원가입';
      case 'terms':
        return '약관 동의';
      case 'phone':
        return '휴대폰 인증';
      case 'verify':
        return '인증번호 확인';
      case 'name':
        return '정보 입력';
      default:
        return '회원가입';
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'role':
        router.back();
        break;
      case 'terms':
        setStep('role');
        setAgreeTerms(false);
        setAgreePrivacy(false);
        setAgreeInsurance(false);
        setAgreeMarketing(false);
        setError('');
        break;
      case 'phone':
        setStep('terms');
        setPhone('');
        setError('');
        break;
      case 'verify':
        setStep('phone');
        setCode('');
        setError('');
        break;
      case 'name':
        setStep('verify');
        setName('');
        setError('');
        break;
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">
        {/* 상단 네비게이션 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ color: 'text.secondary' }}>
            <ArrowBack />
          </IconButton>
          <IconButton onClick={() => router.push('/')} sx={{ color: 'text.secondary' }}>
            <Home />
          </IconButton>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            textAlign="center"
            sx={{ mb: 1 }}
          >
            {getStepTitle()}
          </Typography>

          {step !== 'role' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
              {['terms', 'phone', 'verify', 'name'].map((s, i) => (
                <Box
                  key={s}
                  sx={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    bgcolor:
                      ['terms', 'phone', 'verify', 'name'].indexOf(step) >= i
                        ? 'primary.main'
                        : 'grey.300',
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

          {step === 'role' && renderRoleSelection()}
          {step === 'terms' && renderTermsAgreement()}
          {step === 'phone' && renderPhoneInput()}
          {step === 'verify' && renderCodeVerify()}
          {step === 'name' && renderNameInput()}

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
      </Container>
    </Box>
  );
}
