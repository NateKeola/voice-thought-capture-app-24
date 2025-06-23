
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ListCategory {
  id: string;
  name: string;
  color: string;
}

interface ListsContextType {
  listCategories: ListCategory[];
  addListCategory: (name: string, color: string) => void;
  deleteListCategory: (id: string) => void;
  getListCategoryById: (id: string) => ListCategory | undefined;
}

const ListsContext = createContext<ListsContextType | undefined>(undefined);

const defaultListCategories: ListCategory[] = [
  { id: "shopping", name: "Shopping", color: "#8B5CF6" },
  { id: "projects", name: "Projects", color: "#3B82F6" },
  { id: "books", name: "Books", color: "#EC4899" },
  { id: "movies", name: "Movies", color: "#10B981" },
  { id: "travel", name: "Travel", color: "#F59E0B" },
];

export const ListsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listCategories, setListCategories] = useState<ListCategory[]>(() => {
    // Load list categories from localStorage if available
    const stored = localStorage.getItem('listCategories');
    return stored ? JSON.parse(stored) : defaultListCategories;
  });

  // Save list categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('listCategories', JSON.stringify(listCategories));
  }, [listCategories]);

  const addListCategory = (name: string, color: string) => {
    const newCategory: ListCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
    };
    setListCategories(prev => [...prev, newCategory]);
  };

  const deleteListCategory = (id: string) => {
    setListCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const getListCategoryById = (id: string) => {
    return listCategories.find(cat => cat.id === id);
  };

  return (
    <ListsContext.Provider value={{ listCategories, addListCategory, deleteListCategory, getListCategoryById }}>
      {children}
    </ListsContext.Provider>
  );
};

export const useListsCategories = () => {
  const context = useContext(ListsContext);
  if (!context) {
    throw new Error('useListsCategories must be used within a ListsProvider');
  }
  return context;
};
