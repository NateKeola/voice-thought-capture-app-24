
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, ListChecks, LightbulbIcon, ArrowRight } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface QuickTourProps {
  onFinish: () => void;
}

export const QuickTour: React.FC<QuickTourProps> = ({ onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps: TourStep[] = [
    {
      title: "Record Anytime",
      description: "Tap to record your thoughts anytime",
      icon: <Mic className="w-12 h-12 text-[#F97316]" />,
    },
    {
      title: "Automatic Organization",
      description: "We'll organize everything automatically",
      icon: <ListChecks className="w-12 h-12 text-[#33C3F0]" />,
    },
    {
      title: "Track Everything",
      description: "Keep track of tasks, ideas, and conversations",
      icon: <LightbulbIcon className="w-12 h-12 text-[#F97316]" />,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <Card className="w-full max-w-md mx-4 shadow-lg">
      <CardContent className="pt-8 px-6 pb-8">
        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 w-12 rounded-full ${
                index === currentStep ? 'bg-[#33C3F0]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
          <p className="text-muted-foreground mb-8">{steps[currentStep].description}</p>
        </div>

        <Button 
          className="w-full bg-[#33C3F0] hover:bg-[#33C3F0]/90 flex items-center justify-center"
          onClick={handleNext}
        >
          {isLastStep ? (
            <>
              Let's Try It
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
