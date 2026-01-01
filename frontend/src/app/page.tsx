'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  ArrowForward,
  CheckCircle,
  DirectionsCar,
  Favorite,
  Groups,
  HealthAndSafety,
  LocalHospital,
  MedicalServices,
  Phone,
  Schedule,
  Star,
  Verified,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
} from '@mui/material';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

// Unsplash 자연 테마 이미지 (하늘, 구름, 자연)
const NATURE_IMAGES = [
  'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=800&q=80', // 하늘과 구름
  'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80', // 맑은 하늘
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&q=80', // 숲과 하늘
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // 해변
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80', // 산과 초원
];

export default function HomePage() {
  const router = useRouter();
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    // 랜덤 자연 이미지 선택
    const randomImage = NATURE_IMAGES[Math.floor(Math.random() * NATURE_IMAGES.length)];
    setBgImage(randomImage);
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      {/* Hero Section - 자연 이미지 배경 */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 8, md: 12 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: bgImage ? `url(${bgImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.9)',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(227,242,253,0.88) 50%, rgba(187,222,251,0.85) 100%)',
            zIndex: 1,
          },
        }}
      >

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="신뢰할 수 있는 병원동행 서비스"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 3,
                  px: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 800,
                  color: '#1A1A2E',
                  mb: 3,
                  lineHeight: 1.3,
                }}
              >
                병원 가는 길,
                <br />
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #0288D1 0%, #0277BD 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  든든한 스카이동행이 되어드려요
                </Box>
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  color: '#5A6A7A',
                  mb: 4,
                  lineHeight: 1.8,
                }}
              >
                간호사, 요양보호사 출신 전문 매니저가
                <br />
                자택에서 병원까지, 안전하게 동행합니다.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => router.push('/reservation/new')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                  }}
                >
                  예약하기
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/companions')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    bgcolor: 'white',
                    borderColor: '#E2E8F0',
                    color: '#1A1A2E',
                    '&:hover': {
                      bgcolor: '#F8FAFC',
                      borderColor: '#CBD5E1',
                    },
                  }}
                >
                  동행인 찾기
                </Button>
              </Box>

              {/* 간단한 통계 */}
              <Box sx={{ display: 'flex', gap: 4, mt: 5, flexWrap: 'wrap' }}>
                {[
                  { value: '4.9', label: '평균 평점', icon: <Star sx={{ color: '#FFC107', fontSize: 20 }} /> },
                  { value: '1만+', label: '누적 동행', icon: <Groups sx={{ color: '#0288D1', fontSize: 20 }} /> },
                  { value: '500+', label: '전문 매니저', icon: <Verified sx={{ color: '#43A047', fontSize: 20 }} /> },
                ].map((stat, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {stat.icon}
                    <Box>
                      <Typography fontWeight={700} fontSize="1.25rem" color="#1A1A2E">
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* 우측: 빠른 예약 카드 */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 1,
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                    어떤 서비스가 필요하세요?
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      {
                        type: 'full_care',
                        icon: <DirectionsCar />,
                        title: '풀케어',
                        subtitle: '집 → 병원 → 약국 → 귀가',
                        price: '35,000원/시간',
                        color: '#0288D1',
                        popular: true,
                      },
                      {
                        type: 'hospital_care',
                        icon: <LocalHospital />,
                        title: '병원케어',
                        subtitle: '병원 내 만남 → 진료동행',
                        price: '25,000원/시간',
                        color: '#00897B',
                        popular: false,
                      },
                      {
                        type: 'special_care',
                        icon: <MedicalServices />,
                        title: '특화케어',
                        subtitle: '건강검진, 수술, 항암치료 등',
                        price: '별도 협의',
                        color: '#7B1FA2',
                        popular: false,
                      },
                    ].map((service) => (
                      <Box
                        key={service.type}
                        onClick={() => router.push(`/reservation/new?type=${service.type}`)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2.5,
                          bgcolor: '#F8FAFC',
                          borderRadius: 3,
                          cursor: 'pointer',
                          border: '2px solid transparent',
                          position: 'relative',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: '#EBF5FF',
                            borderColor: service.color,
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        {service.popular && (
                          <Chip
                            label="인기"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -10,
                              right: 12,
                              bgcolor: '#FF6B6B',
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        )}
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: `${service.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: service.color,
                          }}
                        >
                          {service.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={700}>{service.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.subtitle}
                          </Typography>
                        </Box>
                        <Typography fontWeight={600} color={service.color}>
                          {service.price}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 신뢰 포인트 */}
      <Box sx={{ py: 5, bgcolor: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {[
              { icon: <HealthAndSafety sx={{ fontSize: 28 }} />, text: '전문 자격 보유 매니저', color: '#0288D1' },
              { icon: <CheckCircle sx={{ fontSize: 28 }} />, text: '배상책임보험 가입', color: '#43A047' },
              { icon: <Favorite sx={{ fontSize: 28 }} />, text: '평균 평점 4.9점', color: '#E53935' },
              { icon: <Groups sx={{ fontSize: 28 }} />, text: '누적 동행 1만건+', color: '#7B1FA2' },
            ].map((item, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#F8FAFC',
                    },
                  }}
                >
                  <Box sx={{ color: item.color }}>{item.icon}</Box>
                  <Typography fontWeight={600} color="#1A1A2E">
                    {item.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 이용 방법 */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Chip
              label="간단한 3단계"
              sx={{ bgcolor: '#E3F2FD', color: '#0288D1', fontWeight: 600, mb: 2 }}
            />
            <Typography variant="h2" fontWeight={700}>
              이용 방법
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                step: '01',
                title: '예약 신청',
                desc: '날짜, 병원, 서비스를 선택하고\n간단히 예약을 신청합니다.',
                color: '#0288D1',
              },
              {
                step: '02',
                title: '매니저 배정',
                desc: '검증된 전문 매니저가\n자동 또는 직접 선택으로 배정됩니다.',
                color: '#00897B',
              },
              {
                step: '03',
                title: '동행 서비스',
                desc: '약속된 시간에 매니저가 방문하여\n안전하게 동행합니다.',
                color: '#7B1FA2',
              },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 2,
                    border: 'none',
                    bgcolor: 'white',
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}CC 100%)`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        mx: 'auto',
                        mb: 3,
                        boxShadow: `0 8px 24px ${item.color}40`,
                      }}
                    >
                      {item.step}
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                      {item.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => router.push('/reservation/new')}
              sx={{ px: 5, py: 1.5, borderRadius: 3 }}
            >
              지금 예약하기
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 동행인 등록 CTA */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: 'linear-gradient(135deg, #01579B 0%, #0288D1 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
                전문 동행인으로 활동하고 싶으신가요?
              </Typography>
              <Typography sx={{ opacity: 0.9, fontSize: '1.1rem' }}>
                간호사, 요양보호사, 사회복지사 등 관련 자격이 있다면
                <br />
                스카이동행 매니저로 활동하실 수 있습니다.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/companion/register')}
                sx={{
                  bgcolor: 'white',
                  color: '#0288D1',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  '&:hover': {
                    bgcolor: '#F5F5F5',
                  },
                }}
              >
                동행인 등록하기
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 문의 안내 */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'white' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
              도움이 필요하신가요?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
              궁금한 점이 있으시면 언제든 문의해 주세요.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 4,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Card sx={{ p: 3, minWidth: 200, textAlign: 'center' }}>
                <Phone sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  전화 상담
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  1588-0000
                </Typography>
              </Card>
              <Card sx={{ p: 3, minWidth: 200, textAlign: 'center' }}>
                <Schedule sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  운영 시간
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  평일 09:00 - 18:00
                </Typography>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
