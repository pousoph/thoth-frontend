import { create } from 'zustand';

const getInitialTheme = () => {
  try {
    return localStorage.getItem('thoth-theme') || 'dark';
  } catch { return 'dark'; }
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('thoth-theme', theme); } catch {}
};

// Apply on load
applyTheme(getInitialTheme());

const useThemeStore = create((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => set((s) => {
    const next = s.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    return { theme: next };
  }),
}));

export default useThemeStore;
