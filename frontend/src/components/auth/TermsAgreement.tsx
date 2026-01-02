'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

interface TermsAgreementProps {
  onAgree: () => void;
  onBack: () => void;
}

/**
 * 회원가입 약관 동의 컴포넌트
 * - 이용약관, 개인정보처리방침, 보험 안내 (필수)
 * - 마케팅 수신 동의 (선택)
 */
export default function TermsAgreement({ onAgree, onBack }: TermsAgreementProps) {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeInsurance, setAgreeInsurance] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const isRequiredAgreed = agreeTerms && agreePrivacy && agreeInsurance;
  const isAllAgreed = isRequiredAgreed && agreeMarketing;

  const handleAgreeAll = (checked: boolean) => {
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeInsurance(checked);
    setAgreeMarketing(checked);
  };

  const handleNext = () => {
    if (isRequiredAgreed) {
      onAgree();
    }
  };

  return (
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
          label={<Typography fontWeight={600}>전체 동의</Typography>}
        />
      </Box>

      {/* 개별 약관 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
        <TermsItem
          label="이용약관 동의"
          required
          checked={agreeTerms}
          onChange={setAgreeTerms}
          href="/terms"
        />
        <TermsItem
          label="개인정보처리방침 동의"
          required
          checked={agreePrivacy}
          onChange={setAgreePrivacy}
          href="/privacy"
        />
        <TermsItem
          label="보험 및 책임 안내 동의"
          required
          checked={agreeInsurance}
          onChange={setAgreeInsurance}
          href="/terms#insurance"
        />
        <TermsItem
          label="마케팅 정보 수신 동의"
          checked={agreeMarketing}
          onChange={setAgreeMarketing}
        />
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleNext}
        disabled={!isRequiredAgreed}
      >
        동의하고 계속하기
      </Button>
      <Button fullWidth variant="text" sx={{ mt: 1 }} onClick={onBack}>
        이전으로
      </Button>
    </Box>
  );
}

interface TermsItemProps {
  label: string;
  required?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
  href?: string;
}

function TermsItem({ label, required, checked, onChange, href }: TermsItemProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <FormControlLabel
        control={
          <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} size="small" />
        }
        label={
          <Typography variant="body2" color={required ? 'inherit' : 'text.secondary'}>
            {required && (
              <Typography component="span" color="error.main" fontWeight={600}>
                [필수]
              </Typography>
            )}
            {!required && '[선택]'} {label}
          </Typography>
        }
      />
      {href && (
        <Link href={href} target="_blank" style={{ textDecoration: 'none' }}>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
            보기
          </Typography>
        </Link>
      )}
    </Box>
  );
}
