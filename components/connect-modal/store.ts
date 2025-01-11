"use client";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const useConnectModalStore = create(
  immer<{
    visible: boolean;
    setVisible: (visible: boolean) => void;
  }>((set) => {
    return {
      visible: false,
      setVisible: (visible: boolean) => {
        set((state) => {
          state.visible = visible;
        });
      },
    };
  })
);
