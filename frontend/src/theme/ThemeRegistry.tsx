'use client';

import { ReactNode } from 'react';

import QueryProvider from '@/components/providers/QueryProvider';

import ScaledThemeProvider from './ScaledThemeProvider';

interface ThemeRegistryProps {
  children: ReactNode;
}

/**
 * 테마 레지스트리 - 앱 전체에 MUI 테마 및 Query Client 적용
 * - ScaledThemeProvider: 글씨 크기 설정 전역 적용
 * - QueryProvider: TanStack Query 전역 적용
 */
export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  return (
    <QueryProvider>
      <ScaledThemeProvider>{children}</ScaledThemeProvider>
    </QueryProvider>
  );
}
