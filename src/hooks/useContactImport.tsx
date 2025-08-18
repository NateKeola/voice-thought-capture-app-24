import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface ImportedContact {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export function useContactImport() {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Feature detection for Contact Picker API
    const supported = 'contacts' in navigator && 'ContactsManager' in window;
    setIsSupported(supported);
  }, []);

  const importFromContacts = async (): Promise<ImportedContact[]> => {
    if (!isSupported) {
      toast({
        title: "Not supported",
        description: "Contact importing is not supported on this device",
        variant: "destructive"
      });
      return [];
    }

    setIsLoading(true);
    try {
      const contacts = await (navigator as any).contacts.select(['name', 'email', 'tel'], {
        multiple: true
      });

      const importedContacts: ImportedContact[] = contacts.map((contact: any) => {
        const name = contact.name?.[0] || '';
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        return {
          firstName,
          lastName,
          email: contact.email?.[0] || '',
          phone: contact.tel?.[0] || ''
        };
      }).filter((contact: ImportedContact) => contact.firstName); // Filter out empty contacts

      toast({
        title: "Contacts imported",
        description: `Successfully imported ${importedContacts.length} contact${importedContacts.length !== 1 ? 's' : ''}`
      });

      return importedContacts;
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled
        return [];
      }
      
      toast({
        title: "Import failed",
        description: "Failed to import contacts. Please try again or add contacts manually.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const importFromFile = async (file: File): Promise<ImportedContact[]> => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const contacts: ImportedContact[] = [];

      if (file.name.toLowerCase().endsWith('.csv')) {
        // Parse CSV format (assuming: FirstName,LastName,Email,Phone)
        const lines = text.split('\n');
        for (let i = 1; i < lines.length; i++) { // Skip header
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',').map(part => part.replace(/"/g, '').trim());
          if (parts.length >= 2) {
            contacts.push({
              firstName: parts[0] || '',
              lastName: parts[1] || '',
              email: parts[2] || '',
              phone: parts[3] || ''
            });
          }
        }
      } else if (file.name.toLowerCase().endsWith('.vcf')) {
        // Basic VCF parsing
        const vcfEntries = text.split('BEGIN:VCARD');
        for (const entry of vcfEntries) {
          if (!entry.trim()) continue;
          
          const fnMatch = entry.match(/FN:(.+)/);
          const emailMatch = entry.match(/EMAIL[^:]*:(.+)/);
          const telMatch = entry.match(/TEL[^:]*:(.+)/);
          
          if (fnMatch) {
            const fullName = fnMatch[1].trim();
            const nameParts = fullName.split(' ');
            contacts.push({
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              email: emailMatch ? emailMatch[1].trim() : '',
              phone: telMatch ? telMatch[1].trim() : ''
            });
          }
        }
      }

      toast({
        title: "File imported",
        description: `Successfully imported ${contacts.length} contact${contacts.length !== 1 ? 's' : ''} from file`
      });

      return contacts.filter(contact => contact.firstName);
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to parse contact file. Please check the format and try again.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isLoading,
    importFromContacts,
    importFromFile
  };
}