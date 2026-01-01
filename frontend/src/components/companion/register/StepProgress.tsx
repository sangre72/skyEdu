'use client';

import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Step {
  label: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Progress bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {steps.map((_, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Step circle */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor:
                  index < currentStep
                    ? 'primary.main'
                    : index === currentStep
                      ? 'primary.main'
                      : 'grey.200',
                color: index <= currentStep ? 'white' : 'grey.500',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                boxShadow:
                  index === currentStep ? '0 0 0 4px rgba(2, 136, 209, 0.2)' : 'none',
              }}
            >
              {index < currentStep ? (
                <CheckCircleIcon sx={{ fontSize: 20 }} />
              ) : (
                index + 1
              )}
            </Box>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  flex: 1,
                  height: 3,
                  mx: 1,
                  bgcolor: index < currentStep ? 'primary.main' : 'grey.200',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* Step labels */}
      <Box sx={{ display: 'flex' }}>
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              textAlign:
                index === 0 ? 'left' : index === steps.length - 1 ? 'right' : 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: index === currentStep ? 600 : 400,
                color: index <= currentStep ? 'text.primary' : 'text.secondary',
                transition: 'all 0.3s ease',
              }}
            >
              {step.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
