
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

interface TaskClearAllDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
  action: "complete" | "delete";
  categoryName?: string;
}

const TaskClearAllDialog: React.FC<TaskClearAllDialogProps> = ({ 
  isOpen, 
  onClose, 
  tasks, 
  action,
  categoryName 
}) => {
  const { updateMemo } = useMemos();
  const { toast } = useToast();

  const handleClearAll = async () => {
    try {
      const relevantTasks = tasks.filter(task => !task.completed && !task.isDeleted);
      
      for (const task of relevantTasks) {
        if (action === "complete") {
          await updateMemo(task.id, {
            completed: true
          });
        } else {
          // Mark as deleted
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
        }
      }
      
      toast({
        title: action === "complete" ? "Tasks completed" : "Tasks removed",
        description: `All ${categoryName ? categoryName + ' ' : ''}tasks have been ${action === "complete" ? "marked as completed" : "removed from the tasks view"}.`,
      });
      
      onClose();
    } catch (error) {
      console.error(`Error ${action}ing tasks:`, error);
      toast({
        title: "Error",
        description: `There was a problem ${action}ing your tasks.`,
        variant: "destructive",
      });
    }
  };

  const actionText = action === "complete" ? "complete" : "remove";
  const actionTitle = action === "complete" ? "Complete All Tasks" : "Remove All Tasks";
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{actionTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {actionText} all {categoryName ? `${categoryName} ` : ''}tasks? 
            {action === "complete" ? " They will be marked as completed." : " They will be removed from the tasks view but remain accessible in other sections."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleClearAll} 
            className={action === "delete" ? "bg-red-500 hover:bg-red-600" : ""}
          >
            {action === "complete" ? "Complete All" : "Remove All"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TaskClearAllDialog;
