import { create } from 'zustand';

interface UIState {
  // 모달 상태
  loginModalOpen: boolean;
  registerModalOpen: boolean;

  // Actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  loginModalOpen: false,
  registerModalOpen: false,

  openLoginModal: () => set({ loginModalOpen: true, registerModalOpen: false }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  openRegisterModal: () => set({ registerModalOpen: true, loginModalOpen: false }),
  closeRegisterModal: () => set({ registerModalOpen: false }),
  switchToLogin: () => set({ loginModalOpen: true, registerModalOpen: false }),
  switchToRegister: () => set({ registerModalOpen: true, loginModalOpen: false }),
}));
