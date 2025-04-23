
import React from 'react';

interface AvatarSelectorProps {
  initials: string;
  onAvatarChange: (file: File) => void;
}

const AvatarSelector = ({ initials, onAvatarChange }: AvatarSelectorProps) => {
  return (
    <div className="flex justify-center mb-6">
      <div 
        className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-500 cursor-pointer"
        onClick={() => document.getElementById('avatar-upload')?.click()}
      >
        {initials || 'Add'}
        <input 
          id="avatar-upload" 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={(e) => e.target.files && onAvatarChange(e.target.files[0])}
        />
      </div>
    </div>
  );
};

export default AvatarSelector;

