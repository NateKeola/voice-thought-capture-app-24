
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteRelationshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  relationshipName: string;
}

const DeleteRelationshipDialog: React.FC<DeleteRelationshipDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  relationshipName,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Relationship</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete your relationship with {relationshipName}? 
            This action cannot be undone and will also remove all associated memos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRelationshipDialog;
