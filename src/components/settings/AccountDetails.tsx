
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, User, HardDrive, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AccountDetailsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      onClose();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Account Details
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email</h3>
              <p className="text-sm text-gray-600">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <HardDrive className="h-5 w-5 text-gray-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Storage Used</h3>
              <p className="text-sm text-gray-600">2.3 GB of 15 GB</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '15.3%' }}></div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetails;
