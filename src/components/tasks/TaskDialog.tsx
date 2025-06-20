
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemos } from "@/contexts/MemoContext";
import { useTaskDialog } from "@/hooks/useTaskDialog";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["high", "medium", "low"]),
  due: z.enum(["today", "tomorrow", "this week", "next week", "next month"]),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

// Updated to match the categories in TasksPage
const categories = [
  { id: "task", name: "Tasks" },
  { id: "idea", name: "Ideas" },
  { id: "note", name: "Notes" },
];

const TaskDialog: React.FC = () => {
  const { isTaskDialogOpen, closeTaskDialog, preselectedCategory } = useTaskDialog();
  const { createMemo } = useMemos();
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "task",
      priority: "medium",
      due: "today",
    },
  });

  // Update form when dialog opens and when preselected category changes
  React.useEffect(() => {
    if (isTaskDialogOpen) {
      console.log("TaskDialog opened with preselectedCategory:", preselectedCategory);
      form.reset({
        title: "",
        description: "",
        category: preselectedCategory || "task",
        priority: "medium",
        due: "today",
      });
    }
  }, [isTaskDialogOpen, preselectedCategory, form]);

  const onSubmit = async (values: TaskFormValues) => {
    try {
      // Format the text to include metadata in square brackets
      const taskText = `${values.title}${values.description ? '. ' + values.description : ''} [priority:${values.priority}] [due:${values.due}]`;
      
      await createMemo({
        text: taskText,
        type: values.category as "task" | "idea" | "note",
        audioUrl: "",
      });

      toast({
        title: "Item created",
        description: "Your item has been created successfully.",
      });
      
      closeTaskDialog();
      form.reset();
    } catch (error) {
      console.error("Error creating item:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your item.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isTaskDialogOpen} onOpenChange={closeTaskDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new item.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description" 
                      className="h-20 resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select due date" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="this week">This Week</SelectItem>
                        <SelectItem value="next week">Next Week</SelectItem>
                        <SelectItem value="next month">Next Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={closeTaskDialog}>
                Cancel
              </Button>
              <Button type="submit">Create Item</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
