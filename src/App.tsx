
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MemoDetailPage from "./pages/MemoDetailPage";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import Index from "./pages/Index";

// Authentication wrapper component
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to the root page, but save where the user was trying to go
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Default route that checks authentication and redirects accordingly */}
            <Route path="/" element={<Index />} />
            
            {/* Onboarding route - only accessible if not authenticated */}
            <Route 
              path="/onboarding" 
              element={
                localStorage.getItem('isAuthenticated') === 'true' 
                  ? <Navigate to="/home" replace /> 
                  : <Onboarding />
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/home" 
              element={
                <AuthRoute>
                  <HomePage />
                </AuthRoute>
              } 
            />
            
            <Route 
              path="/memo/:id" 
              element={
                <AuthRoute>
                  <MemoDetailPage />
                </AuthRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
