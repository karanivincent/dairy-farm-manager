import { Production, MilkingSession, ProductionStatus } from './production.entity';

describe('Production Entity', () => {
  let production: Production;

  beforeEach(() => {
    production = new Production();
    production.id = 1;
    production.cattleId = 1;
    production.date = new Date('2025-01-15');
    production.session = MilkingSession.MORNING;
    production.quantity = 15.5;
    production.fatContent = 3.8;
    production.proteinContent = 3.2;
    production.temperature = 4.2;
    production.status = ProductionStatus.RECORDED;
    production.recordedById = 1;
    production.notes = 'Good quality milk';
    production.createdAt = new Date();
    production.updatedAt = new Date();
    
    // Use Object.defineProperty to set the readonly qualityGrade for testing
    Object.defineProperty(production, 'qualityGrade', {
      value: 'A',
      writable: true,
      configurable: true,
    });
  });

  describe('milkValue getter', () => {
    it('should calculate milk value correctly with fat and protein content', () => {
      const expectedValue = 15.5 * (0.50 + (3.8 - 3.5) * 0.02 + (3.2 - 3.2) * 0.03);
      expect(production.milkValue).toBeCloseTo(expectedValue, 2);
    });

    it('should calculate milk value with only fat content', () => {
      production.proteinContent = undefined;
      const expectedValue = 15.5 * (0.50 + (3.8 - 3.5) * 0.02);
      expect(production.milkValue).toBeCloseTo(expectedValue, 2);
    });

    it('should calculate milk value with only protein content', () => {
      production.fatContent = undefined;
      const expectedValue = 15.5 * (0.50 + (3.2 - 3.2) * 0.03);
      expect(production.milkValue).toBeCloseTo(expectedValue, 2);
    });

    it('should calculate base milk value without fat and protein content', () => {
      production.fatContent = undefined;
      production.proteinContent = undefined;
      const expectedValue = 15.5 * 0.50;
      expect(production.milkValue).toBeCloseTo(expectedValue, 2);
    });

    it('should handle negative fat content bonus', () => {
      production.fatContent = 3.0; // Below 3.5 baseline
      const expectedValue = 15.5 * (0.50 + (3.0 - 3.5) * 0.02);
      expect(production.milkValue).toBeCloseTo(expectedValue, 2);
    });

    it('should handle negative protein content bonus', () => {
      production.proteinContent = 3.0; // Below 3.2 baseline
      const expectedValue = 15.5 * (0.50 + (3.8 - 3.5) * 0.02 + (3.0 - 3.2) * 0.03);
      expect(production.milkValue).toBeCloseTo(expectedValue, 2);
    });
  });

  describe('qualityGrade property', () => {
    it('should accept grade A', () => {
      Object.defineProperty(production, 'qualityGrade', { value: 'A', writable: true });
      expect(production.qualityGrade).toBe('A');
    });

    it('should accept grade B', () => {
      Object.defineProperty(production, 'qualityGrade', { value: 'B', writable: true });
      expect(production.qualityGrade).toBe('B');
    });

    it('should accept grade C', () => {
      Object.defineProperty(production, 'qualityGrade', { value: 'C', writable: true });
      expect(production.qualityGrade).toBe('C');
    });

    it('should accept null quality grade', () => {
      Object.defineProperty(production, 'qualityGrade', { value: null, writable: true });
      expect(production.qualityGrade).toBeNull();
    });
  });

  describe('session property', () => {
    it('should accept MORNING session', () => {
      production.session = MilkingSession.MORNING;
      expect(production.session).toBe(MilkingSession.MORNING);
    });

    it('should accept EVENING session', () => {
      production.session = MilkingSession.EVENING;
      expect(production.session).toBe(MilkingSession.EVENING);
    });
  });

  describe('status property', () => {
    it('should accept RECORDED status', () => {
      production.status = ProductionStatus.RECORDED;
      expect(production.status).toBe(ProductionStatus.RECORDED);
    });

    it('should accept VERIFIED status', () => {
      production.status = ProductionStatus.VERIFIED;
      expect(production.status).toBe(ProductionStatus.VERIFIED);
    });

    it('should accept REJECTED status', () => {
      production.status = ProductionStatus.REJECTED;
      expect(production.status).toBe(ProductionStatus.REJECTED);
    });
  });

  describe('quantity validation', () => {
    it('should accept positive quantities', () => {
      production.quantity = 25.7;
      expect(production.quantity).toBe(25.7);
    });

    it('should accept zero quantity', () => {
      production.quantity = 0;
      expect(production.quantity).toBe(0);
    });
  });

  describe('temperature validation', () => {
    it('should accept valid temperature', () => {
      production.temperature = 4.2;
      expect(production.temperature).toBe(4.2);
    });

    it('should accept undefined temperature', () => {
      production.temperature = undefined;
      expect(production.temperature).toBeUndefined();
    });
  });

  describe('content validation', () => {
    it('should accept valid fat content', () => {
      production.fatContent = 4.5;
      expect(production.fatContent).toBe(4.5);
    });

    it('should accept valid protein content', () => {
      production.proteinContent = 3.8;
      expect(production.proteinContent).toBe(3.8);
    });

    it('should accept undefined fat content', () => {
      production.fatContent = undefined;
      expect(production.fatContent).toBeUndefined();
    });

    it('should accept undefined protein content', () => {
      production.proteinContent = undefined;
      expect(production.proteinContent).toBeUndefined();
    });
  });

  describe('verification properties', () => {
    it('should track verification details', () => {
      const verifiedAt = new Date();
      production.verifiedById = 2;
      production.verifiedAt = verifiedAt;
      
      expect(production.verifiedById).toBe(2);
      expect(production.verifiedAt).toBe(verifiedAt);
    });

    it('should allow null verification details', () => {
      production.verifiedById = undefined;
      production.verifiedAt = undefined;
      
      expect(production.verifiedById).toBeUndefined();
      expect(production.verifiedAt).toBeUndefined();
    });
  });

  describe('notes property', () => {
    it('should accept string notes', () => {
      production.notes = 'High quality milk with good foam';
      expect(production.notes).toBe('High quality milk with good foam');
    });

    it('should accept undefined notes', () => {
      production.notes = undefined;
      expect(production.notes).toBeUndefined();
    });
  });
});