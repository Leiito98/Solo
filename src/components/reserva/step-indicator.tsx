//app/components/reserva/step-indicator.tsx
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((label, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep

        return (
          <div key={stepNumber} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold
                  transition-all duration-200
                  ${isCompleted ? 'bg-primary text-white' : ''}
                  ${isCurrent ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>
              <span className={`
                text-xs mt-2 font-medium hidden sm:block
                ${isCurrent ? 'text-gray-900' : 'text-gray-500'}
              `}>
                {label}
              </span>
            </div>

            {/* Connector Line */}
            {stepNumber < totalSteps && (
              <div
                className={`
                  flex-1 h-1 mx-2
                  ${stepNumber < currentStep ? 'bg-primary' : 'bg-gray-200'}
                  transition-all duration-200
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}