
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, FileText, Shield, Info } from 'lucide-react';

interface HelpSupportProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpSupport: React.FC<HelpSupportProps> = ({ isOpen, onClose }) => {
  const handleContactSupport = () => {
    // In a real app, this would open email client or support form
    window.open('mailto:support@memo.app?subject=Support Request', '_blank');
  };

  const handleTermsClick = () => {
    // In a real app, this would navigate to terms page
    window.open('/terms', '_blank');
  };

  const handlePrivacyClick = () => {
    // In a real app, this would navigate to privacy page
    window.open('/privacy', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-3">
            <Info className="h-5 w-5 text-gray-500" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">App Version</h3>
              <p className="text-sm text-gray-600">1.0.0</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleContactSupport}
              variant="outline" 
              className="w-full flex items-center justify-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Contact Support</span>
            </Button>

            <Button 
              onClick={handleTermsClick}
              variant="ghost" 
              className="w-full flex items-center justify-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Terms of Service</span>
            </Button>

            <Button 
              onClick={handlePrivacyClick}
              variant="ghost" 
              className="w-full flex items-center justify-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Privacy Policy</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpSupport;
