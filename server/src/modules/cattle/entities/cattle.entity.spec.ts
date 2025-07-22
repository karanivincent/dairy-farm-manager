import { Cattle, Gender, CattleStatus } from './cattle.entity';

describe('Cattle Entity', () => {
  let cattle: Cattle;

  beforeEach(() => {
    cattle = new Cattle();
    cattle.tagNumber = 'COW-001';
    cattle.name = 'Bella';
    cattle.gender = Gender.FEMALE;
    cattle.status = CattleStatus.ACTIVE;
  });

  describe('age calculation', () => {
    it('should return null when birthDate is not set', () => {
      cattle.birthDate = undefined;
      expect(cattle.age).toBeNull();
    });

    it('should calculate age correctly for cattle born this year', () => {
      const currentDate = new Date();
      const birthThisYear = new Date(currentDate.getFullYear(), 0, 1); // January 1st this year
      cattle.birthDate = birthThisYear;

      expect(cattle.age).toBe(0);
    });

    it('should calculate age correctly for cattle born last year', () => {
      const currentDate = new Date();
      const birthLastYear = new Date(currentDate.getFullYear() - 1, 0, 1); // January 1st last year
      cattle.birthDate = birthLastYear;

      expect(cattle.age).toBe(1);
    });

    it('should calculate age correctly for cattle born 5 years ago', () => {
      const currentDate = new Date();
      const birth5YearsAgo = new Date(currentDate.getFullYear() - 5, 0, 1);
      cattle.birthDate = birth5YearsAgo;

      expect(cattle.age).toBe(5);
    });

    it('should handle birthday not yet reached this year', () => {
      const currentDate = new Date();
      const birthNextMonth = new Date(
        currentDate.getFullYear() - 2,
        currentDate.getMonth() + 1,
        currentDate.getDate()
      );
      cattle.birthDate = birthNextMonth;

      // Should be 1 year old since birthday hasn't happened yet this year
      expect(cattle.age).toBe(1);
    });
  });

  describe('ageInMonths calculation', () => {
    it('should return null when birthDate is not set', () => {
      cattle.birthDate = undefined;
      expect(cattle.ageInMonths).toBeNull();
    });

    it('should calculate age in months correctly', () => {
      const currentDate = new Date();
      const birth2YearsAgo = new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), 1);
      cattle.birthDate = birth2YearsAgo;

      expect(cattle.ageInMonths).toBe(24);
    });

    it('should calculate age in months for cattle born 6 months ago', () => {
      const currentDate = new Date();
      const birth6MonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
      cattle.birthDate = birth6MonthsAgo;

      expect(cattle.ageInMonths).toBe(6);
    });
  });

  describe('isAdult property', () => {
    it('should return false when ageInMonths is null', () => {
      cattle.birthDate = undefined;
      expect(cattle.isAdult).toBe(false);
    });

    it('should return false for cattle under 24 months', () => {
      const currentDate = new Date();
      const birth18MonthsAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth() - 6, 1);
      cattle.birthDate = birth18MonthsAgo;

      expect(cattle.isAdult).toBe(false);
    });

    it('should return true for cattle 24 months or older', () => {
      const currentDate = new Date();
      const birth24MonthsAgo = new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), 1);
      cattle.birthDate = birth24MonthsAgo;

      expect(cattle.isAdult).toBe(true);
    });

    it('should return true for cattle over 24 months', () => {
      const currentDate = new Date();
      const birth3YearsAgo = new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), 1);
      cattle.birthDate = birth3YearsAgo;

      expect(cattle.isAdult).toBe(true);
    });
  });

  describe('canMilk property', () => {
    beforeEach(() => {
      // Set up an adult female cow by default
      const currentDate = new Date();
      const birth3YearsAgo = new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), 1);
      cattle.birthDate = birth3YearsAgo;
      cattle.gender = Gender.FEMALE;
      cattle.status = CattleStatus.ACTIVE;
    });

    it('should return true for adult female cattle with active status', () => {
      expect(cattle.canMilk).toBe(true);
    });

    it('should return false for male cattle', () => {
      cattle.gender = Gender.MALE;
      expect(cattle.canMilk).toBe(false);
    });

    it('should return false for non-active status', () => {
      cattle.status = CattleStatus.SICK;
      expect(cattle.canMilk).toBe(false);
    });

    it('should return false for young female cattle', () => {
      const currentDate = new Date();
      const birth1YearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
      cattle.birthDate = birth1YearAgo;
      
      expect(cattle.canMilk).toBe(false);
    });

    it('should return false for pregnant cattle', () => {
      cattle.status = CattleStatus.PREGNANT;
      expect(cattle.canMilk).toBe(false);
    });

    it('should return false for dry cattle', () => {
      cattle.status = CattleStatus.DRY;
      expect(cattle.canMilk).toBe(false);
    });

    it('should return false when birthDate is not set', () => {
      cattle.birthDate = undefined;
      expect(cattle.canMilk).toBe(false);
    });
  });
});