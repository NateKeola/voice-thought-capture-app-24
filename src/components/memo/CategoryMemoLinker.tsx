import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, Plus, Search, X } from "lucide-react";
import { useMemos } from '@/contexts/MemoContext';
import { useCategories } from '@/contexts/CategoryContext';
import { useProfiles } from '@/hooks/useProfiles';
import { Memo } from '@/types';

interface CategoryMemoLinkerProps {
  categoryId: string;
  categoryName: string;
  isOpen: boolean;
  onToggle: () => void;
}

const CategoryMemoLinker: React.FC<CategoryMemoLinkerProps> = ({
  categoryId,
  categoryName,
  isOpen,
  onToggle
}) => {
  const { memos, updateMemo } = useMemos();
  const { updateProfile } = useProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Get memos linked to this category
  const linkedMemos = memos.filter(memo => 
    memo.text.includes(`[Category: ${categoryId}]`)
  );

  // Get available memos for linking (not already linked to this category)
  const availableMemos = memos.filter(memo => 
    !memo.text.includes(`[Category: ${categoryId}]`) &&
    memo.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const linkMemoToCategory = async (memo: Memo) => {
    try {
      const updatedText = `[Category: ${categoryId}] ${memo.text}`;
      await updateMemo(memo.id, { text: updatedText });
      
      // Update last_interaction for any related relationships
      const contactMatch = memo.text.match(/\[Contact: ([^\]]+)\]/);
      if (contactMatch) {
        const relationshipId = contactMatch[1];
        try {
          await updateProfile.mutateAsync({ 
            id: relationshipId, 
            last_interaction: new Date().toISOString() 
          });
        } catch (error) {
          console.error('Error updating relationship last interaction:', error);
        }
      }
      
      setSearchTerm('');
      setShowSearch(false);
    } catch (error) {
      console.error('Error linking memo to category:', error);
    }
  };

  const unlinkMemoFromCategory = async (memo: Memo) => {
    try {
      const updatedText = memo.text.replace(`[Category: ${categoryId}] `, '');
      await updateMemo(memo.id, { text: updatedText });
      
      // Update last_interaction for any related relationships
      const contactMatch = memo.text.match(/\[Contact: ([^\]]+)\]/);
      if (contactMatch) {
        const relationshipId = contactMatch[1];
        try {
          await updateProfile.mutateAsync({ 
            id: relationshipId, 
            last_interaction: new Date().toISOString() 
          });
        } catch (error) {
          console.error('Error updating relationship last interaction:', error);
        }
      }
    } catch (error) {
      console.error('Error unlinking memo from category:', error);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="w-full justify-start text-xs text-gray-600 hover:text-gray-800"
      >
        <Link className="h-3 w-3 mr-2" />
        Link Memos ({linkedMemos.length})
      </Button>
    );
  }

  return (
    <Card className="border border-gray-200 bg-gray-50">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">
            Linked Memos for {categoryName}
          </h4>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Linked Memos List */}
        {linkedMemos.length > 0 ? (
          <div className="space-y-2">
            {linkedMemos.map((memo) => (
              <div
                key={memo.id}
                className="flex items-center justify-between p-2 bg-white rounded border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">
                    {memo.title || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {memo.text.replace(`[Category: ${categoryId}] `, '').substring(0, 50)}...
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unlinkMemoFromCategory(memo)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-2">
            No memos linked to this category
          </p>
        )}

        {/* Add Memo Section */}
        {!showSearch ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(true)}
            className="w-full text-xs"
          >
            <Plus className="h-3 w-3 mr-2" />
            Link Memo
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Search memos to link..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 text-xs h-8"
              />
            </div>
            
            {searchTerm && availableMemos.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableMemos.slice(0, 5).map((memo) => (
                  <button
                    key={memo.id}
                    onClick={() => linkMemoToCategory(memo)}
                    className="w-full p-2 text-left bg-white rounded border hover:bg-gray-50 text-xs"
                  >
                    <p className="font-medium text-gray-800 truncate">
                      {memo.title || 'Untitled'}
                    </p>
                    <p className="text-gray-500 truncate">
                      {memo.text.substring(0, 40)}...
                    </p>
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSearch(false);
                  setSearchTerm('');
                }}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryMemoLinker;
