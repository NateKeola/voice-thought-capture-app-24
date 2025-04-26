
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get the intended destination from state, defaulting to '/home'
  const from = location.state?.from?.pathname || '/home';

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demo purposes, accept any email/password
    localStorage.setItem('isAuthenticated', 'true');
    toast({
      title: "Welcome back!",
      description: "You've successfully signed in."
    });
    
    // Navigate to the page they were trying to access
    navigate(from);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 px-6 pb-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-[#FF9500] to-[#F97316] flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1 font-montserrat">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">Sign in to continue to Memo</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-12"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#FF9500] hover:bg-[#FF9500]/90"
              disabled={!email || !password}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              className="text-sm text-muted-foreground hover:underline"
              onClick={() => navigate('/onboarding')}
            >
              Don't have an account? <span className="text-[#FF9500] font-medium">Sign up</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
