import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Users, Upload, Smartphone } from "lucide-react";
import { useContactImport, ImportedContact } from '@/hooks/useContactImport';

interface ContactImportButtonProps {
  onContactsImported: (contacts: ImportedContact[]) => void;
  disabled?: boolean;
}

const ContactImportButton: React.FC<ContactImportButtonProps> = ({
  onContactsImported,
  disabled = false
}) => {
  const { isSupported, isLoading, importFromContacts, importFromFile } = useContactImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFromContacts = async () => {
    const contacts = await importFromContacts();
    if (contacts.length > 0) {
      onContactsImported(contacts);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromFile(file).then(contacts => {
        if (contacts.length > 0) {
          onContactsImported(contacts);
        }
      });
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // If contact picker is supported, show both options
  if (isSupported) {
    return (
      <div className="flex items-center gap-2">
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
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleImportFromContacts}>
              <Smartphone className="h-4 w-4 mr-2" />
              From Phone Contacts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUploadClick}>
              <Upload className="h-4 w-4 mr-2" />
              From File (CSV/VCF)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.vcf"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  // For iOS and unsupported devices, show only file upload
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        disabled={disabled || isLoading}
        onClick={handleUploadClick}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Import from File
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.vcf"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ContactImportButton;