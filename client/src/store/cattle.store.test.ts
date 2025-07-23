import { describe, it, expect, beforeEach } from 'vitest';
import { useCattleStore } from './cattle.store';
import { CattleStatus, Gender } from '../types/cattle.types';

describe('CattleStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useCattleStore.setState({
      cattle: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      filters: {
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        search: '',
      },
      viewMode: 'grid',
      isLoading: false,
      error: null,
      selectedCattle: null,
    });
  });

  describe('setFilters', () => {
    it('should update filters', () => {
      const { setFilters } = useCattleStore.getState();
      
      setFilters({ status: CattleStatus.ACTIVE, search: 'Bessie' });
      
      const { filters } = useCattleStore.getState();
      expect(filters.status).toBe(CattleStatus.ACTIVE);
      expect(filters.search).toBe('Bessie');
    });

    it('should reset to page 1 when filters change', () => {
      useCattleStore.setState({ filters: { ...useCattleStore.getState().filters, page: 3 } });
      
      const { setFilters } = useCattleStore.getState();
      setFilters({ status: CattleStatus.ACTIVE });
      
      const { filters } = useCattleStore.getState();
      expect(filters.page).toBe(1);
    });

    it('should not reset page when page is explicitly set', () => {
      const { setFilters } = useCattleStore.getState();
      
      setFilters({ page: 5 });
      
      const { filters } = useCattleStore.getState();
      expect(filters.page).toBe(5);
    });
  });

  describe('resetFilters', () => {
    it('should reset filters to defaults', () => {
      const { setFilters, resetFilters } = useCattleStore.getState();
      
      setFilters({ status: CattleStatus.ACTIVE, search: 'test' });
      resetFilters();
      
      const { filters } = useCattleStore.getState();
      expect(filters).toEqual({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        search: '',
      });
    });
  });

  describe('setCattle', () => {
    it('should set cattle data', () => {
      const { setCattle } = useCattleStore.getState();
      const mockCattle = [
        {
          id: 1,
          name: 'Bessie',
          tagNumber: 'COW-001',
          gender: Gender.FEMALE,
          status: CattleStatus.ACTIVE,
          createdAt: '2020-01-01',
          updatedAt: '2020-01-01',
        },
      ];
      
      setCattle(mockCattle, 1, 1, 1);
      
      const state = useCattleStore.getState();
      expect(state.cattle).toEqual(mockCattle);
      expect(state.total).toBe(1);
      expect(state.page).toBe(1);
      expect(state.totalPages).toBe(1);
    });
  });

  describe('addCattle', () => {
    it('should add cattle to the beginning of the list', () => {
      const { setCattle, addCattle } = useCattleStore.getState();
      const existingCattle = {
        id: 1,
        name: 'Bessie',
        tagNumber: 'COW-001',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        createdAt: '2020-01-01',
        updatedAt: '2020-01-01',
      };
      const newCattle = {
        id: 2,
        name: 'Daisy',
        tagNumber: 'COW-002',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        createdAt: '2020-01-02',
        updatedAt: '2020-01-02',
      };
      
      setCattle([existingCattle], 1, 1, 1);
      addCattle(newCattle);
      
      const state = useCattleStore.getState();
      expect(state.cattle).toHaveLength(2);
      expect(state.cattle[0]).toEqual(newCattle);
      expect(state.cattle[1]).toEqual(existingCattle);
      expect(state.total).toBe(2);
    });
  });

  describe('updateCattle', () => {
    it('should update cattle in the list', () => {
      const { setCattle, updateCattle } = useCattleStore.getState();
      const cattle = {
        id: 1,
        name: 'Bessie',
        tagNumber: 'COW-001',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        createdAt: '2020-01-01',
        updatedAt: '2020-01-01',
      };
      
      setCattle([cattle], 1, 1, 1);
      updateCattle(1, { name: 'Bessie Updated', status: CattleStatus.PREGNANT });
      
      const state = useCattleStore.getState();
      expect(state.cattle[0].name).toBe('Bessie Updated');
      expect(state.cattle[0].status).toBe(CattleStatus.PREGNANT);
    });

    it('should update selected cattle if it matches', () => {
      const { setSelectedCattle, updateCattle } = useCattleStore.getState();
      const cattle = {
        id: 1,
        name: 'Bessie',
        tagNumber: 'COW-001',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        createdAt: '2020-01-01',
        updatedAt: '2020-01-01',
      };
      
      setSelectedCattle(cattle);
      updateCattle(1, { name: 'Bessie Updated' });
      
      const state = useCattleStore.getState();
      expect(state.selectedCattle?.name).toBe('Bessie Updated');
    });

    it('should not update if cattle not found', () => {
      const { setCattle, updateCattle } = useCattleStore.getState();
      const cattle = {
        id: 1,
        name: 'Bessie',
        tagNumber: 'COW-001',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        createdAt: '2020-01-01',
        updatedAt: '2020-01-01',
      };
      
      setCattle([cattle], 1, 1, 1);
      updateCattle(999, { name: 'Should not update' });
      
      const state = useCattleStore.getState();
      expect(state.cattle[0].name).toBe('Bessie');
    });
  });

  describe('removeCattle', () => {
    it('should remove cattle from the list', () => {
      const { setCattle, removeCattle } = useCattleStore.getState();
      const cattle1 = {
        id: 1,
        name: 'Bessie',
        tagNumber: 'COW-001',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        createdAt: '2020-01-01',
        updatedAt: '2020-01-01',
      };
      const cattle2 = {
        id: 2,
        name: 'Daisy',
        tagNumber: 'COW-002',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        createdAt: '2020-01-02',
        updatedAt: '2020-01-02',
      };
      
      setCattle([cattle1, cattle2], 2, 1, 1);
      removeCattle(1);
      
      const state = useCattleStore.getState();
      expect(state.cattle).toHaveLength(1);
      expect(state.cattle[0].id).toBe(2);
      expect(state.total).toBe(1);
    });

    it('should clear selected cattle if removed', () => {
      const { setSelectedCattle, removeCattle } = useCattleStore.getState();
      const cattle = {
        id: 1,
        name: 'Bessie',
        tagNumber: 'COW-001',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        createdAt: '2020-01-01',
        updatedAt: '2020-01-01',
      };
      
      setSelectedCattle(cattle);
      removeCattle(1);
      
      const state = useCattleStore.getState();
      expect(state.selectedCattle).toBeNull();
    });
  });

  describe('view mode', () => {
    it('should toggle view mode', () => {
      const { setViewMode } = useCattleStore.getState();
      
      setViewMode('list');
      expect(useCattleStore.getState().viewMode).toBe('list');
      
      setViewMode('grid');
      expect(useCattleStore.getState().viewMode).toBe('grid');
    });
  });

  describe('loading and error states', () => {
    it('should set loading state', () => {
      const { setLoading } = useCattleStore.getState();
      
      setLoading(true);
      expect(useCattleStore.getState().isLoading).toBe(true);
      
      setLoading(false);
      expect(useCattleStore.getState().isLoading).toBe(false);
    });

    it('should set error state', () => {
      const { setError } = useCattleStore.getState();
      
      setError('Something went wrong');
      expect(useCattleStore.getState().error).toBe('Something went wrong');
      
      setError(null);
      expect(useCattleStore.getState().error).toBeNull();
    });
  });
});