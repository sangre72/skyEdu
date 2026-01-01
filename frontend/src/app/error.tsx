'use client';

import { useEffect } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          문제가 발생했습니다
        </Typography>
        <Typography color="text.secondary">
          페이지를 불러오는 중 오류가 발생했습니다.
        </Typography>
        <Button variant="contained" onClick={reset}>
          다시 시도
        </Button>
      </Box>
    </Container>
  );
}
