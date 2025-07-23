import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: string;
  title: string;
}

interface FormStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export function FormStepIndicator({ steps, currentStep, onStepClick }: FormStepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}
          >
            {index !== steps.length - 1 && (
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="h-0.5 w-full bg-gray-200" />
              </div>
            )}
            <button
              type="button"
              onClick={() => onStepClick?.(index)}
              disabled={!onStepClick || index > currentStep}
              className={`
                relative flex h-8 w-8 items-center justify-center rounded-full
                ${
                  index < currentStep
                    ? 'bg-green-600 hover:bg-green-700'
                    : index === currentStep
                    ? 'bg-green-600'
                    : 'bg-white border-2 border-gray-300'
                }
                ${onStepClick && index <= currentStep ? 'cursor-pointer' : 'cursor-default'}
                disabled:cursor-not-allowed
              `}
            >
              {index < currentStep ? (
                <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
              ) : (
                <span
                  className={`text-sm ${
                    index === currentStep ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {index + 1}
                </span>
              )}
              <span className="sr-only">{step.title}</span>
            </button>
            <span
              className={`
                absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap
                ${index === currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'}
                hidden sm:block
              `}
            >
              {step.title}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}