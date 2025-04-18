import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Camera } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useNavigate } from 'react-router-dom';

interface ProfileSetupProps {
  onComplete: (name: string, photoUrl?: string) => void;
  onSkip: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, onSkip }) => {
  const { setUserName } = useUserProfile();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setPhotoUrl(objectUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(name);
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/home');
  };

  return (
    <Card className="w-full max-w-md mx-4 shadow-lg">
      <CardContent className="pt-8 px-6 pb-8">
        <h1 className="text-2xl font-bold text-center font-montserrat mb-10">Tell us about you</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-28 h-28">
                <AvatarImage src={previewUrl} />
                <AvatarFallback className="bg-[#FFF2E5] border-2 border-[#FFDDB3]">
                  <User className="w-12 h-12 text-[#FF9500]" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="bg-[#FF9500] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                    <Camera className="h-5 w-5" />
                  </div>
                  <input 
                    id="photo-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="h-14 rounded-2xl bg-muted border border-input text-lg px-5"
            />
          </div>
          
          <div className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-[#FF9500] hover:bg-[#FF9500]/90 shadow-sm text-lg font-bold"
              disabled={!name.trim()}
            >
              Get Started
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="text-sm text-muted-foreground underline"
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
