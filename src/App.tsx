import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import UserDashboard from "./pages/user/UserDashboard";
import UserSchemes from "./pages/user/UserSchemes";
import UserPayments from "./pages/user/UserPayments";
import UserGrievances from "./pages/user/UserGrievances";
import UserEligibility from "./pages/user/UserEligibility";
import UserAssistant from "./pages/user/UserAssistant";
import UserHelp from "./pages/user/UserHelp";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isAdmin, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/user" replace />;
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* User Routes */}
      <Route path="/user" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/schemes" element={<ProtectedRoute><UserSchemes /></ProtectedRoute>} />
      <Route path="/user/payments" element={<ProtectedRoute><UserPayments /></ProtectedRoute>} />
      <Route path="/user/grievances" element={<ProtectedRoute><UserGrievances /></ProtectedRoute>} />
      <Route path="/user/eligibility" element={<ProtectedRoute><UserEligibility /></ProtectedRoute>} />
      <Route path="/user/assistant" element={<ProtectedRoute><UserAssistant /></ProtectedRoute>} />
      <Route path="/user/help" element={<ProtectedRoute><UserHelp /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
