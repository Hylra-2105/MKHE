import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useEffectsConfig = create(
  persist(
    (set) => ({
      enableEffects: true,
      toggleEffects: () => set((state) => ({ enableEffects: !state.enableEffects })),
      setEnableEffects: (value) => set({ enableEffects: value }),
    }),
    {
      name: 'mkhe-effects-config',
    }
  )
);

export default useEffectsConfig;
