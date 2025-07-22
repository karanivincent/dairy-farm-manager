import { create } from 'zustand';

interface UIState {
  // Layout state
  sidebarOpen: boolean;
  bottomNavVisible: boolean;
  
  // Modal state
  modalStack: string[];
  
  // Loading states
  globalLoading: boolean;
  
  // Offline state
  isOnline: boolean;
  syncInProgress: boolean;
  lastSyncTime: Date | null;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setBottomNavVisible: (visible: boolean) => void;
  
  openModal: (modalId: string) => void;
  closeModal: (modalId?: string) => void;
  closeAllModals: () => void;
  
  setGlobalLoading: (loading: boolean) => void;
  
  setOnlineStatus: (online: boolean) => void;
  setSyncInProgress: (syncing: boolean) => void;
  setLastSyncTime: (time: Date) => void;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarOpen: false,
  bottomNavVisible: true,
  modalStack: [],
  globalLoading: false,
  isOnline: navigator.onLine,
  syncInProgress: false,
  lastSyncTime: null,
  theme: 'system',

  // Layout actions
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setBottomNavVisible: (bottomNavVisible) => set({ bottomNavVisible }),

  // Modal actions
  openModal: (modalId) => 
    set((state) => ({
      modalStack: [...state.modalStack, modalId]
    })),

  closeModal: (modalId) => 
    set((state) => ({
      modalStack: modalId 
        ? state.modalStack.filter(id => id !== modalId)
        : state.modalStack.slice(0, -1)
    })),

  closeAllModals: () => set({ modalStack: [] }),

  // Loading actions
  setGlobalLoading: (globalLoading) => set({ globalLoading }),

  // Sync actions
  setOnlineStatus: (isOnline) => set({ isOnline }),
  setSyncInProgress: (syncInProgress) => set({ syncInProgress }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),

  // Theme actions
  setTheme: (theme) => set({ theme }),
}));

// Set up online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useUIStore.getState().setOnlineStatus(true);
  });

  window.addEventListener('offline', () => {
    useUIStore.getState().setOnlineStatus(false);
  });
}