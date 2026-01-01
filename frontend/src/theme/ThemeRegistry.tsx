'use client';

import { ReactNode } from 'react';

import ScaledThemeProvider from './ScaledThemeProvider';

interface ThemeRegistryProps {
  children: ReactNode;
}

/**
 * 테마 레지스트리 - 앱 전체에 MUI 테마 적용
 * ScaledThemeProvider를 통해 글씨 크기 설정이 전역으로 적용됨
 */
export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  return <ScaledThemeProvider>{children}</ScaledThemeProvider>;
}
