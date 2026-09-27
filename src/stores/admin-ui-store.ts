"use client";

import { create } from "zustand";

type AdminUiState = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

export const useAdminUi = create<AdminUiState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
