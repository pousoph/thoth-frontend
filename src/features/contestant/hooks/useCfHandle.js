/**
 * useCfHandle — retorna el handle de Codeforces del usuario autenticado.
 * El handle llega directamente del backend en la respuesta del login
 * y queda persistido en authStore.user.codeforcesHandle.
 */
import useAuthStore from '@/store/authStore';

const useCfHandle = () => {
  const handle = useAuthStore((s) => s.getCfHandle());
  return { handle: handle ?? '' };
};

export default useCfHandle;