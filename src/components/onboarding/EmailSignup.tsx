
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Form validation schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface EmailSignupProps {
  onCreateAccount: (email: string, password: string) => void;
}

export const EmailSignup: React.FC<EmailSignupProps> = ({ onCreateAccount }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onCreateAccount(values.email, values.password);
  }

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
          <h1 className="text-2xl font-bold font-montserrat">Create Account</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-muted-foreground font-medium">Email</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          <Mail className="h-5 w-5" />
                        </div>
                        <Input 
                          placeholder="Enter your email" 
                          className="pl-10 h-14 rounded-2xl bg-muted border border-input"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-muted-foreground font-medium">Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Create a password" 
                          className="pl-10 h-14 rounded-2xl bg-muted border border-input pr-10"
                          {...field} 
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
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-muted-foreground font-medium">Confirm Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          <Lock className="h-5 w-5" />
                        </div>
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirm your password" 
                          className="pl-10 h-14 rounded-2xl bg-muted border border-input pr-10"
                          {...field} 
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
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-14 rounded-2xl bg-[#FF9500] hover:bg-[#FF9500]/90 shadow-sm text-base font-medium">
              Create Account
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-[#FF9500] font-medium hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-[#FF9500] font-medium hover:underline">Privacy Policy</a>
        </div>
      </CardContent>
    </Card>
  );
};
