
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User } from 'lucide-react';

interface ProfileMenuProps {
  onClose: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose }) => {
  const navigate = useNavigate();
  
  // Mock user data - in a real app, would come from auth context
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: ''
  };

  const handleSignOut = () => {
    // In a real app, would handle sign out logic here
    navigate('/');
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg z-10 overflow-hidden border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-orange-100 text-orange-800">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div className="p-2">
        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-orange-50 hover:text-orange-600">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-orange-50 hover:text-orange-600">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-orange-50 hover:text-orange-600" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfileMenu;
