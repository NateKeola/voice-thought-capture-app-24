
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Check, X } from "lucide-react";
import { DetectedPerson } from "@/services/PersonDetectionService";

interface PersonProposalCardProps {
  person: DetectedPerson;
  isSelected: boolean;
  onToggle: (person: DetectedPerson) => void;
}

const PersonProposalCard: React.FC<PersonProposalCardProps> = ({
  person,
  isSelected,
  onToggle
}) => {
  return (
    <Card 
      className={`
        relative cursor-pointer transition-all duration-200 border-2
        ${isSelected 
          ? 'border-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-200' 
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm'
        }
      `}
      onClick={() => onToggle(person)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`
              p-2 rounded-full 
              ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
            `}>
              <User className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {person.name}
                </h3>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
              
              <div className="mt-1">
                <Badge 
                  variant="secondary" 
                  className={`
                    text-xs 
                    ${isSelected 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {person.relationship}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                "{person.context}"
              </p>
            </div>
          </div>
        </div>
        
        {/* Light highlight overlay when selected */}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-100 opacity-10 rounded-lg pointer-events-none" />
        )}
      </CardContent>
    </Card>
  );
};

export default PersonProposalCard;
