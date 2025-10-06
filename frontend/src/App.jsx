import React, { useEffect, useState } from 'react';
import { getSelectedCompany } from './utils/company';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Login from './components/Login';
import DashboardPage from './pages/Dashboard';
import SuperAdminPage from './pages/SuperAdmin';
import Sidebar from './components/Sidebar';
import CompanyList from './components/CompanyList';
import UserList from './components/UserList';
import EmployeeList from './components/EmployeeList';
import EmployeeDetail from './components/EmployeeDetail';
import PaymentList from './components/PaymentList';
import PayRunList from './components/PayRunList';
import PaySlipList from './components/PaySlipList';
import PaySlipDetail from './components/PaySlipDetail';
import PaySlipsCashier from './pages/PaySlipsCashier';
import AttendancePage from './pages/AttendancePage';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  if (!token) return <Navigate to="/" />;
  if (role && userRole !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  // Remove dynamic company color/logo/name. Use static green/white/black palette.

  const userEmail = localStorage.getItem('email');
  const userRole = localStorage.getItem('role');
  const avatar = userEmail ? userEmail[0].toUpperCase() : (userRole ? userRole[0] : 'U');
  const displayName = userEmail || userRole || '';

  // Couleur dynamique selon l'entreprise sélectionnée
  const [companyColor, setCompanyColor] = useState('#22c55e');
  useEffect(() => {
    const updateColor = () => {
      const c = getSelectedCompany();
      setCompanyColor(c?.color || '#22c55e');
    };
    window.addEventListener('storage', updateColor);
    updateColor();
    return () => window.removeEventListener('storage', updateColor);
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Login />} />

        {/* Route avec header global partout */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-2xl border-2" style={{ color: companyColor, borderColor: companyColor }}>
                      {avatar}
                    </div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <DashboardPage />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/superadmin"
          element={
            <PrivateRoute role="SUPER_ADMIN">
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }} >P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <SuperAdminPage />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <PrivateRoute role="SUPER_ADMIN">
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }} >P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <CompanyList />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }} >P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <UserList />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/employees"
          element={
            userRole === "SUPER_ADMIN" ? <Navigate to="/companies" replace /> :
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }} >P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <EmployeeList />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            userRole === "SUPER_ADMIN" ? <Navigate to="/companies" /> :
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }} >P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <EmployeeDetail />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/payments"
          element={
            userRole === "SUPER_ADMIN" ? <Navigate to="/companies" replace /> :
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }}>P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <PaymentList />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            userRole === "SUPER_ADMIN" ? <Navigate to="/companies" replace /> :
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }}>P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <AttendancePage />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/payruns"
          element={
            userRole === "SUPER_ADMIN" ? <Navigate to="/companies" replace /> :
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }}>P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <PayRunList />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/payruns/:id/payslips"
          element={
            userRole === "SUPER_ADMIN" ? <Navigate to="/companies" replace /> :
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }}>P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <PaySlipList />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/payslips/:id"
          element={
            userRole === "SUPER_ADMIN" ? <Navigate to="/companies" replace /> :
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }}>P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    <PaySlipDetail />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/payslips"
          element={
            userRole === "SUPER_ADMIN" ? <Navigate to="/companies" replace /> :
            <PrivateRoute>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 bg-white">
                  <header className="flex items-center gap-3 px-8 py-7 fixed top-0 left-60 right-0 z-40 shadow" style={{minHeight:'72px', background: companyColor}}>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-2xl" style={{ color: companyColor }}>P</div>
                    <div className="flex flex-col ml-2">
                      <span className="text-lg font-bold text-black">{displayName}</span>
                      <span className="text-xs text-white font-semibold uppercase tracking-wide">{userRole}</span>
                    </div>
                  </header>
                  <div className="p-4" style={{marginTop:'72px'}}>
                    {(() => {
                      console.log('Rendering payslips route, userRole:', userRole);
                      return userRole === 'CASHIER' ? <PaySlipsCashier /> : <Navigate to="/dashboard" replace />;
                    })()}
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
export default App;
