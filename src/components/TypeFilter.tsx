
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemoType } from '@/types';
import { FileText, CheckCircle, CircleAlert, Layers } from "lucide-react";

interface TypeFilterProps {
  activeType: MemoType | 'all';
  onChange: (type: MemoType | 'all') => void;
}

const TypeFilter: React.FC<TypeFilterProps> = ({ activeType, onChange }) => {
  return (
    <div className="bg-white rounded-lg p-3 shadow-sm">
      <Tabs defaultValue={activeType} onValueChange={(value) => onChange(value as MemoType | 'all')}>
        <TabsList className="w-full bg-gray-100">
          <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-orange-500">
            <Layers className="h-4 w-4 mr-2" />
            All
          </TabsTrigger>
          <TabsTrigger value="note" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-blue-500">
            <FileText className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="task" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-purple-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="idea" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-orange-500">
            <CircleAlert className="h-4 w-4 mr-2" />
            Ideas
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TypeFilter;
