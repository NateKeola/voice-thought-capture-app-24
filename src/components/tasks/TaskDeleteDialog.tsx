
import React from "react";
import { useMemos } from "@/contexts/MemoContext";
import { useToast } from "@/hooks/use-toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
}

const TaskDeleteDialog: React.FC<TaskDeleteDialogProps> = ({ isOpen, onClose, task }) => {
  const { deleteMemo } = useMemos();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteMemo(task.id.toString());
      
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting your task.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{task?.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TaskDeleteDialog;
