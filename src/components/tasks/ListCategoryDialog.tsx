
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useListsCategories } from "@/contexts/ListsContext";
import { useTaskDialog } from "@/hooks/useTaskDialog";
import { toast } from "sonner";

const colors = [
  "#8B5CF6", "#3B82F6", "#EC4899", "#10B981", "#F59E0B",
  "#EF4444", "#F97316", "#84CC16", "#06B6D4", "#8B5A2B"
];

interface ListCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  list?: any;
}

const ListCategoryDialog: React.FC<ListCategoryDialogProps> = ({ isOpen, onClose, list }) => {
  const { addListCategory } = useListsCategories();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    addListCategory(name.trim(), selectedColor);
    toast.success("List category created successfully!");
    
    // Reset form
    setName("");
    setSelectedColor(colors[0]);
    onClose();
  };

  const handleClose = () => {
    setName("");
    setSelectedColor(colors[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New List Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your lists.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Shopping, Movies, Books"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Create Category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ListCategoryDialog;
