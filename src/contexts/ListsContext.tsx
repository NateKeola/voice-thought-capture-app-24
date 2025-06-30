
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ListCategory {
  id: string;
  name: string;
  color: string;
}

interface ListsContextType {
  lists: ListCategory[];
  createList: (name: string, color: string) => void;
  updateList: (id: string, updates: Partial<ListCategory>) => void;
  deleteList: (id: string) => void;
  getListById: (id: string) => ListCategory | undefined;
  addListCategory: (name: string, color: string) => void;
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
  const [lists, setLists] = useState<ListCategory[]>(() => {
    // Load list categories from localStorage if available
    const stored = localStorage.getItem('listCategories');
    return stored ? JSON.parse(stored) : defaultListCategories;
  });

  // Save list categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('listCategories', JSON.stringify(lists));
  }, [lists]);

  const createList = (name: string, color: string) => {
    const newCategory: ListCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      color,
    };
    setLists(prev => [...prev, newCategory]);
  };

  const addListCategory = (name: string, color: string) => {
    createList(name, color);
  };

  const updateList = (id: string, updates: Partial<ListCategory>) => {
    setLists(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };

  const deleteList = (id: string) => {
    setLists(prev => prev.filter(cat => cat.id !== id));
  };

  const getListById = (id: string) => {
    return lists.find(cat => cat.id === id);
  };

  return (
    <ListsContext.Provider value={{ lists, createList, updateList, deleteList, getListById, addListCategory }}>
      {children}
    </ListsContext.Provider>
  );
};

export const useLists = () => {
  const context = useContext(ListsContext);
  if (!context) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
};

export const useListsCategories = () => {
  const context = useContext(ListsContext);
  if (!context) {
    throw new Error('useListsCategories must be used within a ListsProvider');
  }
  return context;
};
