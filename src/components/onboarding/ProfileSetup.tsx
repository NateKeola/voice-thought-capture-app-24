
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (name: string, photoUrl?: string) => void;
  onSkip: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, onSkip }) => {
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // In a real app, you would upload this to storage and get a URL
      // For now, we'll just create a local object URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setPhotoUrl(objectUrl); // In real app this would be your storage URL
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(name, photoUrl);
  };

  return (
    <Card className="w-full max-w-md mx-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Tell us about you</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={previewUrl} />
                <AvatarFallback className="bg-[#FEC6A1]">
                  <User className="w-12 h-12 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">+</div>
                  <input 
                    id="photo-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Your Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full bg-[#33C3F0] hover:bg-[#33C3F0]/90"
              disabled={!name.trim()}
            >
              Get Started
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="text-sm"
              onClick={onSkip}
            >
              Skip for now
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
