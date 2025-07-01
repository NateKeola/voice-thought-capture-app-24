
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
    try {
      // Load categories from localStorage if available
      const stored = localStorage.getItem('taskCategories');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure we have at least the default categories
        const merged = [...defaultCategories];
        parsed.forEach((cat: Category) => {
          if (!merged.find(existing => existing.id === cat.id)) {
            merged.push(cat);
          }
        });
        return merged;
      }
      return defaultCategories;
    } catch (error) {
      console.error('Error loading categories from localStorage:', error);
      return defaultCategories;
    }
  });

  // Save categories to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('taskCategories', JSON.stringify(categories));
      console.log('Categories saved to localStorage:', categories);
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }, [categories]);

  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name,
      color,
    };
    setCategories(prev => {
      const updated = [...prev, newCategory];
      console.log('Adding category:', newCategory, 'Updated list:', updated);
      return updated;
    });
  };

  const deleteCategory = (id: string) => {
    // Prevent deletion of default categories
    const defaultIds = defaultCategories.map(cat => cat.id);
    if (defaultIds.includes(id)) {
      console.warn('Cannot delete default category:', id);
      return;
    }
    
    setCategories(prev => {
      const updated = prev.filter(cat => cat.id !== id);
      console.log('Deleting category:', id, 'Updated list:', updated);
      return updated;
    });
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
