import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/DashboardStats";
import Attendance from "./pages/Attendance";
import LeaveRequest from "./pages/LeaveRequest";
import Projects from "./pages/Projects";
import Departments from "./pages/Departments";
import Payroll from "./pages/Payroll";
import Setting from "./components/Setting";
import Header from "./components/Header";
import Employees from "./pages/Employees";
import AdminLogin from "./pages/AdminLogin";
import { useAuth } from "./hooks/useAuth";
import Calendar from "./components/Calendar";
import EmployeePerfomance from "./components/EmployeePerfomance";
import ChatLayout from "./pages/Chat";

function App() {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop collapse

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Admin Login Route */}
        <Route
          path="/admin/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <AdminLogin />
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                {/* Sidebar */}
                <Sidebar
                  isSidebarOpen={isSidebarOpen}
                  isSidebarCollapsed={isSidebarCollapsed}
                  setIsSidebarOpen={setIsSidebarOpen}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                  {/* Header on top */}
                  <Header
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    toggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    isSidebarOpen={isSidebarOpen}
                  />

                  {/* Page Content */}
                  <div className="flex-1 p-6 bg-gray-100">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/employee" element={<Employees />} />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/leave" element={<LeaveRequest />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/departments" element={<Departments />} />
                      <Route path="/payroll" element={<Payroll />} />
                      <Route path="/employee-p" element={<EmployeePerfomance />} />
                      <Route path="/setting" element={<Setting />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/chat" element={<ChatLayout/>} />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;