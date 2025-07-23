import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cattleApi } from '../../lib/api/cattle.api';
import { queryClient } from '../../lib/query-client';
import { CattleStatus, Gender } from '../../types/cattle.types';
import { BasicInfoStep } from '../../components/cattle/form/BasicInfoStep';
import { BreedingDetailsStep } from '../../components/cattle/form/BreedingDetailsStep';
import { HealthStatusStep } from '../../components/cattle/form/HealthStatusStep';
import { PhotoUploadStep } from '../../components/cattle/form/PhotoUploadStep';
import { FormStepIndicator } from '../../components/cattle/form/FormStepIndicator';

// Form validation schema
const addCattleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  tagNumber: z.string().min(1, 'Tag number is required').max(50, 'Tag number is too long'),
  gender: z.nativeEnum(Gender),
  birthDate: z.string().optional(),
  breed: z.string().optional(),
  parentBullId: z.number().optional(),
  parentCowId: z.number().optional(),
  birthWeight: z.number().optional(),
  birthType: z.enum(['single', 'twin']).optional(),
  status: z.nativeEnum(CattleStatus).default(CattleStatus.ACTIVE),
  healthNotes: z.string().optional(),
  photoFile: z.instanceof(File).optional(),
});

type AddCattleForm = z.infer<typeof addCattleSchema>;

const steps = [
  { id: 'basic', title: 'Basic Information', component: BasicInfoStep },
  { id: 'breeding', title: 'Breeding Details', component: BreedingDetailsStep },
  { id: 'health', title: 'Health Status', component: HealthStatusStep },
  { id: 'photo', title: 'Photo', component: PhotoUploadStep },
];

export function AddCattlePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const methods = useForm<AddCattleForm>({
    resolver: zodResolver(addCattleSchema),
    defaultValues: {
      gender: Gender.FEMALE,
      status: CattleStatus.ACTIVE,
    },
    mode: 'onChange',
  });

  const { handleSubmit, watch, setError } = methods;
  const tagNumber = watch('tagNumber');

  // Check for duplicate tag number
  const { data: tagCheckData } = useQuery({
    queryKey: ['cattle', 'check-tag', tagNumber],
    queryFn: () => cattleApi.checkTagNumber(tagNumber),
    enabled: !!tagNumber && tagNumber.length > 0,
    staleTime: 0,
  });

  // Create cattle mutation
  const createMutation = useMutation({
    mutationFn: async (data: AddCattleForm) => {
      const createDto = {
        name: data.name,
        tagNumber: data.tagNumber,
        gender: data.gender,
        birthDate: data.birthDate,
        breed: data.breed,
        parentBullId: data.parentBullId,
        parentCowId: data.parentCowId,
        status: data.status,
        metadata: {
          birthWeight: data.birthWeight,
          birthType: data.birthType,
          healthNotes: data.healthNotes,
        },
      };

      const cattle = await cattleApi.create(createDto);

      // Upload photo if provided
      if (data.photoFile) {
        await cattleApi.uploadPhoto(cattle.id, data.photoFile);
      }

      return cattle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
      toast.success('Cattle added successfully!');
      navigate('/cattle');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add cattle');
    },
  });

  const onSubmit = async (data: AddCattleForm) => {
    // Check for duplicate tag number one more time
    if (tagCheckData?.exists) {
      setError('tagNumber', {
        type: 'manual',
        message: 'This tag number already exists',
      });
      setCurrentStep(0); // Go back to basic info step
      return;
    }

    createMutation.mutate(data);
  };

  const nextStep = async () => {
    const currentStepId = steps[currentStep].id;
    let fieldsToValidate: (keyof AddCattleForm)[] = [];

    switch (currentStepId) {
      case 'basic':
        fieldsToValidate = ['name', 'tagNumber', 'gender'];
        break;
      case 'breeding':
        fieldsToValidate = ['parentBullId', 'parentCowId'];
        break;
      case 'health':
        fieldsToValidate = ['status'];
        break;
    }

    const isValid = await methods.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/cattle')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Cattle List
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Cattle</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter the details for the new cattle member
        </p>
      </div>

      {/* Form Step Indicator */}
      <FormStepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={setCurrentStep}
      />

      {/* Form */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="bg-white shadow rounded-lg p-6">
            <CurrentStepComponent />

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={previousStep}
                disabled={currentStep === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/cattle')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  data-testid="cancel-button"
                >
                  Cancel
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending ? 'Adding...' : 'Add Cattle'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}