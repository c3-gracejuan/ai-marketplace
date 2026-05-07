/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React, { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SideNav from './components/SideNav/SideNav';
import ErrorReporterProvider from './components/ErrorBoundary/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import BrowseSolutionsPage from './pages/BrowseSolutionsPage';
import SolutionDetailPage from './pages/SolutionDetailPage';
import SubmitRequestPage from './pages/SubmitRequestPage';
import RequestsPage from './pages/RequestsPage';
import TeamPage from './pages/TeamPage';
import AdminTriagePage from './pages/AdminTriagePage';
import { PermissionsProvider, usePermissions } from './hooks/usePermissions';

if (import.meta.env.MODE === 'development') {
  const authToken = import.meta.env.VITE_C3_AUTH_TOKEN;
  if (authToken) document.cookie = `c3auth=${authToken}`;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = usePermissions();
  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <PermissionsProvider>
      <ErrorReporterProvider>
        <div className="h-screen flex max-w-full overflow-hidden">
          <SideNav />
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/solutions" element={<BrowseSolutionsPage />} />
                <Route path="/solutions/:id" element={<SolutionDetailPage />} />
                <Route path="/submit" element={<SubmitRequestPage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminTriagePage />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
      </ErrorReporterProvider>
    </PermissionsProvider>
  );
}
