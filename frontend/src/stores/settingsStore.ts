import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// UI 크기 단계: small, medium, large, xlarge
type UISize = 'small' | 'medium' | 'large' | 'xlarge';

interface SettingsState {
  // UI 크기 설정
  uiSize: UISize;

  // 크기별 배율
  getScale: () => number;

  // Actions
  setUISize: (size: UISize) => void;
  increaseSize: () => void;
  decreaseSize: () => void;
}

const SIZE_ORDER: UISize[] = ['small', 'medium', 'large', 'xlarge'];

const SIZE_SCALES: Record<UISize, number> = {
  small: 0.9,
  medium: 1.0,
  large: 1.15,
  xlarge: 1.3,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      uiSize: 'medium',

      getScale: () => SIZE_SCALES[get().uiSize],

      setUISize: (size) => set({ uiSize: size }),

      increaseSize: () => {
        const currentIndex = SIZE_ORDER.indexOf(get().uiSize);
        if (currentIndex < SIZE_ORDER.length - 1) {
          set({ uiSize: SIZE_ORDER[currentIndex + 1] });
        }
      },

      decreaseSize: () => {
        const currentIndex = SIZE_ORDER.indexOf(get().uiSize);
        if (currentIndex > 0) {
          set({ uiSize: SIZE_ORDER[currentIndex - 1] });
        }
      },
    }),
    {
      name: 'gyeote-settings', // localStorage 키
      partialize: (state) => ({ uiSize: state.uiSize }), // uiSize만 저장
    }
  )
);

// 크기별 폰트 사이즈 계산 유틸리티
export const getScaledFontSize = (baseSize: number, scale: number): string => {
  return `${baseSize * scale}rem`;
};

// 크기 라벨
export const SIZE_LABELS: Record<UISize, string> = {
  small: '작게',
  medium: '보통',
  large: '크게',
  xlarge: '아주 크게',
};
