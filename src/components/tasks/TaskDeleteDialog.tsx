
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
  const { updateMemo } = useMemos();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      console.log("Deleting task with ID:", task.id, "Type:", typeof task.id);
      
      // Get the original memo text and append the deleted marker
      let updatedText = task.title;
      if (task.description) {
        updatedText += '. ' + task.description;
      }
      
      // Remove any existing metadata first
      updatedText = updatedText
        .replace(/\[priority:\s*\w+\]/gi, '')
        .replace(/\[due:\s*[\w\s]+\]/gi, '')
        .replace(/\[deleted:\s*\w+\]/gi, '')
        .trim();
      
      // Add deleted marker
      updatedText += ' [deleted:true]';
      
      await updateMemo(task.id, {
        text: updatedText
      });
      
      console.log("Task marked as deleted successfully");
      
      toast({
        title: "Task removed",
        description: "Your task has been removed from the tasks view.",
      });
      
      onClose();
    } catch (error) {
      console.error("Error removing task:", error);
      toast({
        title: "Error",
        description: "There was a problem removing your task.",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove "{task?.title}" from the tasks view? The memo will still be available in other sections.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TaskDeleteDialog;
