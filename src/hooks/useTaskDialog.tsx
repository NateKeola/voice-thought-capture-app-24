
import React, { createContext, useContext, useState } from "react";

interface TaskDialogContextType {
  isTaskDialogOpen: boolean;
  isCategoryDialogOpen: boolean;
  openTaskDialog: () => void;
  closeTaskDialog: () => void;
  openCategoryDialog: () => void;
  closeCategoryDialog: () => void;
}

const TaskDialogContext = createContext<TaskDialogContextType | undefined>(undefined);

export const TaskDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const openTaskDialog = () => setIsTaskDialogOpen(true);
  const closeTaskDialog = () => setIsTaskDialogOpen(false);
  const openCategoryDialog = () => setIsCategoryDialogOpen(true);
  const closeCategoryDialog = () => setIsCategoryDialogOpen(false);

  return (
    <TaskDialogContext.Provider
      value={{
        isTaskDialogOpen,
        isCategoryDialogOpen,
        openTaskDialog,
        closeTaskDialog,
        openCategoryDialog,
        closeCategoryDialog,
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
