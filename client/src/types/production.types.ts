export interface Production {
  id: string;
  cattleId: string;
  date: string;
  shift: 'morning' | 'evening';
  quantity: number | null;
  quality?: string;
  notes?: string;
  recordedBy?: string;
  farmId: string;
  createdAt: string;
  updatedAt: string;
}