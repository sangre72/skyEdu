'use client';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Add, Remove, TextFields } from '@mui/icons-material';

import { useSettingsStore, SIZE_LABELS } from '@/stores/settingsStore';

interface UISizeControlProps {
  showLabel?: boolean;
  variant?: 'compact' | 'full';
}

export default function UISizeControl({ showLabel = true, variant = 'full' }: UISizeControlProps) {
  const { uiSize, increaseSize, decreaseSize } = useSettingsStore();

  const isMinSize = uiSize === 'small';
  const isMaxSize = uiSize === 'xlarge';

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="글씨 작게">
          <span>
            <IconButton size="small" onClick={decreaseSize} disabled={isMinSize}>
              <Remove fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="글씨 크기">
          <TextFields fontSize="small" color="action" />
        </Tooltip>
        <Tooltip title="글씨 크게">
          <span>
            <IconButton size="small" onClick={increaseSize} disabled={isMaxSize}>
              <Add fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: '#F5F5F5',
        borderRadius: 2,
        px: 1.5,
        py: 0.75,
      }}
    >
      {showLabel && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
          <TextFields fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={500} color="text.secondary">
            글씨 크기
          </Typography>
        </Box>
      )}

      <Tooltip title="글씨 작게">
        <span>
          <IconButton
            size="small"
            onClick={decreaseSize}
            disabled={isMinSize}
            sx={{
              bgcolor: 'white',
              boxShadow: 1,
              '&:hover': { bgcolor: 'grey.100' },
              '&.Mui-disabled': { bgcolor: 'grey.200' },
            }}
          >
            <Remove fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Typography
        variant="body2"
        fontWeight={600}
        sx={{
          minWidth: 70,
          textAlign: 'center',
          color: 'primary.main',
        }}
      >
        {SIZE_LABELS[uiSize]}
      </Typography>

      <Tooltip title="글씨 크게">
        <span>
          <IconButton
            size="small"
            onClick={increaseSize}
            disabled={isMaxSize}
            sx={{
              bgcolor: 'white',
              boxShadow: 1,
              '&:hover': { bgcolor: 'grey.100' },
              '&.Mui-disabled': { bgcolor: 'grey.200' },
            }}
          >
            <Add fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
