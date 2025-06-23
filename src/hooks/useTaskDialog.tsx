
import React, { createContext, useContext, useState } from "react";

interface TaskDialogContextType {
  isTaskDialogOpen: boolean;
  isCategoryDialogOpen: boolean;
  isListCategoryDialogOpen: boolean;
  preselectedCategory: string | null;
  openTaskDialog: (categoryId?: string) => void;
  closeTaskDialog: () => void;
  openCategoryDialog: () => void;
  closeCategoryDialog: () => void;
  openListCategoryDialog: () => void;
  closeListCategoryDialog: () => void;
}

const TaskDialogContext = createContext<TaskDialogContextType | undefined>(undefined);

export const TaskDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isListCategoryDialogOpen, setIsListCategoryDialogOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null);

  const openTaskDialog = (categoryId?: string) => {
    setPreselectedCategory(categoryId || null);
    setIsTaskDialogOpen(true);
  };
  
  const closeTaskDialog = () => {
    setIsTaskDialogOpen(false);
    setPreselectedCategory(null);
  };
  
  const openCategoryDialog = () => setIsCategoryDialogOpen(true);
  const closeCategoryDialog = () => setIsCategoryDialogOpen(false);
  
  const openListCategoryDialog = () => setIsListCategoryDialogOpen(true);
  const closeListCategoryDialog = () => setIsListCategoryDialogOpen(false);

  return (
    <TaskDialogContext.Provider
      value={{
        isTaskDialogOpen,
        isCategoryDialogOpen,
        isListCategoryDialogOpen,
        preselectedCategory,
        openTaskDialog,
        closeTaskDialog,
        openCategoryDialog,
        closeCategoryDialog,
        openListCategoryDialog,
        closeListCategoryDialog,
      }}
    >
      {children}
    </TaskDialogContext.Provider>
  );
};

export const useTaskDialog = () => {
  const context = useContext(TaskDialogContext);
  if (context === undefined) {
    throw new Error("useTaskDialog must be used within a TaskDialogProvider");
  }
  return context;
};
