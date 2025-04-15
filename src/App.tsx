
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MemoDetailPage from "./pages/MemoDetailPage";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => {
  // Simple check for if user is signed in
  // In a real app, would use a more sophisticated auth system
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Index />
            } />
            <Route path="/onboarding" element={
              isAuthenticated ? <Navigate to="/home" replace /> : <Onboarding />
            } />
            <Route path="/home" element={<HomePage />} />
            <Route path="/memo/:id" element={<MemoDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
