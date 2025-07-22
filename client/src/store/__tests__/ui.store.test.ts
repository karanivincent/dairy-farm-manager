import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../ui.store';

describe('UI Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useUIStore.getState();
    store.setSidebarOpen(false);
    store.setBottomNavVisible(true);
    store.closeAllModals();
    store.setGlobalLoading(false);
    store.setOnlineStatus(true);
    store.setSyncInProgress(false);
    store.setTheme('system');
  });

  it('should initialize with default state', () => {
    const store = useUIStore.getState();
    
    expect(store.sidebarOpen).toBe(false);
    expect(store.bottomNavVisible).toBe(true);
    expect(store.modalStack).toEqual([]);
    expect(store.globalLoading).toBe(false);
    expect(store.isOnline).toBe(true);
    expect(store.syncInProgress).toBe(false);
    expect(store.lastSyncTime).toBeNull();
    expect(store.theme).toBe('system');
  });

  it('should manage sidebar state', () => {
    const store = useUIStore.getState();
    
    store.setSidebarOpen(true);
    expect(useUIStore.getState().sidebarOpen).toBe(true);
    
    store.toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    
    store.toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('should manage bottom navigation visibility', () => {
    const store = useUIStore.getState();
    
    store.setBottomNavVisible(false);
    expect(useUIStore.getState().bottomNavVisible).toBe(false);
    
    store.setBottomNavVisible(true);
    expect(useUIStore.getState().bottomNavVisible).toBe(true);
  });

  it('should manage modal stack', () => {
    const store = useUIStore.getState();
    
    // Open modals
    store.openModal('modal1');
    expect(useUIStore.getState().modalStack).toEqual(['modal1']);
    
    store.openModal('modal2');
    expect(useUIStore.getState().modalStack).toEqual(['modal1', 'modal2']);
    
    // Close last modal
    store.closeModal();
    expect(useUIStore.getState().modalStack).toEqual(['modal1']);
    
    // Close specific modal
    store.openModal('modal2');
    store.closeModal('modal1');
    expect(useUIStore.getState().modalStack).toEqual(['modal2']);
    
    // Close all modals
    store.closeAllModals();
    expect(useUIStore.getState().modalStack).toEqual([]);
  });

  it('should manage loading state', () => {
    const store = useUIStore.getState();
    
    store.setGlobalLoading(true);
    expect(useUIStore.getState().globalLoading).toBe(true);
    
    store.setGlobalLoading(false);
    expect(useUIStore.getState().globalLoading).toBe(false);
  });

  it('should manage online status and sync state', () => {
    const store = useUIStore.getState();
    
    store.setOnlineStatus(false);
    expect(useUIStore.getState().isOnline).toBe(false);
    
    store.setSyncInProgress(true);
    expect(useUIStore.getState().syncInProgress).toBe(true);
    
    const syncTime = new Date();
    store.setLastSyncTime(syncTime);
    expect(useUIStore.getState().lastSyncTime).toBe(syncTime);
  });

  it('should manage theme state', () => {
    const store = useUIStore.getState();
    
    store.setTheme('dark');
    expect(useUIStore.getState().theme).toBe('dark');
    
    store.setTheme('light');
    expect(useUIStore.getState().theme).toBe('light');
    
    store.setTheme('system');
    expect(useUIStore.getState().theme).toBe('system');
  });
});