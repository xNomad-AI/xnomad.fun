import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AuthorizationToken, userStorage } from "./storage";

export const useUserInfoStore = create(
  immer<{
    userInfo?: AuthorizationToken;
    setUserInfo: (userInfo: AuthorizationToken) => void;
    initUserInfo: (address: string) => boolean;
    removeUserInfo: (address: string) => void;
  }>((set, get) => ({
    userInfo: undefined,
    setUserInfo: (userInfo) => {
      set((state) => {
        state.userInfo = userInfo;
        userStorage.cacheToken(
          userInfo.address,
          userInfo.jwt,
          userInfo.expires
        );
      });
    },
    initUserInfo: (address: string) => {
      const token = userStorage.getCachedToken(address);
      if (token) {
        set((state) => {
          state.userInfo = token;
        });
        return true;
      } else {
        return false;
      }
    },
    removeUserInfo: () => {
      set((state) => {
        state.userInfo = undefined;
        userStorage.removeCurrentToken();
      });
    },
  }))
);
