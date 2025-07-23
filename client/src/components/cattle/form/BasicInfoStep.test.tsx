import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BasicInfoStep } from './BasicInfoStep';
import { Gender } from '../../../types/cattle.types';

// Mock the API
vi.mock('../../../lib/api/cattle.api', () => ({
  cattleApi: {
    checkTagNumber: vi.fn().mockResolvedValue({ exists: false }),
    getBreeds: vi.fn().mockResolvedValue([
      'Holstein',
      'Jersey',
      'Guernsey',
      'Brown Swiss',
      'Other',
    ]),
  },
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      name: '',
      tagNumber: '',
      gender: Gender.FEMALE,
      birthDate: '',
      breed: '',
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...methods}>
        {children}
      </FormProvider>
    </QueryClientProvider>
  );
};

describe('BasicInfoStep', () => {
  it('should render all form fields', () => {
    render(
      <Wrapper>
        <BasicInfoStep />
      </Wrapper>
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tag number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/breed/i)).toBeInTheDocument();
  });

  it('should show required indicators', () => {
    render(
      <Wrapper>
        <BasicInfoStep />
      </Wrapper>
    );

    // Name and Tag Number should have asterisks
    const nameLabel = screen.getByText(/name/i).closest('label');
    const tagLabel = screen.getByText(/tag number/i).closest('label');
    const genderLabel = screen.getByText(/gender/i).closest('label');

    expect(nameLabel?.textContent).toContain('*');
    expect(tagLabel?.textContent).toContain('*');
    expect(genderLabel?.textContent).toContain('*');
  });

  it('should calculate age when birth date is entered', () => {
    render(
      <Wrapper>
        <BasicInfoStep />
      </Wrapper>
    );

    const birthDateInput = screen.getByLabelText(/birth date/i);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    fireEvent.change(birthDateInput, { 
      target: { value: oneYearAgo.toISOString().split('T')[0] } 
    });

    expect(screen.getByText(/Age: 1 year/)).toBeInTheDocument();
  });

  it('should populate breed options', async () => {
    render(
      <Wrapper>
        <BasicInfoStep />
      </Wrapper>
    );

    // Wait for breeds to load
    await screen.findByRole('option', { name: 'Holstein' });

    // Check that breed options are available
    expect(screen.getByRole('option', { name: 'Holstein' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Jersey' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Guernsey' })).toBeInTheDocument();
  });
});