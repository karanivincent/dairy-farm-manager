import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cattleApi } from '../cattle.api';
import { apiClient } from '../client';
import { Gender, CattleStatus } from '../../../types/cattle.types';
import type { UpdateCattleDto } from '../../../types/cattle.types';

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('cattleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('should fetch cattle by ID', async () => {
      const mockCattle = {
        id: 123,
        name: 'Bessie',
        tagNumber: 'COW-001',
      };
      
      vi.mocked(apiClient.get).mockResolvedValue(mockCattle);
      
      const result = await cattleApi.getById(123);
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle/123');
      expect(result).toEqual(mockCattle);
    });
  });

  describe('update', () => {
    it('should update cattle using PATCH method', async () => {
      const updateData: UpdateCattleDto = {
        name: 'Updated Bessie',
        status: CattleStatus.ACTIVE,
      };
      
      const mockUpdatedCattle = {
        id: 123,
        name: 'Updated Bessie',
        tagNumber: 'COW-001',
        status: CattleStatus.ACTIVE,
      };
      
      vi.mocked(apiClient.patch).mockResolvedValue(mockUpdatedCattle);
      
      const result = await cattleApi.update(123, updateData);
      
      expect(apiClient.patch).toHaveBeenCalledWith('/cattle/123', updateData);
      expect(result).toEqual(mockUpdatedCattle);
    });

    it('should handle optional fields in update', async () => {
      const updateData: UpdateCattleDto = {
        name: 'Bessie',
        tagNumber: 'COW-001',
        gender: Gender.FEMALE,
        status: CattleStatus.ACTIVE,
        birthDate: undefined,
        breed: undefined,
        parentBullId: undefined,
        parentCowId: undefined,
        metadata: {
          birthWeight: 35.5,
          birthType: 'single',
          healthNotes: '',
        },
      };
      
      vi.mocked(apiClient.patch).mockResolvedValue({ id: 123 });
      
      await cattleApi.update(123, updateData);
      
      expect(apiClient.patch).toHaveBeenCalledWith('/cattle/123', updateData);
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

    it('should return false when tag number does not exist', async () => {
      const mockResponse = { exists: false };
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);
      
      const result = await cattleApi.checkTagNumber('COW-999');
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle/check-tag/COW-999');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchForParents', () => {
    it('should search for male parents', async () => {
      const mockBulls = [
        { id: 1, name: 'Bull 1', tagNumber: 'BULL-001', gender: Gender.MALE },
        { id: 2, name: 'Bull 2', tagNumber: 'BULL-002', gender: Gender.MALE },
      ];
      
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBulls });
      
      const result = await cattleApi.searchForParents('male', 'Bull');
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle', {
        params: {
          gender: 'male',
          search: 'Bull',
          limit: 10,
        },
      });
      expect(result).toEqual(mockBulls);
    });

    it('should search for female parents', async () => {
      const mockCows = [
        { id: 3, name: 'Cow 1', tagNumber: 'COW-001', gender: Gender.FEMALE },
        { id: 4, name: 'Cow 2', tagNumber: 'COW-002', gender: Gender.FEMALE },
      ];
      
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCows });
      
      const result = await cattleApi.searchForParents('female', 'Cow');
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle', {
        params: {
          gender: 'female',
          search: 'Cow',
          limit: 10,
        },
      });
      expect(result).toEqual(mockCows);
    });
  });

  describe('getBreeds', () => {
    it('should fetch list of breeds', async () => {
      const mockBreeds = ['Holstein', 'Jersey', 'Angus', 'Hereford'];
      vi.mocked(apiClient.get).mockResolvedValue(mockBreeds);
      
      const result = await cattleApi.getBreeds();
      
      expect(apiClient.get).toHaveBeenCalledWith('/cattle/breeds');
      expect(result).toEqual(mockBreeds);
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo for cattle', async () => {
      const mockFile = new File(['photo content'], 'cow.jpg', { type: 'image/jpeg' });
      const mockResponse = { photoUrl: 'https://example.com/photos/cow-123.jpg' };
      
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
      
      const result = await cattleApi.uploadPhoto(123, mockFile);
      
      // Verify FormData was created correctly
      const calls = vi.mocked(apiClient.post).mock.calls;
      expect(calls).toHaveLength(1);
      const [url, formData] = calls[0];
      
      expect(url).toBe('/cattle/123/photo');
      expect(formData).toBeInstanceOf(FormData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should propagate API errors', async () => {
      const errorMessage = 'Network error';
      vi.mocked(apiClient.get).mockRejectedValue(new Error(errorMessage));
      
      await expect(cattleApi.getById(123)).rejects.toThrow(errorMessage);
    });

    it('should handle 404 errors', async () => {
      const error = new Error('Not found');
      (error as any).response = { status: 404 };
      vi.mocked(apiClient.get).mockRejectedValue(error);
      
      await expect(cattleApi.getById(999)).rejects.toThrow('Not found');
    });
  });
});