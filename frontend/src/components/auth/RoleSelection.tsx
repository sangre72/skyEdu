'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { DirectionsCar, Person } from '@mui/icons-material';

import type { UserRole } from '@/types';

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
}

/**
 * 회원가입 역할 선택 컴포넌트
 * - 고객(customer): 동행 서비스 이용
 * - 동행인(companion): 동행 서비스 제공
 */
export default function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
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
          onClick={() => onSelect('customer')}
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
          onClick={() => onSelect('companion')}
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
}
