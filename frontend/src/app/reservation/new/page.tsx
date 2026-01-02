'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Rating,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle, Verified } from '@mui/icons-material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import { SERVICE_AREAS, SERVICE_PRICES, FEE_STRUCTURE } from '@/lib/constants';
import type { ServiceType } from '@/types';

// 임시 추천 동행인 데이터
const MOCK_RECOMMENDED = [
  {
    id: '1',
    name: '김미영',
    introduction: '15년간 대학병원 간호사로 근무',
    certifications: [{ type: 'nurse', name: '간호사', isVerified: true }],
    rating: 4.9,
    totalServices: 127,
  },
  {
    id: '2',
    name: '이순자',
    introduction: '요양보호사 자격증 보유, 어르신 동행 전문',
    certifications: [{ type: 'careWorker', name: '요양보호사', isVerified: true }],
    rating: 4.8,
    totalServices: 89,
  },
  {
    id: '5',
    name: '정민수',
    introduction: '정기 병원 방문 동행 경험 다수',
    certifications: [{ type: 'careWorker', name: '요양보호사', isVerified: true }],
    rating: 4.9,
    totalServices: 203,
  },
];

type MatchType = 'auto' | 'select';

const STEPS = ['서비스 선택', '일정 입력', '동행인 선택', '예약 확인'];

function ReservationNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');

  // Step 1: 서비스 선택
  const [serviceType, setServiceType] = useState<ServiceType>(
    (searchParams.get('type') as ServiceType) || 'full_care'
  );

  // Step 2: 일정 입력
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [hours, setHours] = useState(2);
  const [area, setArea] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');

  // Step 3: 동행인 선택
  const [matchType, setMatchType] = useState<MatchType>('auto');
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>([]);

  // Step 4: 동의
  const [agreeTerms, setAgreeTerms] = useState(false);

  // 시간 옵션
  const timeOptions = useMemo(() => {
    const options = [];
    for (let h = 7; h <= 20; h++) {
      options.push(`${h.toString().padStart(2, '0')}:00`);
      options.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return options;
  }, []);

  // 요금 계산
  const priceInfo = useMemo(() => {
    const basePrice = SERVICE_PRICES[serviceType] || 0;
    const totalPrice = basePrice * hours;
    const deposit = Math.round(totalPrice * FEE_STRUCTURE.DEPOSIT_RATE);
    const pgFee = Math.round(deposit * FEE_STRUCTURE.PG_FEE_RATE);
    const remainingPrice = totalPrice - deposit;

    return {
      basePrice,
      totalPrice,
      deposit,
      pgFee,
      platformFee: FEE_STRUCTURE.PLATFORM_FEE,
      remainingPrice,
    };
  }, [serviceType, hours]);

  const handleCompanionToggle = (id: string) => {
    setSelectedCompanions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((c) => c !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleNext = () => {
    setError('');

    // 유효성 검사
    if (activeStep === 1) {
      if (!date) {
        setError('날짜를 선택해주세요.');
        return;
      }
      if (!area) {
        setError('서비스 지역을 선택해주세요.');
        return;
      }
      if (!hospitalName) {
        setError('병원명을 입력해주세요.');
        return;
      }
      if (serviceType === 'full_care' && !pickupAddress) {
        setError('픽업 주소를 입력해주세요.');
        return;
      }
    }

    if (activeStep === 2) {
      if (matchType === 'select' && selectedCompanions.length === 0) {
        setError('동행인을 1명 이상 선택해주세요.');
        return;
      }
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!agreeTerms) {
      setError('이용약관에 동의해주세요.');
      return;
    }

    // TODO: API 호출 - 예약 생성
    // 결제 페이지로 이동
    router.push('/reservation/payment?id=temp-reservation-id');
  };

  const renderStep1 = () => (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        서비스 유형을 선택해주세요
      </Typography>

      <RadioGroup
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value as ServiceType)}
      >
        <Card
          sx={{
            mb: 2,
            border: '2px solid',
            borderColor: serviceType === 'full_care' ? 'primary.main' : 'grey.200',
          }}
        >
          <CardContent>
            <FormControlLabel
              value="full_care"
              control={<Radio />}
              label={
                <Box>
                  <Typography fontWeight={600}>풀케어 (자택 픽업)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    집 → 병원 → 약국 → 귀가까지 전 과정 동행
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight={600}>
                    {SERVICE_PRICES.full_care.toLocaleString()}원/시간
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
            />
          </CardContent>
        </Card>

        <Card
          sx={{
            mb: 2,
            border: '2px solid',
            borderColor: serviceType === 'hospital_care' ? 'primary.main' : 'grey.200',
          }}
        >
          <CardContent>
            <FormControlLabel
              value="hospital_care"
              control={<Radio />}
              label={
                <Box>
                  <Typography fontWeight={600}>병원케어</Typography>
                  <Typography variant="body2" color="text.secondary">
                    병원 내 만남 → 진료동행 → 수납/약수령
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight={600}>
                    {SERVICE_PRICES.hospital_care.toLocaleString()}원/시간
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
            />
          </CardContent>
        </Card>

        <Card
          sx={{
            mb: 2,
            border: '2px solid',
            borderColor: serviceType === 'special_care' ? 'primary.main' : 'grey.200',
          }}
        >
          <CardContent>
            <FormControlLabel
              value="special_care"
              control={<Radio />}
              label={
                <Box>
                  <Typography fontWeight={600}>특화케어</Typography>
                  <Typography variant="body2" color="text.secondary">
                    건강검진, 수술, 항암치료 등 맞춤 서비스
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight={600}>
                    별도 협의
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
            />
          </CardContent>
        </Card>
      </RadioGroup>
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        일정 및 장소를 입력해주세요
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="날짜"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>시간</InputLabel>
            <Select value={time} label="시간" onChange={(e) => setTime(e.target.value)}>
              {timeOptions.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>예상 소요시간</InputLabel>
            <Select
              value={hours}
              label="예상 소요시간"
              onChange={(e) => setHours(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                <MenuItem key={h} value={h}>
                  {h}시간
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>서비스 지역</InputLabel>
            <Select value={area} label="서비스 지역" onChange={(e) => setArea(e.target.value)}>
              {SERVICE_AREAS.map((a) => (
                <MenuItem key={a.code} value={a.code}>
                  {a.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {serviceType === 'full_care' && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="픽업 주소"
              placeholder="자택 주소를 입력해주세요"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="병원명"
            placeholder="방문할 병원 이름"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="병원 주소 (선택)"
            placeholder="병원 주소"
            value={hospitalAddress}
            onChange={(e) => setHospitalAddress(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="증상 및 요청사항 (선택)"
            placeholder="동행인에게 미리 알려주고 싶은 내용을 적어주세요"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderStep3 = () => (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        동행인 선택 방식
      </Typography>

      <RadioGroup value={matchType} onChange={(e) => setMatchType(e.target.value as MatchType)}>
        <Card
          sx={{
            mb: 2,
            border: '2px solid',
            borderColor: matchType === 'auto' ? 'primary.main' : 'grey.200',
          }}
        >
          <CardContent>
            <FormControlLabel
              value="auto"
              control={<Radio />}
              label={
                <Box>
                  <Typography fontWeight={600}>자동 매칭 (추천)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    조건에 맞는 동행인 3명을 추천받고, 그 중 한 분이 배정됩니다.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0 }}
            />
          </CardContent>
        </Card>

        <Card
          sx={{
            mb: 2,
            border: '2px solid',
            borderColor: matchType === 'select' ? 'primary.main' : 'grey.200',
          }}
        >
          <CardContent>
            <FormControlLabel
              value="select"
              control={<Radio />}
              label={
                <Box>
                  <Typography fontWeight={600}>직접 선택</Typography>
                  <Typography variant="body2" color="text.secondary">
                    원하는 동행인을 최대 3명까지 선택하세요. 수락한 분 중 한 분이 배정됩니다.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0 }}
            />
          </CardContent>
        </Card>
      </RadioGroup>

      {matchType === 'auto' && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            추천 동행인 미리보기
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {MOCK_RECOMMENDED.map((companion) => (
              <Card key={companion.id} variant="outlined">
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{companion.name[0]}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={600}>{companion.name}</Typography>
                        <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={companion.rating} size="small" readOnly precision={0.1} />
                        <Typography variant="body2" color="text.secondary">
                          {companion.rating} · {companion.totalServices}회
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {matchType === 'select' && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            동행인 선택 (최대 3명)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            선택한 동행인 중 수락한 분이 배정됩니다.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {MOCK_RECOMMENDED.map((companion) => (
              <Card
                key={companion.id}
                sx={{
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: selectedCompanions.includes(companion.id)
                    ? 'primary.main'
                    : 'grey.200',
                }}
                onClick={() => handleCompanionToggle(companion.id)}
              >
                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Checkbox checked={selectedCompanions.includes(companion.id)} />
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{companion.name[0]}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography fontWeight={600}>{companion.name}</Typography>
                        <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {companion.introduction}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Rating value={companion.rating} size="small" readOnly precision={0.1} />
                        <Typography variant="body2" color="text.secondary">
                          {companion.rating} · {companion.totalServices}회
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          {selectedCompanions.length > 0 && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              {selectedCompanions.length}명 선택됨
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );

  const renderStep4 = () => (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        예약 정보 확인
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                서비스
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>
                {serviceType === 'full_care'
                  ? '풀케어'
                  : serviceType === 'hospital_care'
                    ? '병원케어'
                    : '특화케어'}
              </Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                일시
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>
                {date} {time} ({hours}시간)
              </Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                병원
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>{hospitalName}</Typography>
            </Grid>

            {serviceType === 'full_care' && (
              <>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    픽업 주소
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography>{pickupAddress}</Typography>
                </Grid>
              </>
            )}

            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                매칭 방식
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography>
                {matchType === 'auto' ? '자동 매칭 (3인 추천)' : `직접 선택 (${selectedCompanions.length}명)`}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 요금 안내 */}
      <Card sx={{ bgcolor: '#F5F3EF', mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            요금 안내
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              서비스 요금 ({priceInfo.basePrice.toLocaleString()}원 × {hours}시간)
            </Typography>
            <Typography>{priceInfo.totalPrice.toLocaleString()}원</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              예약금 (20%)
            </Typography>
            <Typography fontWeight={600} color="primary">
              {priceInfo.deposit.toLocaleString()}원
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            * 예약금만 결제, 잔금 {priceInfo.remainingPrice.toLocaleString()}원은 서비스 완료 후 현장 정산
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">
              수수료 (PG {priceInfo.pgFee.toLocaleString()}원 + 운영비 {priceInfo.platformFee.toLocaleString()}원)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(priceInfo.pgFee + priceInfo.platformFee).toLocaleString()}원
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <FormControlLabel
        control={
          <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
        }
        label={
          <Typography variant="body2">
            이용약관 및 취소/환불 정책에 동의합니다.
          </Typography>
        }
      />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumb
          items={[{ label: '예약 신청' }]}
          showBackButton={true}
        />

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            예약 신청
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}
          {activeStep === 3 && renderStep4()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              이전
            </Button>
            {activeStep < STEPS.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                다음
              </Button>
            ) : (
              <Button variant="contained" onClick={handleSubmit} disabled={!agreeTerms}>
                예약금 결제하기
              </Button>
            )}
          </Box>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}

// Suspense로 감싸서 export
export default function ReservationNewPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>로딩 중...</Typography>
        </Box>
      }
    >
      <ReservationNewContent />
    </Suspense>
  );
}
