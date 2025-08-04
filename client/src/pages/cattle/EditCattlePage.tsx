import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
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
const editCattleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  tagNumber: z.string().min(1, 'Tag number is required').max(50, 'Tag number is too long'),
  gender: z.nativeEnum(Gender),
  birthDate: z.string().optional().or(z.literal('')),
  breed: z.string().optional().or(z.literal('')),
  parentBullId: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined || (typeof val === 'string' && isNaN(Number(val)))) {
        return undefined;
      }
      return typeof val === 'number' ? val : Number(val);
    },
    z.number().optional()
  ),
  parentCowId: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined || (typeof val === 'string' && isNaN(Number(val)))) {
        return undefined;
      }
      return typeof val === 'number' ? val : Number(val);
    },
    z.number().optional()
  ),
  birthWeight: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined || (typeof val === 'string' && isNaN(Number(val)))) {
        return undefined;
      }
      return typeof val === 'number' ? val : Number(val);
    },
    z.number().optional()
  ),
  birthType: z.enum(['single', 'twin']).optional().or(z.literal('')).or(z.undefined()),
  status: z.nativeEnum(CattleStatus),
  healthNotes: z.string().optional().or(z.literal('')),
  photoFile: z.instanceof(File).optional(),
});

type EditCattleForm = z.infer<typeof editCattleSchema>;

const steps = [
  { id: 'basic', title: 'Basic Information', component: BasicInfoStep },
  { id: 'breeding', title: 'Breeding Details', component: BreedingDetailsStep },
  { id: 'health', title: 'Health Status', component: HealthStatusStep },
  { id: 'photo', title: 'Photo', component: PhotoUploadStep },
];

export function EditCattlePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);

  // Fetch cattle data
  const { data: cattle, isLoading, error } = useQuery({
    queryKey: ['cattle', id],
    queryFn: () => cattleApi.getById(Number(id)),
    enabled: !!id,
  });

  const methods = useForm<EditCattleForm>({
    resolver: zodResolver(editCattleSchema),
    defaultValues: {
      gender: Gender.FEMALE,
      status: CattleStatus.ACTIVE,
    },
    mode: 'onChange',
  });

  // Reset form when cattle data is loaded
  useEffect(() => {
    if (cattle) {
      console.log('Loading cattle data:', cattle);
      methods.reset({
        name: cattle.name,
        tagNumber: cattle.tagNumber,
        gender: cattle.gender,
        birthDate: cattle.birthDate || '',
        breed: cattle.breed || '',
        parentBullId: cattle.parentBullId || undefined,
        parentCowId: cattle.parentCowId || undefined,
        birthWeight: cattle.metadata?.birthWeight || undefined,
        birthType: cattle.metadata?.birthType || undefined,
        status: cattle.status,
        healthNotes: cattle.metadata?.healthNotes || '',
      });
    }
  }, [cattle, methods]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EditCattleForm) => {
      const { photoFile, birthWeight, birthType, healthNotes, ...cattleData } = data;
      
      // Clean up empty strings and convert to undefined
      const cleanData = {
        ...cattleData,
        birthDate: cattleData.birthDate || undefined,
        breed: cattleData.breed || undefined,
        parentBullId: cattleData.parentBullId || undefined,
        parentCowId: cattleData.parentCowId || undefined,
      };
      
      // Only include metadata if there are values
      const metadata: any = {};
      if (birthWeight !== undefined && birthWeight !== '') {
        metadata.birthWeight = birthWeight;
      }
      if (birthType !== undefined && birthType !== '') {
        metadata.birthType = birthType;
      }
      if (healthNotes !== undefined && healthNotes !== '') {
        metadata.healthNotes = healthNotes;
      }
      
      // Prepare update data
      const updateData = {
        ...cleanData,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      };
      
      console.log('Sending update data:', updateData);
      
      // Update cattle data
      const updatedCattle = await cattleApi.update(Number(id), updateData);
      
      // Upload photo if provided
      if (photoFile) {
        await cattleApi.uploadPhoto(updatedCattle.id, photoFile);
      }
      
      return updatedCattle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cattle'] });
      toast.success('Cattle updated successfully!');
      navigate(`/cattle/${id}`);
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update cattle');
    },
  });

  const onSubmit = async (data: EditCattleForm) => {
    console.log('Form submitted with data:', data);
    updateMutation.mutate(data);
  };

  const nextStep = async () => {
    console.log('Next step clicked, current step:', currentStep);
    const currentStepId = steps[currentStep].id;
    let fieldsToValidate: (keyof EditCattleForm)[] = [];

    switch (currentStepId) {
      case 'basic':
        // Only validate required fields
        fieldsToValidate = ['name', 'tagNumber', 'gender', 'status'];
        break;
      case 'breeding':
        // No required fields in breeding step - all are optional
        fieldsToValidate = [];
        break;
      case 'health':
        // No required fields in health step - all are optional
        fieldsToValidate = [];
        break;
      case 'photo':
        // No required fields in photo step
        fieldsToValidate = [];
        break;
    }

    // Only validate if there are fields to validate
    const isValid = fieldsToValidate.length === 0 ? true : await methods.trigger(fieldsToValidate);
    console.log('Validation result:', isValid, 'for fields:', fieldsToValidate);
    
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        console.log('Last step, submitting form...');
        methods.handleSubmit(onSubmit)();
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !cattle) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cattle Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The cattle record you're trying to edit doesn't exist.
          </p>
          <button
            onClick={() => navigate('/cattle')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Back to Cattle List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/cattle/${id}`)}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Details
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Cattle: {cattle.name}</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update the information for this cattle record
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
        <form className="mt-8">
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
                  onClick={() => navigate(`/cattle/${id}`)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
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
                    type="button"
                    onClick={() => {
                      console.log('Save Changes clicked');
                      console.log('Current form values:', methods.getValues());
                      console.log('Form errors:', methods.formState.errors);
                      methods.handleSubmit(
                        (data) => {
                          console.log('Form is valid, submitting:', data);
                          onSubmit(data);
                        },
                        (errors) => {
                          console.log('Form validation failed:', errors);
                        }
                      )();
                    }}
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
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