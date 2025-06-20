
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User } from "lucide-react";

export const EmailSignup: React.FC<{ onCreateAccount: (email: string, password: string) => void }> = ({ 
  onCreateAccount 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignIn && password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isSignIn) {
        await signIn(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in."
        });
        // Navigate directly to home after successful sign in
        navigate('/home');
      } else {
        // Pass the first and last name to signUp function
        await signUp(email, password, firstName, lastName);
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account."
        });
        onCreateAccount(email, password);
      }
    } catch (error: any) {
      toast({
        title: isSignIn ? "Error signing in" : "Error creating account",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4 shadow-lg">
      <CardContent className="pt-6 px-6 pb-8">
        <div className="flex items-center mb-8">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="mr-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold font-montserrat">
            {isSignIn ? 'Sign In' : 'Create Account'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isSignIn && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm text-muted-foreground font-medium">First Name</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <Input 
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name" 
                    className="pl-10 h-14 rounded-2xl bg-muted border border-input"
                    required={!isSignIn}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm text-muted-foreground font-medium">Last Name</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <Input 
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name" 
                    className="pl-10 h-14 rounded-2xl bg-muted border border-input"
                    required={!isSignIn}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-muted-foreground font-medium">Email</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <Input 
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="pl-10 h-14 rounded-2xl bg-muted border border-input"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-muted-foreground font-medium">Password</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignIn ? "Enter your password" : "Create a password"}
                className="pl-10 h-14 rounded-2xl bg-muted border border-input pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {!isSignIn && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground font-medium">Confirm Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 h-14 rounded-2xl bg-muted border border-input pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-[#FF9500] hover:bg-[#FF9500]/90 shadow-sm text-base font-medium"
            disabled={!email || !password || (!isSignIn && !confirmPassword) || isLoading}
          >
            {isLoading ? (isSignIn ? "Signing In..." : "Creating Account...") : (isSignIn ? "Sign In" : "Create Account")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            className="text-sm text-muted-foreground hover:underline"
            onClick={() => setIsSignIn(!isSignIn)}
          >
            {isSignIn 
              ? "Don't have an account? " 
              : "Already have an account? "
            }
            <span className="text-[#FF9500] font-medium">
              {isSignIn ? "Sign up" : "Sign in"}
            </span>
          </button>
        </div>

        {!isSignIn && (
          <div className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-[#FF9500] font-medium hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-[#FF9500] font-medium hover:underline">Privacy Policy</a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
