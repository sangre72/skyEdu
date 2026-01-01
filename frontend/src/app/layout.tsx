import type { Metadata } from 'next';

import ThemeRegistry from '@/theme/ThemeRegistry';

import './globals.css';

export const metadata: Metadata = {
  title: '스카이동행 - 병원동행 서비스',
  description: '든든한 스카이동행이 되어드립니다. 병원 방문이 어려운 분들을 위한 맞춤형 동행매니저 매칭 플랫폼',
  keywords: ['병원동행', '의료동행', '병원보호자', '수면내시경', '건강검진동행', '스카이동행'],
  openGraph: {
    title: '스카이동행 - 병원동행 서비스',
    description: '든든한 스카이동행이 되어드립니다',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
