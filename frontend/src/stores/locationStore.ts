import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  // 사용자가 설정한 지역
  province: string; // 시/도 코드
  district: string; // 시/군/구 코드

  // IP 기반 감지 지역
  detectedProvince: string;
  detectedDistrict: string;

  // 위치 정보 로드 상태
  isLoaded: boolean;
  isDetecting: boolean;

  // 액션
  setLocation: (province: string, district: string) => void;
  setDetectedLocation: (province: string, district: string) => void;
  setIsDetecting: (isDetecting: boolean) => void;
  clearLocation: () => void;

  // 현재 사용할 지역 (사용자 설정 우선, 없으면 감지된 지역)
  getEffectiveProvince: () => string;
  getEffectiveDistrict: () => string;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      province: '',
      district: '',
      detectedProvince: '',
      detectedDistrict: '',
      isLoaded: false,
      isDetecting: false,

      setLocation: (province, district) =>
        set({
          province,
          district,
          isLoaded: true,
        }),

      setDetectedLocation: (province, district) =>
        set({
          detectedProvince: province,
          detectedDistrict: district,
          isLoaded: true,
          isDetecting: false,
        }),

      setIsDetecting: (isDetecting) => set({ isDetecting }),

      clearLocation: () =>
        set({
          province: '',
          district: '',
        }),

      getEffectiveProvince: () => {
        const state = get();
        return state.province || state.detectedProvince || 'seoul';
      },

      getEffectiveDistrict: () => {
        const state = get();
        return state.district || state.detectedDistrict || '';
      },
    }),
    {
      name: 'gyeote-location',
      partialize: (state) => ({
        province: state.province,
        district: state.district,
      }),
    }
  )
);
