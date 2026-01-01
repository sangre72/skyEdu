'use client';

import { useRouter } from 'next/navigation';

import LoginModal from '@/components/auth/LoginModal';
import { useUIStore } from '@/stores/uiStore';

export default function ModalProvider() {
  const router = useRouter();
  const { loginModalOpen, closeLoginModal } = useUIStore();

  return (
    <>
      <LoginModal
        open={loginModalOpen}
        onClose={closeLoginModal}
        onSwitchToRegister={() => {
          closeLoginModal();
          router.push('/register');
        }}
      />
    </>
  );
}
