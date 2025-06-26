
export interface MemoMetadata {
  cleanText: string;
  contacts: string[];
  categories: string[];
  priorities: string[];
  dueDates: string[];
}

export const extractMemoMetadata = (text: string): MemoMetadata => {
  if (!text) return { cleanText: '', contacts: [], categories: [], priorities: [], dueDates: [] };
  
  const contacts: string[] = [];
  const categories: string[] = [];
  const priorities: string[] = [];
  const dueDates: string[] = [];
  
  // Extract contact IDs for relationship detection
  const contactMatches = text.match(/\[Contact:\s*([^\]]+)\]/g);
  if (contactMatches) {
    contactMatches.forEach(match => {
      const contactId = match.match(/\[Contact:\s*([^\]]+)\]/)![1];
      contacts.push(contactId.trim());
    });
  }
  
  // Extract other metadata
  const categoryMatches = text.match(/\[category:\s*(\w+)\]/gi);
  if (categoryMatches) {
    categoryMatches.forEach(match => {
      const category = match.match(/\[category:\s*(\w+)\]/i)![1];
      categories.push(category);
    });
  }
  
  const priorityMatches = text.match(/\[priority:\s*(\w+)\]/gi);
  if (priorityMatches) {
    priorityMatches.forEach(match => {
      const priority = match.match(/\[priority:\s*(\w+)\]/i)![1];
      priorities.push(priority);
    });
  }
  
  const dueDateMatches = text.match(/\[due:\s*([\w\s]+)\]/gi);
  if (dueDateMatches) {
    dueDateMatches.forEach(match => {
      const dueDate = match.match(/\[due:\s*([\w\s]+)\]/i)![1];
      dueDates.push(dueDate.trim());
    });
  }
  
  // Clean text for display (remove all metadata tags)
  const cleanText = text
    .replace(/\[Contact:\s*[^\]]+\]/g, '')
    .replace(/\[category:\s*\w+\]/gi, '')
    .replace(/\[priority:\s*\w+\]/gi, '')
    .replace(/\[due:\s*[\w\s]+\]/gi, '')
    .trim();
  
  return {
    cleanText,
    contacts,
    categories,
    priorities,
    dueDates
  };
};

export const extractKeywords = (text: string): string[] => {
  if (!text) return [];
  
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['that', 'this', 'with', 'have', 'will', 'from', 'they', 'been', 'said', 'each', 'which', 'them', 'many', 'some'].includes(word))
    .slice(0, 10);
};
