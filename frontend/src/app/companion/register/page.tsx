'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import StepProgress from '@/components/companion/register/StepProgress';
import StepPhoneVerification from '@/components/companion/register/StepPhoneVerification';
import StepNameSetting from '@/components/companion/register/StepNameSetting';
import StepIntroduction from '@/components/companion/register/StepIntroduction';
import StepAreaSelection from '@/components/companion/register/StepAreaSelection';
import StepCertification from '@/components/companion/register/StepCertification';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import type { ManagerCreateRequest } from '@/types';

const STEPS = [
  { label: '휴대폰 인증' },
  { label: '활동명' },
  { label: '자기소개' },
  { label: '활동지역' },
  { label: '자격증' },
];

export default function CompanionRegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // 현재 스텝 (0부터 시작)
  const [currentStep, setCurrentStep] = useState(0);

  // 폼 데이터
  const [phone, setPhone] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [name, setName] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);

  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 기존 사용자 정보 (로그인한 사용자 정보 사용)
  const existingUser = user ? {
    phone: user.phone,
    phoneVerified: user.is_verified,
    name: user.name,
  } : null;

  // 휴대폰 인증 상태 변경 핸들러
  const handlePhoneVerified = useCallback((verified: boolean) => {
    setIsPhoneVerified(verified);
  }, []);

  // 현재 스텝 유효성 검사
  const validateCurrentStep = (): boolean => {
    setError('');

    switch (currentStep) {
      case 0: // 휴대폰 인증
        if (!isPhoneVerified) {
          setError('휴대폰 인증을 완료해주세요.');
          return false;
        }
        return true;

      case 1: // 활동명
        if (name.trim().length < 2) {
          setError('활동명을 2자 이상 입력해주세요.');
          return false;
        }
        if (name.trim().length > 20) {
          setError('활동명은 20자 이하로 입력해주세요.');
          return false;
        }
        return true;

      case 2: // 자기소개
        if (introduction.trim().length < 10) {
          setError('소개글을 10자 이상 작성해주세요.');
          return false;
        }
        return true;

      case 3: // 활동지역
        if (selectedAreas.length === 0) {
          setError('서비스 가능 지역을 1개 이상 선택해주세요.');
          return false;
        }
        return true;

      case 4: // 자격증 (선택사항이므로 항상 true)
        return true;

      default:
        return true;
    }
  };

  // 다음 스텝으로
  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 이전 스텝으로
  const handleBack = () => {
    if (currentStep > 0) {
      setError('');
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 최종 제출
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    setError('');

    try {
      // 동행인 프로필 등록 API 호출
      const requestData: ManagerCreateRequest = {
        introduction,
        available_areas: selectedAreas,
        certifications: selectedCerts,
      };

      await api.registerManager(requestData);

      // 스케줄 설정 페이지로 이동
      router.push('/companion/schedule');
    } catch (err) {
      // 에러 메시지 처리
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('등록에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 스텝에 따른 컨텐츠 렌더링
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepPhoneVerification
            phone={phone}
            onPhoneChange={setPhone}
            isVerified={isPhoneVerified}
            onVerified={handlePhoneVerified}
            existingPhone={existingUser?.phone}
            existingPhoneVerified={existingUser?.phoneVerified}
          />
        );
      case 1:
        return (
          <StepNameSetting
            name={name}
            onNameChange={setName}
            existingName={existingUser?.name}
          />
        );
      case 2:
        return (
          <StepIntroduction
            value={introduction}
            onChange={setIntroduction}
          />
        );
      case 3:
        return (
          <StepAreaSelection
            selectedAreas={selectedAreas}
            onChange={setSelectedAreas}
          />
        );
      case 4:
        return (
          <StepCertification
            selectedCerts={selectedCerts}
            onChange={setSelectedCerts}
          />
        );
      default:
        return null;
    }
  };

  // 다음 버튼 활성화 여부
  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !isPhoneVerified;
      case 1:
        return name.trim().length < 2 || name.trim().length > 20;
      case 2:
        return introduction.trim().length < 10;
      case 3:
        return selectedAreas.length === 0;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb
          items={[
            { label: '마이페이지', href: '/mypage' },
            { label: '동행인 프로필 등록' },
          ]}
          backHref="/mypage"
        />

        {/* 스텝 진행률 */}
        <StepProgress steps={STEPS} currentStep={currentStep} />

        <Paper sx={{ p: { xs: 3, sm: 4 } }}>
          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* 스텝 컨텐츠 */}
          {renderStepContent()}

          {/* 네비게이션 버튼 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 4,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              disabled={currentStep === 0}
              sx={{
                visibility: currentStep === 0 ? 'hidden' : 'visible',
              }}
            >
              이전
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
                disabled={isNextDisabled()}
              >
                다음
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
                sx={{
                  minWidth: 160,
                }}
              >
                {isLoading ? '등록 중...' : '등록 완료'}
              </Button>
            )}
          </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
