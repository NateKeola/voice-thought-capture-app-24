import React, { useCallback, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, AlertCircle } from "lucide-react";
import { useContactImport, ImportedContact } from '@/hooks/useContactImport';
import { cn } from '@/lib/utils';

interface ContactDragDropZoneProps {
  onContactsImported: (contacts: ImportedContact[]) => void;
  disabled?: boolean;
}

const ContactDragDropZone = ({ onContactsImported, disabled }: ContactDragDropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { isLoading, importFromFile, downloadCSVTemplate } = useContactImport();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const contactFile = files.find(file => 
      file.name.toLowerCase().endsWith('.csv') || 
      file.name.toLowerCase().endsWith('.vcf')
    );

    if (contactFile) {
      const contacts = await importFromFile(contactFile);
      if (contacts.length > 0) {
        onContactsImported(contacts);
      }
    }
  }, [disabled, importFromFile, onContactsImported]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const contacts = await importFromFile(file);
      if (contacts.length > 0) {
        onContactsImported(contacts);
      }
    }
  }, [importFromFile, onContactsImported]);

  return (
    <Card className={cn(
      "p-8 border-2 border-dashed transition-all duration-200 text-center",
      isDragOver && !disabled && "border-primary bg-primary/5",
      disabled && "opacity-50 cursor-not-allowed",
      !disabled && "hover:border-primary/50 cursor-pointer"
    )}>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="space-y-4"
      >
        <div className="flex justify-center">
          <Upload className={cn(
            "h-12 w-12 transition-colors",
            isDragOver && !disabled ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Import Contact Files</h3>
          <p className="text-muted-foreground text-sm">
            Drag and drop CSV or VCF files here, or click to browse
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <input
            type="file"
            accept=".csv,.vcf"
            onChange={handleFileSelect}
            disabled={disabled || isLoading}
            className="hidden"
            id="contact-file-input"
          />
          <label htmlFor="contact-file-input">
            <Button 
              variant="outline" 
              disabled={disabled || isLoading}
              className="cursor-pointer"
              asChild
            >
              <span>
                <FileText className="h-4 w-4 mr-2" />
                {isLoading ? 'Processing...' : 'Choose File'}
              </span>
            </Button>
          </label>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={downloadCSVTemplate}
            disabled={disabled}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="h-3 w-3" />
            <span>Supported formats: CSV, VCF (vCard)</span>
          </div>
          <p>Compatible with Google Contacts, Outlook, Apple Contacts, and more</p>
        </div>
      </div>
    </Card>
  );
};

export default ContactDragDropZone;