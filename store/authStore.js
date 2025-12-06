import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  userType: null, // 'learner' or 'institution'
  setUser: (user) => {
    const userType = user?.user_metadata?.user_type || 'learner';
    set({ user, userType });
  },
  setUserType: (userType) => set({ userType }),
  clearAuth: () => set({ user: null, userType: null }),
}));

