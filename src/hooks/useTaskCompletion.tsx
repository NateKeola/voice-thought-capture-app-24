
import { useMemos } from "@/contexts/MemoContext";
import { useToast } from "@/hooks/use-toast";

export const useTaskCompletion = () => {
  const { memos, updateMemo } = useMemos();
  const { toast } = useToast();

  const toggleTaskCompletion = async (taskId: number) => {
    console.log("Toggling completion for task ID:", taskId);
    
    // Find the corresponding memo
    const memo = memos.find(m => Number(m.id) === taskId && m.type === 'task');
    if (!memo) {
      console.error("Task memo not found for ID:", taskId);
      toast({
        title: "Error",
        description: "Task not found.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Found task memo:", memo.id, "current completed state:", memo.completed);
    
    try {
      // Toggle its completed status
      const newCompletedStatus = !memo.completed;
      await updateMemo(memo.id, {
        completed: newCompletedStatus
      });
      
      console.log("Successfully updated task completion status to:", newCompletedStatus);
      
      toast({
        title: newCompletedStatus ? "Task completed!" : "Task marked incomplete",
        description: newCompletedStatus 
          ? "Great job! Task has been marked as complete." 
          : "Task has been marked as incomplete.",
      });
    } catch (error) {
      console.error("Error updating task completion:", error);
      toast({
        title: "Error",
        description: "Failed to update task completion status.",
        variant: "destructive",
      });
    }
  };

  return { toggleTaskCompletion };
};
