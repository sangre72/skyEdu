'use client';

import { useRouter } from 'next/navigation';

import { Email, Phone } from '@mui/icons-material';
import { Box, Container, Grid, Link, Typography } from '@mui/material';

export default function Footer() {
  const router = useRouter();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0F172A',
        color: 'white',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* 브랜드 */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {/* 하늘과 구름 로고 */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: 'linear-gradient(180deg, #4FC3F7 0%, #81D4FA 50%, #B3E5FC 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* 구름 */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 5,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 24,
                    height: 10,
                    bgcolor: 'white',
                    borderRadius: '10px 10px 3px 3px',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      bottom: 3,
                      left: 3,
                      width: 10,
                      height: 10,
                      bgcolor: 'white',
                      borderRadius: '50%',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 2,
                      right: 5,
                      width: 8,
                      height: 8,
                      bgcolor: 'white',
                      borderRadius: '50%',
                    },
                  }}
                />
                {/* 태양 */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    width: 8,
                    height: 8,
                    bgcolor: '#FFD54F',
                    borderRadius: '50%',
                  }}
                />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                스카이동행
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 2, lineHeight: 1.8 }}>
              든든한 스카이동행이 되어드립니다
              <br />
              공익을 위해 최소한의 수수료만 받습니다.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 18, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  1588-0000
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 18, opacity: 0.7 }} />
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  help@skydonghang.kr
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* 서비스 */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, opacity: 0.9 }}>
              서비스
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: '풀케어', path: '/reservation/new?type=full_care' },
                { label: '병원케어', path: '/reservation/new?type=hospital_care' },
                { label: '특화케어', path: '/reservation/new?type=special_care' },
              ].map((item) => (
                <Link
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  sx={{
                    color: 'white',
                    opacity: 0.6,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* 이용안내 */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, opacity: 0.9 }}>
              이용안내
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: '동행인 찾기', path: '/companions' },
                { label: '예약하기', path: '/reservation/new' },
                { label: '동행인 등록', path: '/companion/register' },
              ].map((item) => (
                <Link
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  sx={{
                    color: 'white',
                    opacity: 0.6,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* 고객지원 */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, opacity: 0.9 }}>
              고객지원
            </Typography>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                운영시간
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                평일 09:00 - 18:00
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mt: 1 }}>
                (주말 및 공휴일 휴무)
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 하단 */}
        <Box
          sx={{
            mt: 5,
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.4 }}>
            © 2025 스카이동행. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {[
              { label: '이용약관', path: '/terms' },
              { label: '개인정보처리방침', path: '/privacy' },
              { label: '사업자정보', path: '#' },
            ].map((item) => (
              <Link
                key={item.label}
                onClick={() => item.path !== '#' && router.push(item.path)}
                sx={{
                  color: 'white',
                  opacity: 0.4,
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                {item.label}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
