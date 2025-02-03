import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const usePageProgressStore = create(
  immer<{
    progress: number;
    setProgress: (progress: number) => void;
    triggerProgress: (destination: string) => void;
    endProgress: () => void;
  }>((set, get) => {
    let intervalRef: ReturnType<typeof setInterval>;
    return {
      progress: 0,
      setProgress: (progress: number) => {
        set((state) => {
          state.progress = progress;
        });
      },
      triggerProgress: (destination: string) => {
        const { pathname } = window.location;
        if (destination === pathname) {
          return;
        }
        set((state) => {
          state.progress = 20;
        });
        if (intervalRef) {
          clearInterval(intervalRef);
        }
        intervalRef = setInterval(() => {
          set((state) => {
            let prev = state.progress;
            if (prev < 60) {
              prev += 20;
            }
            if (prev < 90) {
              prev += 10;
            }
            if (prev < 99) {
              prev += 1;
            } else {
              clearInterval(intervalRef);
            }
            state.progress = prev;
          });
        }, 1000);
      },
      endProgress: () => {
        if (get().progress === 0) {
          return;
        }
        set((state) => {
          state.progress = 100;
        });
        if (intervalRef) {
          clearInterval(intervalRef);
        }
        setTimeout(() => {
          set((state) => {
            state.progress = 0;
          });
        }, 500);
      },
    };
  })
);
