
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Memo } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { FileText, CheckCircle, CircleAlert, FileAudio, Users } from "lucide-react";
import { extractMemoMetadata } from '@/utils/memoMetadata';
import { TitleGenerationService } from '@/services/titleGeneration';
import { useProfiles } from '@/hooks/useProfiles';

interface MemoCardProps {
  memo: Memo;
  onClick?: () => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ memo, onClick }) => {
  const { text, type, createdAt, audioUrl, title } = memo;
  const { profiles } = useProfiles();
  
  // Extract metadata and clean text for display
  const metadata = extractMemoMetadata(text || '');
  const displayText = metadata.cleanText;
  
  // Get contact names from metadata
  const getContactNames = () => {
    const contactNames: string[] = [];
    
    // Add detected person names from metadata.contacts
    contactNames.push(...metadata.contacts);
    
    // Extract relationship contact names from [Contact: id] tags
    const contactTags = text?.match(/\[Contact: ([^\]]+)\]/g) || [];
    contactTags.forEach(tag => {
      const idMatch = tag.match(/\[Contact: ([^\]]+)\]/);
      if (idMatch) {
        const contactId = idMatch[1];
        // Find the profile with this ID
        const profile = profiles?.find(p => p.id === contactId);
        if (profile) {
          const fullName = `${profile.first_name} ${profile.last_name}`.trim();
          if (!contactNames.includes(fullName)) {
            contactNames.push(fullName);
          }
        } else {
          // Skip IDs that look like UUIDs or codes - only add if it looks like a name
          const looksLikeName = contactId.length < 50 && !contactId.includes('-') && !/^[0-9a-f]{8,}/.test(contactId);
          if (looksLikeName && !contactNames.includes(contactId)) {
            contactNames.push(contactId);
          }
        }
      }
    });
    
    return contactNames;
  };
  
  const contactNames = getContactNames();
  
  // Helper function to check if a title is valid (not corrupted or auto-generated placeholder)
  const isValidUserTitle = (title: string | undefined) => {
    if (!title || typeof title !== 'string') return false;
    const trimmed = title.trim();
    if (trimmed === '' || trimmed === 'undefined') return false;
    if (trimmed.includes('_type') || trimmed.includes('value')) return false;
    return true;
  };
  
  // Helper function to map MemoType to title generation type
  const getMemoTypeForTitle = (memoType: string): 'task' | 'note' | 'idea' => {
    switch (memoType) {
      case 'task':
        return 'task';
      case 'note':
        return 'note';
      case 'idea':
        return 'idea';
      default:
        return 'note';
    }
  };
  
  // Use the memo's saved title if it exists and is valid, otherwise generate one for display
  let memoTitle = '';
  
  if (isValidUserTitle(title)) {
    memoTitle = title;
    console.log('✅ Using saved memo title:', memoTitle);
  } else {
    // Generate title only for display if none exists or if corrupted
    console.log('🔍 Generating title for memo:', memo.id);
    memoTitle = TitleGenerationService.generateImmediateTitle(text || '', getMemoTypeForTitle(type));
    console.log('🔍 Generated title:', memoTitle);
  }
  
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'note':
        return {
          icon: <FileText className="h-5 w-5" />,
          gradient: 'from-purple-500 via-pink-400 to-orange-400',
          bgClass: 'bg-purple-100',
          textClass: 'text-purple-600'
        };
      case 'task':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          gradient: 'from-blue-500 via-indigo-400 to-purple-400',
          bgClass: 'bg-blue-100',
          textClass: 'text-blue-600'
        };
      case 'idea':
        return {
          icon: <CircleAlert className="h-5 w-5" />,
          gradient: 'from-orange-500 via-amber-400 to-yellow-400',
          bgClass: 'bg-orange-100',
          textClass: 'text-orange-600'
        };
      default:
        return {
          icon: <FileText className="h-5 w-5" />,
          gradient: 'from-purple-500 via-pink-400 to-orange-400',
          bgClass: 'bg-purple-100',
          textClass: 'text-purple-600'
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <Card 
      className="relative overflow-hidden cursor-pointer transition-all hover:shadow-md group"
      onClick={onClick}
    >
      {/* Gradient border effect */}
      <div className={`absolute inset-0 opacity-0 bg-gradient-to-r ${config.gradient} group-hover:opacity-10 transition-opacity`} />
      
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 p-2 rounded-lg ${config.bgClass} ${config.textClass}`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-2 text-sm leading-tight">
              {memoTitle}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{displayText}</p>
            
            {/* Contact badges */}
            {contactNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {contactNames.map((name, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-3 px-6 flex justify-between text-xs text-muted-foreground">
        <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        <div className="flex items-center gap-3">
          {audioUrl && (
            <div className="flex items-center gap-1">
              <FileAudio className="h-3 w-3" />
              <span>Audio</span>
            </div>
          )}
          {metadata.contacts.length > 0 && (
            <div className="flex items-center gap-1 text-purple-600">
              <Users className="h-3 w-3" />
              <span>{metadata.contacts.length}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default MemoCard;
