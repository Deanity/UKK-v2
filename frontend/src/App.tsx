import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AdminStudents from "@/pages/admin/Students";
import AdminTeachers from "@/pages/admin/Teachers";
import AdminViolationTypes from "@/pages/admin/ViolationTypes";
import AdminLetters from "@/pages/admin/Letters";
import AdminReports from "@/pages/admin/Reports";
import BKViolations from "@/pages/bk/Violations";
import BKLetters from "@/pages/bk/Letters";
import GuruInput from "@/pages/guru/InputViolation";
import SiswaProfile from "@/pages/siswa/Profile";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/admin/students" element={<Layout><AdminStudents /></Layout>} />
            <Route path="/admin/teachers" element={<Layout><AdminTeachers /></Layout>} />
            <Route path="/admin/violation-types" element={<Layout><AdminViolationTypes /></Layout>} />
            <Route path="/admin/letters" element={<Layout><AdminLetters /></Layout>} />
            <Route path="/admin/reports" element={<Layout><AdminReports /></Layout>} />
            <Route path="/bk/violations" element={<Layout><BKViolations /></Layout>} />
            <Route path="/bk/letters" element={<Layout><BKLetters /></Layout>} />
            <Route path="/guru/input" element={<Layout><GuruInput /></Layout>} />
            <Route path="/siswa/profile" element={<Layout><SiswaProfile /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
