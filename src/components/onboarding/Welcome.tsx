
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';

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
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Continue with Google
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {}}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M16.24 5.46C15.07 4.95 13.73 4.69 12.32 4.68C10.91 4.68 9.58 4.93 8.39 5.46C7.2 6 6.6 7.17 6.6 8.93C6.6 9.95 6.75 10.89 7.06 11.76C7.37 12.62 7.81 13.42 8.37 14.14C8.94 14.86 9.6 15.49 10.37 16.04C11.14 16.58 12 16.86 12.91 16.86C13.83 16.86 14.69 16.58 15.46 16.03C16.23 15.48 16.9 14.86 17.46 14.14C18.03 13.42 18.46 12.62 18.78 11.76C19.09 10.89 19.24 9.96 19.24 8.93C19.24 7.17 18.63 6 17.46 5.46H16.24ZM19.21 20.15C20.23 18.84 21.01 17.25 21.53 15.4C22.05 13.54 22.32 11.58 22.32 9.5C22.32 7.42 21.35 5.76 19.42 4.5C17.5 3.25 15.05 2.62 12.08 2.62C9.11 2.62 6.66 3.25 4.74 4.5C2.81 5.75 1.84 7.42 1.84 9.5C1.84 11.58 2.1 13.54 2.62 15.4C3.14 17.25 3.92 18.84 4.95 20.15L2.87 22.38L9.28 21.26L12 24L14.67 21.26L21.08 22.38L19.21 20.15Z" />
            </svg>
            Continue with Apple
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {}}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
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
