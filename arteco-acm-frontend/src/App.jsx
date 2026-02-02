import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { ConfigProvider, Button, Result } from 'antd';
import { theme } from './config/theme';
import { ArtecoShell, AuthProvider, useAuth, LoginModal } from '@arteco/shared';
import Logo from './assets/White ARTECO logo.png';

// Import your existing pages
import Homepage from './components/Homepage.jsx';
import CollectionsList from './components/CollectionsList.jsx';
import CreateCollection from './components/CreateCollection.jsx';
import ArtworkList from './components/ArtworkList.jsx';
import ArtworkDetails from './components/ArtworkDetails.jsx';
import ArtistList from './components/ArtistList.jsx';
import ArtistDetails from './components/ArtistDetails.jsx';
import AppraisalList from './components/AppraisalList.jsx';
import AddAppraisal from './components/AddAppraisal.jsx';
import Profile from './components/Profile.jsx';
import AuditLogs from './components/AuditLogs.jsx';

// --- 1. THE NAVIGATION CONFIG ---
// This list defines the Top Banner Buttons.
const getAcmNavItems = (navigate) => [
  { 
    key: 'collections', 
    label: 'Collections', 
    onClick: () => navigate('/collections') 
  },
  { 
    key: 'artworks', 
    label: 'Artworks', 
    onClick: () => navigate('/artworks') 
  },
  { 
    key: 'artists', 
    label: 'Artists', 
    onClick: () => navigate('/artists') 
  },
  { 
    key: 'appraisals', 
    label: 'Appraisals', 
    onClick: () => navigate('/appraisals') 
  }
];

// --- 2. THE SHELL WRAPPER ---
// This wraps your pages in the Teal Sidebar/Banner
const AppShell = () => {
  const navigate = useNavigate();
  // Pass the navigation logic to the Shell
  const navItems = getAcmNavItems(navigate);

  return (
    <ArtecoShell 
      title="Collection Manager" 
      navItems={navItems}
      logoSrc={Logo}
    >
      <Outlet />
    </ArtecoShell>
  );
};

// --- 3. THE GATEKEEPER ---
// Forces Login if token is missing
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = React.useState(true);

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
        <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  return <Outlet />;
};

// --- 4. THE MAIN APP ---
function App() {
  return (
    <ConfigProvider theme={theme}>
      {/* Basename ensures all links work relative to /acm */}
      <BrowserRouter basename="/acm">
        <AuthProvider>
          <Routes>
            <Route element={<ProtectedRoute />}>
              
              {/* WRAPPED ROUTES (With Banner & Sidebar) */}
              <Route element={<AppShell />}>
                
                {/* Landing Tile Page */}
                <Route path="/home" element={<Homepage />} />
                
                {/* Feature Routes */}
                <Route path="/collections" element={<CollectionsList />} />
                <Route path="/collections/new" element={<CreateCollection />} />
                
                <Route path="/artworks" element={<ArtworkList />} />
                <Route path="/artwork/:id" element={<ArtworkDetails />} />
                
                <Route path="/artists" element={<ArtistList />} />
                <Route path="/artist/:id" element={<ArtistDetails />} />
                
                <Route path="/appraisals" element={<AppraisalList />} />
                <Route path="/add-appraisal" element={<AddAppraisal />} />
                
                <Route path="/profile" element={<Profile />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
              </Route>
              
              {/* FALLBACK REDIRECTS */}
              {/* If user goes to /acm/ or /acm/unknown, send to Home */}
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