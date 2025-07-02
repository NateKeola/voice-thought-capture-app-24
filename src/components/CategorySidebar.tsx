
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useCategories } from '@/contexts/CategoryContext';
import CategoryMemoLinker from './memo/CategoryMemoLinker';
import { Tag, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CategorySidebarProps {
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string | null;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  onCategorySelect,
  selectedCategory
}) => {
  const { categories } = useCategories();
  const [openLinkers, setOpenLinkers] = useState<{ [key: string]: boolean }>({});

  const toggleLinker = (categoryId: string) => {
    setOpenLinkers(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <Sidebar className="w-80 border-r border-gray-200">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Categories</span>
            <SidebarTrigger />
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
                <SidebarMenuItem key={category.id} className="space-y-2">
                  <SidebarMenuButton
                    onClick={() => onCategorySelect?.(category.id)}
                    className={`w-full justify-start ${
                      selectedCategory === category.id ? 'bg-blue-100 text-blue-800' : ''
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1 text-left">{category.name}</span>
                    <Tag className="h-4 w-4 text-gray-400" />
                  </SidebarMenuButton>
                  
                  <div className="ml-6">
                    <CategoryMemoLinker
                      categoryId={category.id}
                      categoryName={category.name}
                      isOpen={openLinkers[category.id] || false}
                      onToggle={() => toggleLinker(category.id)}
                    />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default CategorySidebar;
