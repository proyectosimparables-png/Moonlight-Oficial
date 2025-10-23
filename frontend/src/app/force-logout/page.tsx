'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function ForceLogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout(); // limpia sesión
    router.push('/'); // te redirige al home
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Forzar Logout
      </button>
    </div>
  );
}
