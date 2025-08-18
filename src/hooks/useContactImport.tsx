import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

export interface ImportedContact {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  isValid?: boolean;
  isDuplicate?: boolean;
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
      const contacts: ImportedContact[] = [];

      if (file.name.toLowerCase().endsWith('.csv')) {
        // Enhanced CSV parsing using Papa Parse
        const result = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header: string) => {
              // Normalize common header variations
              const normalized = header.toLowerCase().trim();
              if (normalized.includes('first') || normalized.includes('given')) return 'firstName';
              if (normalized.includes('last') || normalized.includes('family') || normalized.includes('surname')) return 'lastName';
              if (normalized.includes('email') || normalized.includes('e-mail')) return 'email';
              if (normalized.includes('phone') || normalized.includes('mobile') || normalized.includes('cell')) return 'phone';
              if (normalized.includes('company') || normalized.includes('organization')) return 'company';
              if (normalized.includes('note')) return 'notes';
              return header;
            },
            complete: resolve,
            error: reject
          });
        });

        result.data.forEach((row: any) => {
          const contact: ImportedContact = {
            firstName: row.firstName || row['First Name'] || row['Given Name'] || '',
            lastName: row.lastName || row['Last Name'] || row['Family Name'] || row['Surname'] || '',
            email: row.email || row['Email'] || row['E-mail'] || '',
            phone: row.phone || row['Phone'] || row['Mobile'] || row['Cell'] || '',
            company: row.company || row['Company'] || row['Organization'] || '',
            notes: row.notes || row['Notes'] || '',
            isValid: true
          };
          
          // Basic validation
          if (contact.firstName || contact.lastName) {
            contacts.push(contact);
          }
        });
      } else if (file.name.toLowerCase().endsWith('.vcf')) {
        // Enhanced VCF parsing
        const text = await file.text();
        const vcfEntries = text.split('BEGIN:VCARD');
        
        for (const entry of vcfEntries) {
          if (!entry.trim()) continue;
          
          const fnMatch = entry.match(/FN:(.+)/);
          const nMatch = entry.match(/N:([^;]*);([^;]*)/);
          const emailMatch = entry.match(/EMAIL[^:]*:(.+)/);
          const telMatch = entry.match(/TEL[^:]*:(.+)/);
          const orgMatch = entry.match(/ORG:(.+)/);
          const noteMatch = entry.match(/NOTE:(.+)/);
          
          if (fnMatch || nMatch) {
            let firstName = '';
            let lastName = '';
            
            if (nMatch) {
              lastName = nMatch[1]?.trim() || '';
              firstName = nMatch[2]?.trim() || '';
            } else if (fnMatch) {
              const fullName = fnMatch[1].trim();
              const nameParts = fullName.split(' ');
              firstName = nameParts[0] || '';
              lastName = nameParts.slice(1).join(' ') || '';
            }
            
            contacts.push({
              firstName,
              lastName,
              email: emailMatch ? emailMatch[1].trim() : '',
              phone: telMatch ? telMatch[1].trim() : '',
              company: orgMatch ? orgMatch[1].trim() : '',
              notes: noteMatch ? noteMatch[1].trim() : '',
              isValid: true
            });
          }
        }
      }

      // Validate and mark duplicates
      const validatedContacts = validateAndMarkDuplicates(contacts);

      toast({
        title: "File imported",
        description: `Successfully imported ${validatedContacts.length} contact${validatedContacts.length !== 1 ? 's' : ''} from file`
      });

      return validatedContacts;
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

  const validateAndMarkDuplicates = (contacts: ImportedContact[]): ImportedContact[] => {
    const seen = new Set<string>();
    return contacts.map(contact => {
      const key = `${contact.firstName}-${contact.lastName}-${contact.email}`.toLowerCase();
      const isDuplicate = seen.has(key);
      if (!isDuplicate) seen.add(key);
      
      return {
        ...contact,
        isDuplicate,
        isValid: !!(contact.firstName || contact.lastName)
      };
    }).filter(contact => contact.firstName || contact.lastName);
  };

  const generateCSVTemplate = (): string => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Notes'];
    const sampleData = [
      ['John', 'Doe', 'john.doe@email.com', '+1-555-0123', 'Acme Corp', 'Met at conference'],
      ['Jane', 'Smith', 'jane.smith@email.com', '+1-555-0456', 'Tech Solutions', 'Former colleague']
    ];
    
    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return csvContent;
  };

  const downloadCSVTemplate = () => {
    const csvContent = generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contacts-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast({
      title: "Template downloaded",
      description: "CSV template saved to your downloads folder"
    });
  };

  return {
    isSupported,
    isLoading,
    importFromContacts,
    importFromFile,
    validateAndMarkDuplicates,
    downloadCSVTemplate
  };
}