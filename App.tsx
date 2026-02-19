import React, { useState, useEffect } from 'react';
import { PublicForm } from './components/PublicForm';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { getSession } from './services/mockBackend';
import { AdminUser } from './types';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';

// Simple Layout for public pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">iL</div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">iLand<span className="text-primary-600">Spaces</span></span>
        </div>
        <nav className="flex gap-4 text-sm font-medium">
             <Link to="/" className="text-gray-600 hover:text-primary-600">Home</Link>
             <Link to="/admin" className="text-gray-600 hover:text-primary-600">Admin</Link>
        </nav>
      </div>
    </header>
    <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
      {children}
    </main>
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} iLandSpaces. All rights reserved.</p>
        <p className="text-xs mt-2 text-gray-600">Secure Real Estate CRM System</p>
      </div>
    </footer>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const session = getSession();
  if (!session) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// Main App Structure
const AppContent: React.FC = () => {
    const [user, setUser] = useState<AdminUser | null>(getSession());
    const location = useLocation();

    // Check session on mount
    useEffect(() => {
        setUser(getSession());
    }, [location]);

    return (
        <Routes>
            <Route path="/" element={
                <PublicLayout>
                    <div className="text-center mb-10">
                         <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Customer Requirement Checklist</h1>
                         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Whether you're looking for a gated community or a standalone home, tell us what you need and we'll find it for you.
                         </p>
                    </div>
                    <PublicForm />
                </PublicLayout>
            } />
            
            <Route path="/admin" element={
                user ? <Navigate to="/dashboard" replace /> : (
                    <PublicLayout>
                        <AdminLogin onLogin={(u) => {
                            setUser(u); 
                            // Force navigation to dashboard
                            window.location.hash = '#/dashboard';
                        }} />
                    </PublicLayout>
                )
            } />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <HashRouter>
        <AppContent />
    </HashRouter>
  );
};

export default App;