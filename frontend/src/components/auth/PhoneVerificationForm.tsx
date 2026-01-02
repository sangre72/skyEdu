'use client';

import { useState } from 'react';

import { Alert, Box, Button, TextField, Typography } from '@mui/material';

import { api } from '@/lib/api';

type Step = 'phone' | 'verify';

interface PhoneVerificationFormProps {
  /** 인증 완료 후 호출되는 콜백 (verificationToken 전달) */
  onVerified: (phone: string, verificationToken: string) => void;
  /** 제목 (기본: '휴대폰 인증') */
  title?: string;
  /** 부제목 */
  subtitle?: string;
  /** 인증 완료 버튼 텍스트 (기본: '인증 확인') */
  submitLabel?: string;
}

/**
 * 휴대폰 인증 폼 컴포넌트
 * - 휴대폰 번호 입력 → 인증번호 발송 → 인증번호 확인
 * - 인증 완료 시 verificationToken을 콜백으로 전달
 */
export default function PhoneVerificationForm({
  onVerified,
  title = '휴대폰 인증',
  subtitle = '본인 확인을 위해 휴대폰 번호를 입력해주세요.',
  submitLabel = '인증 확인',
}: PhoneVerificationFormProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 휴대폰 번호 포맷팅 (입력 중)
  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    if (formatted.replace(/-/g, '').length <= 11) {
      setPhone(formatted);
    }
  };

  const getPhoneNumbers = () => phone.replace(/-/g, '');

  const handleSendCode = async () => {
    const phoneNumbers = getPhoneNumbers();
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
      const phoneNumbers = getPhoneNumbers();
      const response = await api.verifyCode({ phone: phoneNumbers, code });

      if (response.success && response.verification_token) {
        onVerified(phoneNumbers, response.verification_token);
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

  const handleReset = () => {
    setStep('phone');
    setCode('');
    setError('');
  };

  return (
    <Box>
      {title && (
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
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
            sx={{ mb: 2 }}
            inputProps={{ inputMode: 'numeric' }}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSendCode}
            disabled={isLoading || getPhoneNumbers().length !== 11}
          >
            {isLoading ? '발송 중...' : '인증번호 받기'}
          </Button>

          {/* 개발용 안내 */}
          <Box sx={{ mt: 2, p: 2, bgcolor: '#F5F3EF', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              개발 모드 안내
            </Typography>
            <Typography variant="body2">
              인증번호: 000000 입력 시 인증 통과
            </Typography>
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
            disabled={isLoading || code.length !== 6}
            sx={{ mb: 2 }}
          >
            {isLoading ? '확인 중...' : submitLabel}
          </Button>
          <Button fullWidth variant="text" onClick={handleReset}>
            다른 번호로 인증
          </Button>
        </Box>
      )}
    </Box>
  );
}
