
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Google, Apple, Facebook, Mail } from 'lucide-react';

interface WelcomeProps {
  onContinueWithEmail: () => void;
  onSignInLink: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ 
  onContinueWithEmail,
  onSignInLink
}) => {
  return (
    <Card className="w-full max-w-md mx-4 shadow-lg">
      <CardContent className="pt-6 px-6 pb-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-[#FEC6A1] to-[#F97316] flex items-center justify-center">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">MEMO</h1>
          <p className="text-muted-foreground">Your personal memory companion</p>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {}}
          >
            <Google className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {}}
          >
            <Apple className="mr-2 h-4 w-4" />
            Continue with Apple
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {}}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Continue with Facebook
          </Button>
          
          <Button 
            className="w-full bg-[#33C3F0] hover:bg-[#33C3F0]/90"
            onClick={onContinueWithEmail}
          >
            <Mail className="mr-2 h-4 w-4" />
            Sign up with Email
          </Button>
        </div>

        <div className="mt-6 text-center">
          <button 
            className="text-sm text-primary hover:underline"
            onClick={onSignInLink}
          >
            Already have an account? Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
