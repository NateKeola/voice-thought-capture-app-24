
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="px-6 py-3 bg-gray-50 flex justify-center">
      <div className="flex space-x-2">
        {[...Array(totalSteps)].map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index + 1 === currentStep ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;

