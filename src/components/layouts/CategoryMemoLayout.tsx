
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import CategorySidebar from '../CategorySidebar';

interface CategoryMemoLayoutProps {
  children: React.ReactNode;
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string | null;
}

const CategoryMemoLayout: React.FC<CategoryMemoLayoutProps> = ({
  children,
  onCategorySelect,
  selectedCategory
}) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <CategorySidebar
          onCategorySelect={onCategorySelect}
          selectedCategory={selectedCategory}
        />
        <SidebarInset className="flex-1">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default CategoryMemoLayout;
