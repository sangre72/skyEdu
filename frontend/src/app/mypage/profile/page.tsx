'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import type { UserWithProfile, UserUpdateRequest } from '@/types';

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birth_date: '',
    address: '',
    emergency_contact: '',
  });

  // UI 상태
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 로그인 체크
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 사용자 정보 로드
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userData: UserWithProfile = await api.getMe();

        setFormData({
          name: userData.name || '',
          email: '',
          birth_date: userData.profile?.birth_date || '',
          address: userData.profile?.address || '',
          emergency_contact: userData.profile?.emergency_contact || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  // 입력 변경 핸들러
  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // 전화번호 포맷팅
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 비상연락처 변경 핸들러
  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({
      ...prev,
      emergency_contact: formatted.replace(/-/g, ''),
    }));
  };

  // 저장
  const handleSave = async () => {
    setError('');

    // 유효성 검사
    if (formData.name.trim().length < 2) {
      setError('이름은 2자 이상 입력해주세요.');
      return;
    }

    if (formData.emergency_contact && !/^01[0-9]{8,9}$/.test(formData.emergency_contact)) {
      setError('비상연락처 형식이 올바르지 않습니다.');
      return;
    }

    try {
      setIsSaving(true);

      const updateData: UserUpdateRequest = {};
      if (formData.name) updateData.name = formData.name;
      if (formData.email) updateData.email = formData.email;
      if (formData.birth_date) updateData.birth_date = formData.birth_date;
      if (formData.address) updateData.address = formData.address;
      if (formData.emergency_contact) updateData.emergency_contact = formData.emergency_contact;

      const updatedUser = await api.updateMe(updateData);

      // 스토어 업데이트
      updateUser({
        name: updatedUser.name,
        is_verified: updatedUser.is_verified,
      });

      setSuccessMessage('프로필이 저장되었습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb
          items={[
            { label: '마이페이지', href: '/mypage' },
            { label: '내 정보 수정' },
          ]}
          backHref="/mypage"
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: { xs: 3, sm: 4 } }}>
            {/* 에러 메시지 */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* 전화번호 (읽기 전용) */}
            <TextField
              fullWidth
              label="휴대폰 번호"
              value={user?.phone?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') || ''}
              disabled
              sx={{ mb: 3 }}
              helperText="휴대폰 번호는 변경할 수 없습니다."
            />

            {/* 이름 */}
            <TextField
              fullWidth
              label="이름"
              value={formData.name}
              onChange={handleChange('name')}
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 50 }}
            />

            {/* 생년월일 */}
            <TextField
              fullWidth
              label="생년월일"
              type="date"
              value={formData.birth_date}
              onChange={handleChange('birth_date')}
              sx={{ mb: 3 }}
              InputLabelProps={{ shrink: true }}
              helperText="서비스 이용 시 참고됩니다."
            />

            {/* 주소 */}
            <TextField
              fullWidth
              label="주소"
              value={formData.address}
              onChange={handleChange('address')}
              sx={{ mb: 3 }}
              placeholder="예: 서울시 강남구 역삼동"
              helperText="픽업 서비스 이용 시 참고됩니다."
            />

            {/* 비상연락처 */}
            <TextField
              fullWidth
              label="비상연락처"
              value={formatPhoneNumber(formData.emergency_contact)}
              onChange={handleEmergencyContactChange}
              sx={{ mb: 4 }}
              placeholder="010-0000-0000"
              helperText="긴급 상황 시 연락 가능한 가족/보호자 연락처"
            />

            {/* 저장 버튼 */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장하기'}
            </Button>
          </Paper>
        )}
      </Container>

      <Footer />

      {/* 성공 메시지 */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Box>
  );
}
