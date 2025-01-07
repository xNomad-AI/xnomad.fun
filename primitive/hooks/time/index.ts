import { create } from 'zustand';

export const useTimeStore = create<{
  currentTimeTick: number;
  setCurrentTimeTick: (tick: number) => void;
  startTick: () => NodeJS.Timeout;
}>((set) => ({
  currentTimeTick: 0,
  setCurrentTimeTick: (tick: number) => set({ currentTimeTick: tick }),
  startTick: () => {
    return setInterval(() => {
      set((state) => ({ currentTimeTick: state.currentTimeTick + 1 }));
    }, 1000);
  },
}));
