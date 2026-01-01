'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Breadcrumbs,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  Home,
  NavigateNext,
} from '@mui/icons-material';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;
}

export default function Breadcrumb({
  items,
  showBackButton = true,
  backHref,
}: BreadcrumbProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 3,
        py: 1,
      }}
    >
      {showBackButton && (
        <IconButton
          onClick={handleBack}
          size="small"
          sx={{
            mr: 1,
            bgcolor: 'grey.100',
            '&:hover': { bgcolor: 'grey.200' },
          }}
        >
          <ArrowBack fontSize="small" />
        </IconButton>
      )}

      <Breadcrumbs
        separator={<NavigateNext fontSize="small" sx={{ color: 'grey.400' }} />}
        sx={{ flex: 1 }}
      >
        <Link
          href="/"
          underline="hover"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
        >
          <Home fontSize="small" sx={{ mr: 0.5 }} />
          홈
        </Link>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast || !item.href) {
            return (
              <Typography
                key={index}
                color={isLast ? 'text.primary' : 'text.secondary'}
                fontWeight={isLast ? 600 : 400}
                sx={{ fontSize: '0.875rem' }}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              underline="hover"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
                fontSize: '0.875rem',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
