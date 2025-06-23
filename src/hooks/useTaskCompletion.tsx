
import { useMemos } from "@/contexts/MemoContext";

export const useTaskCompletion = () => {
  const { toggleTaskCompletion } = useMemos();

  const toggleCompletion = async (taskId: number | string) => {
    const id = typeof taskId === 'number' ? taskId.toString() : taskId;
    return await toggleTaskCompletion(id);
  };

  return { toggleTaskCompletion: toggleCompletion };
};
