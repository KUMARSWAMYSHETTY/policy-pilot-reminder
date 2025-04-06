
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import CustomerForm from "./pages/CustomerForm";
import CustomerDetail from "./pages/CustomerDetail";
import Policies from "./pages/Policies";
import PolicyForm from "./pages/PolicyForm";
import PolicyDetail from "./pages/PolicyDetail";
import Reminders from "./pages/Reminders";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { getTodayReminders } from "./utils/storage";
import { toast } from "sonner";
import { Bell } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Check for reminders when app loads
    const todayReminders = getTodayReminders();
    if (todayReminders.length > 0) {
      toast(
        <div className="flex items-center">
          <Bell className="mr-2 text-insurance-blue" />
          <span>You have {todayReminders.length} payment reminders today!</span>
        </div>
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Customer Routes */}
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/edit/:id" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            
            {/* Policy Routes */}
            <Route path="/policies" element={<Policies />} />
            <Route path="/policies/new/:customerId" element={<PolicyForm />} />
            <Route path="/policies/edit/:id" element={<PolicyForm />} />
            <Route path="/policies/:id" element={<PolicyDetail />} />
            
            {/* Reminder and Calendar Routes */}
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/calendar" element={<Calendar />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
