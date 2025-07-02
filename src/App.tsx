
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MemosPage from "./pages/MemosPage";
import RelationshipsPage from "./pages/RelationshipsPage";
import MemoDetailPage from "./pages/MemoDetailPage";
import FollowUpsPage from "./pages/FollowUpsPage";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import AuthPage from "./pages/AuthPage";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import TasksPage from "./pages/TasksPage";
import AuthGuard from "./components/AuthGuard";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { MemoProvider } from "./contexts/MemoContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProfileProvider>
          <MemoProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/home" element={<AuthGuard><HomePage /></AuthGuard>} />
                <Route path="/memos" element={<AuthGuard><MemosPage /></AuthGuard>} />
                <Route path="/tasks" element={<AuthGuard><TasksPage /></AuthGuard>} />
                <Route path="/relationships" element={<AuthGuard><RelationshipsPage /></AuthGuard>} />
                <Route path="/follow-ups" element={<AuthGuard><FollowUpsPage /></AuthGuard>} />
                <Route path="/memo/:id" element={<AuthGuard><MemoDetailPage /></AuthGuard>} />
                <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </MemoProvider>
        </UserProfileProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
