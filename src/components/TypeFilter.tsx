
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
    <Tabs defaultValue={activeType} onValueChange={(value) => onChange(value as MemoType | 'all')}>
      <TabsList className="w-full">
        <TabsTrigger value="all" className="flex-1">
          <Layers className="h-4 w-4 mr-2" />
          All
        </TabsTrigger>
        <TabsTrigger value="note" className="flex-1">
          <FileText className="h-4 w-4 mr-2" />
          Notes
        </TabsTrigger>
        <TabsTrigger value="task" className="flex-1">
          <CheckCircle className="h-4 w-4 mr-2" />
          Tasks
        </TabsTrigger>
        <TabsTrigger value="idea" className="flex-1">
          <CircleAlert className="h-4 w-4 mr-2" />
          Ideas
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TypeFilter;
