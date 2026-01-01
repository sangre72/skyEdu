'use client';

import { ReactNode, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import ModalProvider from '@/components/providers/ModalProvider';
import { useSettingsStore } from '@/stores/settingsStore';

import { theme as baseTheme } from './theme';

interface ScaledThemeProviderProps {
  children: ReactNode;
}

/**
 * 글씨 크기 설정이 전역으로 적용되는 테마 프로바이더
 * - settingsStore의 uiSize에 따라 MUI 테마의 typography가 동적으로 변경됨
 * - CSS 변수로도 scale 값을 제공하여 커스텀 스타일링에서 사용 가능
 */
export default function ScaledThemeProvider({ children }: ScaledThemeProviderProps) {
  const scale = useSettingsStore((state) => state.getScale());
  const uiSize = useSettingsStore((state) => state.uiSize);

  // CSS 변수 업데이트
  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', String(scale));
    document.documentElement.style.setProperty('--ui-size', uiSize);

    // html 요소의 font-size를 조절하여 rem 기반 크기 전체에 영향
    document.documentElement.style.fontSize = `${scale * 100}%`;
  }, [scale, uiSize]);

  // scale에 따라 동적으로 테마 생성
  const scaledTheme = useMemo(() => {
    return createTheme({
      ...baseTheme,
      typography: {
        ...baseTheme.typography,
        // 기본 폰트 크기를 scale에 맞게 조정
        fontSize: 14 * scale,
        htmlFontSize: 16, // rem 계산 기준
        h1: {
          ...baseTheme.typography.h1,
          fontSize: `${2.25 * scale}rem`,
        },
        h2: {
          ...baseTheme.typography.h2,
          fontSize: `${1.75 * scale}rem`,
        },
        h3: {
          ...baseTheme.typography.h3,
          fontSize: `${1.5 * scale}rem`,
        },
        h4: {
          ...baseTheme.typography.h4,
          fontSize: `${1.25 * scale}rem`,
        },
        h5: {
          ...baseTheme.typography.h5,
          fontSize: `${1.125 * scale}rem`,
        },
        h6: {
          ...baseTheme.typography.h6,
          fontSize: `${1 * scale}rem`,
        },
        body1: {
          ...baseTheme.typography.body1,
          fontSize: `${1 * scale}rem`,
        },
        body2: {
          ...baseTheme.typography.body2,
          fontSize: `${0.875 * scale}rem`,
        },
        subtitle1: {
          fontSize: `${1 * scale}rem`,
          fontWeight: 500,
          lineHeight: 1.5,
        },
        subtitle2: {
          fontSize: `${0.875 * scale}rem`,
          fontWeight: 500,
          lineHeight: 1.5,
        },
        caption: {
          fontSize: `${0.75 * scale}rem`,
          lineHeight: 1.5,
        },
        overline: {
          fontSize: `${0.75 * scale}rem`,
          fontWeight: 600,
          letterSpacing: '0.08em',
          lineHeight: 2,
          textTransform: 'uppercase' as const,
        },
        button: {
          ...baseTheme.typography.button,
          fontSize: `${0.95 * scale}rem`,
        },
      },
      components: {
        ...baseTheme.components,
        MuiButton: {
          ...baseTheme.components?.MuiButton,
          styleOverrides: {
            ...baseTheme.components?.MuiButton?.styleOverrides,
            root: {
              ...(baseTheme.components?.MuiButton?.styleOverrides?.root as object),
              fontSize: `${0.95 * scale}rem`,
              padding: `${12 * scale}px ${28 * scale}px`,
            },
            sizeSmall: {
              fontSize: `${0.85 * scale}rem`,
              padding: `${8 * scale}px ${16 * scale}px`,
            },
            sizeLarge: {
              fontSize: `${1.05 * scale}rem`,
              padding: `${14 * scale}px ${32 * scale}px`,
            },
          },
        },
        MuiChip: {
          ...baseTheme.components?.MuiChip,
          styleOverrides: {
            ...baseTheme.components?.MuiChip?.styleOverrides,
            root: {
              ...(baseTheme.components?.MuiChip?.styleOverrides?.root as object),
              fontSize: `${0.875 * scale}rem`,
            },
            sizeSmall: {
              fontSize: `${0.75 * scale}rem`,
            },
          },
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              fontSize: `${1 * scale}rem`,
            },
          },
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              fontSize: `${1 * scale}rem`,
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              fontSize: `${0.95 * scale}rem`,
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              fontSize: `${0.875 * scale}rem`,
            },
            head: {
              fontSize: `${0.875 * scale}rem`,
              fontWeight: 600,
            },
          },
        },
        MuiAlert: {
          styleOverrides: {
            root: {
              fontSize: `${0.875 * scale}rem`,
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              fontSize: `${0.9 * scale}rem`,
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              fontSize: `${0.75 * scale}rem`,
            },
          },
        },
      },
    });
  }, [scale]);

  return (
    <ThemeProvider theme={scaledTheme}>
      <CssBaseline />
      {children}
      <ModalProvider />
    </ThemeProvider>
  );
}
