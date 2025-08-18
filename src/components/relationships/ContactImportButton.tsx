import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, Users, Upload, Smartphone, Download } from "lucide-react";
import { useContactImport, ImportedContact } from '@/hooks/useContactImport';
import ContactDragDropZone from './ContactDragDropZone';
import BulkContactEntry from './BulkContactEntry';

interface ContactImportButtonProps {
  onContactsImported: (contacts: ImportedContact[]) => void;
  disabled?: boolean;
}

const ContactImportButton = ({ onContactsImported, disabled }: ContactImportButtonProps) => {
  const { isSupported, isLoading, importFromContacts, importFromFile, downloadCSVTemplate } = useContactImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEnhancedImport, setShowEnhancedImport] = useState(false);

  const handleImportFromContacts = async () => {
    const contacts = await importFromContacts();
    if (contacts.length > 0) {
      onContactsImported(contacts);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const contacts = await importFromFile(file);
      if (contacts.length > 0) {
        onContactsImported(contacts);
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleEnhancedImportOpen = () => {
    setShowEnhancedImport(true);
  };

  // If contact picker is supported, show enhanced dropdown options
  if (isSupported) {
    return (
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled || isLoading}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Import Contacts
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem onClick={handleImportFromContacts}>
              <Smartphone className="mr-2 h-4 w-4" />
              From Phone Contacts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              From File (CSV/VCF)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEnhancedImportOpen}>
              <Upload className="mr-2 h-4 w-4" />
              Enhanced File Import
              <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">New</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={downloadCSVTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.vcf"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Enhanced Import Dialog */}
        <Dialog open={showEnhancedImport} onOpenChange={setShowEnhancedImport}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enhanced Contact Import</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <ContactDragDropZone 
                onContactsImported={onContactsImported}
                disabled={disabled}
              />
              <div className="flex justify-center">
                <BulkContactEntry onContactsAdded={onContactsImported} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // For non-supported devices (e.g., iOS), show enhanced options
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleUploadClick}
          disabled={disabled || isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isLoading ? 'Importing...' : 'Import from File'}
        </Button>
        
        <Button 
          onClick={handleEnhancedImportOpen}
          disabled={disabled}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Enhanced Import
        </Button>

        <Button 
          onClick={downloadCSVTemplate}
          disabled={disabled}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Template
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.vcf"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Enhanced Import Dialog */}
      <Dialog open={showEnhancedImport} onOpenChange={setShowEnhancedImport}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enhanced Contact Import</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <ContactDragDropZone 
              onContactsImported={onContactsImported}
              disabled={disabled}
            />
            <div className="flex justify-center">
              <BulkContactEntry onContactsAdded={onContactsImported} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactImportButton;