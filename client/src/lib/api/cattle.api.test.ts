import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cattleApi } from './cattle.api';
import { apiClient } from './client';
import { CattleStatus, Gender } from '../../types/cattle.types';

// Mock the API client
vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('CattleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch cattle without filters', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);
      
      const result = await cattleApi.getAll();
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch cattle with filters', async () => {
      const filters = {
        status: CattleStatus.ACTIVE,
        gender: Gender.FEMALE,
        search: 'Bessie',
        page: 2,
        limit: 20,
      };
      
      await cattleApi.getAll(filters);
      
      expect(apiClient.get).toHaveBeenCalledWith(
        '/cattle?status=active&gender=female&search=Bessie&page=2&limit=20'
      );
    });

    it('should omit undefined filter values', async () => {
      const filters = {
        status: CattleStatus.ACTIVE,
        gender: undefined,
        search: '',
      };
      
      await cattleApi.getAll(filters);
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle?status=active');
    });
  });

  describe('getById', () => {
    it('should fetch cattle by id', async () => {
      const mockCattle = { id: 1, name: 'Bessie' };
      vi.mocked(apiClient.get).mockResolvedValue(mockCattle);
      
      const result = await cattleApi.getById(1);
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle/1');
      expect(result).toEqual(mockCattle);
    });
  });

  describe('getByTagNumber', () => {
    it('should fetch cattle by tag number', async () => {
      const mockCattle = { id: 1, tagNumber: 'COW-001' };
      vi.mocked(apiClient.get).mockResolvedValue(mockCattle);
      
      const result = await cattleApi.getByTagNumber('COW-001');
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle/tag/COW-001');
      expect(result).toEqual(mockCattle);
    });
  });

  describe('create', () => {
    it('should create new cattle', async () => {
      const newCattle = {
        name: 'Bessie',
        tagNumber: 'COW-001',
        gender: Gender.FEMALE,
      };
      const mockResponse = { id: 1, ...newCattle };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
      
      const result = await cattleApi.create(newCattle);
      
      expect(apiClient.post).toHaveBeenCalledWith('/cattle', newCattle);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update cattle', async () => {
      const updates = { name: 'Bessie Updated' };
      const mockResponse = { id: 1, name: 'Bessie Updated' };
      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);
      
      const result = await cattleApi.update(1, updates);
      
      expect(apiClient.put).toHaveBeenCalledWith('/cattle/1', updates);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateStatus', () => {
    it('should update cattle status', async () => {
      const mockResponse = { id: 1, status: CattleStatus.SOLD };
      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);
      
      const result = await cattleApi.updateStatus(1, CattleStatus.SOLD);
      
      expect(apiClient.patch).toHaveBeenCalledWith('/cattle/1/status', {
        status: CattleStatus.SOLD,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('remove', () => {
    it('should delete cattle', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);
      
      await cattleApi.remove(1);
      
      expect(apiClient.delete).toHaveBeenCalledWith('/cattle/1');
    });
  });

  describe('uploadPhoto', () => {
    it('should upload cattle photo', async () => {
      const file = new File(['photo'], 'cow.jpg', { type: 'image/jpeg' });
      const mockResponse = { photoUrl: 'https://example.com/cow.jpg' };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
      
      const result = await cattleApi.uploadPhoto(1, file);
      
      expect(apiClient.post).toHaveBeenCalledWith(
        '/cattle/1/photo',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getOffspring', () => {
    it('should fetch cattle offspring', async () => {
      const mockOffspring = [{ id: 2, name: 'Calf 1' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockOffspring);
      
      const result = await cattleApi.getOffspring(1);
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle/1/offspring');
      expect(result).toEqual(mockOffspring);
    });
  });

  describe('getProductionHistory', () => {
    it('should fetch production history', async () => {
      const mockHistory = [{ id: 1, quantity: 25 }];
      vi.mocked(apiClient.get).mockResolvedValue(mockHistory);
      
      const result = await cattleApi.getProductionHistory(1);
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle/1/productions');
      expect(result).toEqual(mockHistory);
    });
  });

  describe('checkTagNumber', () => {
    it('should check if tag number exists', async () => {
      const mockResponse = { exists: true };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);
      
      const result = await cattleApi.checkTagNumber('COW-001');
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle/check-tag/COW-001');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getBreeds', () => {
    it('should return static list of breeds', async () => {
      const result = await cattleApi.getBreeds();
      
      expect(result).toContain('Holstein');
      expect(result).toContain('Jersey');
      expect(result).toContain('Guernsey');
      expect(result).toContain('Other');
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('searchForParents', () => {
    it('should search for male parents', async () => {
      const mockResponse = {
        items: [{ id: 1, name: 'Bull 1' }],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);
      
      const result = await cattleApi.searchForParents('male', 'Bull');
      
      expect(apiClient.get).toHaveBeenCalledWith(
        '/cattle?gender=male&status=active&limit=50&search=Bull'
      );
      expect(result).toEqual(mockResponse.items);
    });

    it('should search for female parents without search term', async () => {
      const mockResponse = {
        items: [{ id: 1, name: 'Cow 1' }],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);
      
      const result = await cattleApi.searchForParents('female');
      
      expect(apiClient.get).toHaveBeenCalledWith(
        '/cattle?gender=female&status=active&limit=50'
      );
      expect(result).toEqual(mockResponse.items);
    });
  });
});