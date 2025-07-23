import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Cattle, CattleFilterDto } from '../types/cattle.types';

interface CattleState {
  // List state
  cattle: Cattle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  
  // Filter state
  filters: CattleFilterDto;
  viewMode: 'grid' | 'list';
  
  // UI state
  isLoading: boolean;
  error: string | null;
  selectedCattle: Cattle | null;
  
  // Actions
  setFilters: (filters: Partial<CattleFilterDto>) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSelectedCattle: (cattle: Cattle | null) => void;
  setCattle: (cattle: Cattle[], total: number, page: number, totalPages: number) => void;
  addCattle: (cattle: Cattle) => void;
  updateCattle: (id: number, updates: Partial<Cattle>) => void;
  removeCattle: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: CattleFilterDto = {
  page: 1,
  limit: 10,
  sortBy: 'name',
  sortOrder: 'asc',
  search: '',
};

export const useCattleStore = create<CattleState>()(
  immer((set) => ({
    // Initial state
    cattle: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    filters: defaultFilters,
    viewMode: 'grid',
    isLoading: false,
    error: null,
    selectedCattle: null,
    
    // Actions
    setFilters: (newFilters) =>
      set((state) => {
        state.filters = { ...state.filters, ...newFilters };
        // Reset to page 1 when filters change
        if (!newFilters.hasOwnProperty('page')) {
          state.filters.page = 1;
        }
      }),
    
    resetFilters: () =>
      set((state) => {
        state.filters = defaultFilters;
      }),
    
    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode;
      }),
    
    setSelectedCattle: (cattle) =>
      set((state) => {
        state.selectedCattle = cattle;
      }),
    
    setCattle: (cattle, total, page, totalPages) =>
      set((state) => {
        state.cattle = cattle;
        state.total = total;
        state.page = page;
        state.totalPages = totalPages;
      }),
    
    addCattle: (cattle) =>
      set((state) => {
        state.cattle.unshift(cattle);
        state.total += 1;
      }),
    
    updateCattle: (id, updates) =>
      set((state) => {
        const index = state.cattle.findIndex((c) => c.id === id);
        if (index !== -1) {
          state.cattle[index] = { ...state.cattle[index], ...updates };
        }
        if (state.selectedCattle?.id === id) {
          state.selectedCattle = { ...state.selectedCattle, ...updates };
        }
      }),
    
    removeCattle: (id) =>
      set((state) => {
        state.cattle = state.cattle.filter((c) => c.id !== id);
        state.total -= 1;
        if (state.selectedCattle?.id === id) {
          state.selectedCattle = null;
        }
      }),
    
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),
    
    setError: (error) =>
      set((state) => {
        state.error = error;
      }),
  }))
);