
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Memo, MemoType } from "@/types";
import { extractMemoMetadata } from '@/utils/memoMetadata';

interface MemoEditScreenProps {
  initialMemo?: Partial<Memo>;
  onSave: (memo: { text: string; type: MemoType; title?: string }) => Promise<void>;
  onCancel: () => void;
  isCreating?: boolean;
}

const MemoEditScreen: React.FC<MemoEditScreenProps> = ({
  initialMemo,
  onSave,
  onCancel,
  isCreating = false
}) => {
  // Clean the text content by removing any tags for editing
  const getEditableText = (text: string) => {
    const metadata = extractMemoMetadata(text || '');
    return metadata.cleanText;
  };

  const [text, setText] = useState(getEditableText(initialMemo?.text || ''));
  const [title, setTitle] = useState(initialMemo?.title || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    
    setIsSaving(true);
    try {
      // Save without person detection - that will happen in the detail page
      await onSave({ 
        text: text, 
        type: initialMemo?.type || 'note', 
        title: title.trim() || undefined
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isCreating ? 'Create Memo' : 'Edit Memo'}
            </h1>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-lg text-gray-800">
              {isCreating ? 'New Memo' : 'Edit Memo'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter memo title..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                Content
              </Label>
              <Textarea
                id="content"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your memo content..."
                className="mt-1 min-h-[200px] resize-none border-blue-100 focus-visible:ring-orange-500"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={!text.trim() || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Memo'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default MemoEditScreen;
