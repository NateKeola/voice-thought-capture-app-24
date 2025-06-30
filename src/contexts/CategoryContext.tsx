
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const defaultCategories: Category[] = [
  { id: "personal", name: "Personal", color: "#8B5CF6" },
  { id: "work", name: "Work", color: "#3B82F6" },
  { id: "health", name: "Health", color: "#EC4899" },
  { id: "finance", name: "Finance", color: "#10B981" },
  { id: "home", name: "Home", color: "#F59E0B" },
];

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    // Load categories from localStorage if available
    const stored = localStorage.getItem('taskCategories');
    return stored ? JSON.parse(stored) : defaultCategories;
  });

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taskCategories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory, getCategoryById }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
