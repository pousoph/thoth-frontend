import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // user: { username, role, level, codeforcesHandle }
      user:            null,
      token:           null,
      isAuthenticated: false,
      pendingUserId:   null,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      setPendingUserId:  (id) => set({ pendingUserId: id }),
      clearPendingUserId: ()  => set({ pendingUserId: null }),

      clearAuth: () => set({ user: null, token: null, isAuthenticated: false, pendingUserId: null }),

      getToken:           () => get().token,
      getUser:            () => get().user,
      getRole:            () => get().user?.role          ?? null,
      getPendingUserId:   () => get().pendingUserId,
      getCfHandle:        () => get().user?.codeforcesHandle ?? null,
    }),
    {
      name:    'thoth-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        isAuthenticated: state.isAuthenticated,
        pendingUserId:   state.pendingUserId,
      }),
    }
  )
);

export default useAuthStore;