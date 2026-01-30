import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ConfigProvider, Button, Result } from 'antd';
import { theme } from './config/theme';

// 🚀 MONOREPO REFACTOR: Use Shared Components!
// If this fails with "Module not found", we need to check your package.json
import { ArtecoShell, AuthProvider, useAuth, LoginModal } from '@arteco/shared';

// Import your existing pages
import Homepage from './components/Homepage.jsx';
import CollectionsList from './components/CollectionsList.jsx';
import ArtworkList from './components/ArtworkList.jsx';
import ArtworkDetails from './components/ArtworkDetails.jsx';
// ... other imports can remain ...

// 1. The Wrapper that forces the Sidebar (Shell)
const AppShell = () => {
  return (
    <ArtecoShell title="Collection Manager">
      <Outlet /> {/* This renders the child route (Homepage, ArtworkList, etc.) */}
    </ArtecoShell>
  );
};

// 2. The Gatekeeper
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(true); // Auto-open login if needed

  if (!isAuthenticated) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Result
          status="403"
          title="Authentication Required"
          subTitle="You need to sign in to access the Collection Manager."
          extra={
            <Button type="primary" onClick={() => setIsLoginOpen(true)}>
              Sign In
            </Button>
          }
        />
        {/* Uses the Shared Login Modal so you don't need a separate Login Page */}
        <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  return <Outlet />; // Renders the child routes if logged in
};

function App() {
  return (
    <ConfigProvider theme={theme}>
      {/* 3. The Router with the correct Base Path */}
      <BrowserRouter basename="/acm">
        <AuthProvider>
          <Routes>
            
            {/* PUBLIC ROUTES (If any) */}
            <Route path="/public" element={<div>Public Info</div>} />

            {/* PROTECTED ROUTES */}
            <Route element={<ProtectedRoute />}>
              
              {/* LAYOUT ROUTES (Wrapped in Blue Sidebar) */}
              <Route element={<AppShell />}>
                <Route path="/home" element={<Homepage />} />
                <Route path="/collections" element={<CollectionsList />} />
                <Route path="/artworks" element={<ArtworkList />} />
                <Route path="/artwork/:id" element={<ArtworkDetails />} />
                {/* Add other routes here */}
              </Route>
              
              {/* DEFAULT REDIRECT */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />

            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;