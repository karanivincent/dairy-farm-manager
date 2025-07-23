import { apiClient } from './client';
import type { 
  Cattle, 
  CattleFilterDto, 
  CreateCattleDto, 
  UpdateCattleDto, 
  PaginatedResult 
} from '../../types/cattle.types';

export const cattleApi = {
  // Get all cattle with filters and pagination
  async getAll(filters?: CattleFilterDto): Promise<PaginatedResult<Cattle>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const queryString = params.toString();
    const url = queryString ? `/cattle?${queryString}` : '/cattle';
    
    return apiClient.get(url);
  },

  // Get single cattle by ID
  async getById(id: number): Promise<Cattle> {
    return apiClient.get(`/cattle/${id}`);
  },

  // Get cattle by tag number
  async getByTagNumber(tagNumber: string): Promise<Cattle> {
    return apiClient.get(`/cattle/tag/${tagNumber}`);
  },

  // Create new cattle
  async create(data: CreateCattleDto): Promise<Cattle> {
    return apiClient.post('/cattle', data);
  },

  // Update cattle
  async update(id: number, data: UpdateCattleDto): Promise<Cattle> {
    return apiClient.put(`/cattle/${id}`, data);
  },

  // Update cattle status
  async updateStatus(id: number, status: string): Promise<Cattle> {
    return apiClient.patch(`/cattle/${id}/status`, { status });
  },

  // Delete cattle (soft delete)
  async remove(id: number): Promise<void> {
    return apiClient.delete(`/cattle/${id}`);
  },

  // Upload cattle photo
  async uploadPhoto(id: number, file: File): Promise<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    
    return apiClient.post(`/cattle/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get offspring of a cattle
  async getOffspring(id: number): Promise<Cattle[]> {
    return apiClient.get(`/cattle/${id}/offspring`);
  },

  // Get production history
  async getProductionHistory(id: number): Promise<any[]> {
    return apiClient.get(`/cattle/${id}/productions`);
  },

  // Check if tag number exists
  async checkTagNumber(tagNumber: string): Promise<{ exists: boolean }> {
    return apiClient.get(`/cattle/check-tag/${tagNumber}`);
  },

  // Get breeds list for autocomplete
  async getBreeds(): Promise<string[]> {
    // For now, return a static list of breeds
    // This can be replaced with an API call when the endpoint is available
    return Promise.resolve([
      'Holstein',
      'Jersey',
      'Guernsey',
      'Ayrshire',
      'Brown Swiss',
      'Milking Shorthorn',
      'Dutch Belted',
      'Crossbreed',
      'Other',
    ]);
  },

  // Search cattle for parent selection
  async searchForParents(gender: 'male' | 'female', search?: string): Promise<Cattle[]> {
    const params = new URLSearchParams({
      gender,
      status: 'active',
      limit: '50',
    });
    
    if (search) {
      params.append('search', search);
    }
    
    const result = await apiClient.get<PaginatedResult<Cattle>>(`/cattle?${params.toString()}`);
    return result.items;
  },
};