
import React, { useState } from "react";
import { useTaskDialog } from "@/hooks/useTaskDialog";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/contexts/CategoryContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: any;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ isOpen, onClose, category }) => {
  const { addCategory } = useCategories();
  const { toast } = useToast();
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.color || "#8B5CF6"); // Default to purple
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      addCategory(name.trim(), color);
      toast({
        title: "Success",
        description: "Category created successfully!",
      });
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setColor("#8B5CF6");
    onClose();
  };

  const predefinedColors = [
    "#8B5CF6", // Purple
    "#3B82F6", // Blue
    "#EC4899", // Pink
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#6B7280", // Gray
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category for organizing your tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Projects, Study, Personal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Category Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10 p-1"
              />
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
