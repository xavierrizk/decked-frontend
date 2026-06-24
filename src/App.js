import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import API_URL from './api';
import Home              from './pages/Home';
import ArtistProfilePage  from './pages/DJProfile';
import SetDetail         from './pages/SetDetail';
import RateSet           from './pages/RateSet';
import EnhancedRateSet   from './pages/EnhancedRateSet';
import Login             from './pages/Login';
import Signup            from './pages/Signup';
import CreateDJ          from './pages/CreateDJ';
import CreateSet         from './pages/CreateSet';
import ProfilePage       from './pages/ProfilePage';
import EditProfile       from './pages/EditProfile';
import FeedPage          from './pages/FeedPage';
import TrendingPage      from './pages/TrendingPage';
import NotificationsPage from './pages/NotificationsPage';
import SearchPage              from './pages/SearchPage';
import DiscoveryPage           from './pages/DiscoveryPage';
import AdminDashboard          from './pages/AdminDashboard';
import VerificationRequestPage from './pages/VerificationRequestPage';
import RequestDJPage           from './pages/RequestDJPage';
import MyDJsPage               from './pages/MyDJsPage';
import Navbar            from './components/Navbar';
import PageWrapper       from './components/PageWrapper';
import AnnouncementsBanner from './components/AnnouncementsBanner';
import EmailVerificationBanner from './components/EmailVerificationBanner';
import OnboardingFlow from './components/OnboardingFlow';
import VerifyEmailPage    from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage       from './pages/NotFoundPage';
import ErrorPage          from './pages/ErrorPage';
import HelpPage           from './pages/HelpPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';
import ConcertsPage       from './pages/ConcertsPage';
import FestivalsPage      from './pages/FestivalsPage';
import ConcertArtistPage  from './pages/ArtistProfile';
import EditArtistProfile  from './pages/EditArtistProfile';
import VenuesPage         from './pages/VenuesPage';
import VenueDetail        from './pages/VenueDetail';
import ArtistsPage        from './pages/ArtistsPage';
import SetsPage           from './pages/SetsPage';
import ReviewsFeedPage    from './pages/ReviewsFeedPage';
import ActivityFeedPage   from './pages/ActivityFeedPage';

// Inner component that can use useNavigate (must be inside <Router>)
function AppInner({ isLoggedIn, setIsLoggedIn }) {
  const [banInfo, setBanInfo]           = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  // Check onboarding status every time login state changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setShowOnboarding(false); return; }
    axios.get(`${API_URL}/api/auth/onboarding-status`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => {
      setShowOnboarding(!r.data.onboarding_completed);
    }).catch(() => {});
  }, [isLoggedIn]);

  // Check ban status
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${API_URL}/api/user/is-banned`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => {
      if (r.data.banned) setBanInfo(r.data.ban);
    }).catch(() => {});
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setBanInfo(null);
    setShowOnboarding(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    navigate('/');
  };

  const Protected = ({ children }) =>
    isLoggedIn ? children : <Navigate to="/login" />;

  return (
    <>
      <div className="animated-bg" />
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <AnnouncementsBanner />
        <EmailVerificationBanner />
{banInfo && (
          <div className="bg-red-900/60 border-b border-red-500/40 px-4 py-2 text-center">
            <p className="text-red-200 text-sm font-semibold">
              Your account has been banned: <span className="text-red-100">{banInfo.reason}</span>
              {banInfo.expires_at && <span className="text-red-300"> · Expires {new Date(banInfo.expires_at).toLocaleDateString()}</span>}
            </p>
          </div>
        )}
        <main className="flex-1">
          <PageWrapper>
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/trending"       element={<TrendingPage />} />
              <Route path="/concerts"       element={<ConcertsPage />} />
              <Route path="/festivals"      element={<FestivalsPage />} />
              <Route path="/sets"           element={<SetsPage />} />
              <Route path="/reviews"        element={<ReviewsFeedPage />} />
              <Route path="/friends"        element={<ActivityFeedPage />} />
              <Route path="/artists"        element={<ArtistsPage />} />
              <Route path="/venues"         element={<VenuesPage />} />
              <Route path="/venues/:id"     element={<VenueDetail />} />
              <Route path="/search"         element={<SearchPage />} />
              <Route path="/discover"       element={<DiscoveryPage />} />
              <Route path="/verification"   element={<Protected><VerificationRequestPage /></Protected>} />
              <Route path="/admin"          element={<Protected><AdminDashboard /></Protected>} />
              <Route path="/request-artist"  element={<Protected><RequestDJPage /></Protected>} />
              <Route path="/my-artists"      element={<Protected><MyDJsPage /></Protected>} />
              <Route path="/artist/:id"      element={<ArtistProfilePage />} />
              <Route path="/artist/:id/edit" element={<Protected><EditArtistProfile /></Protected>} />
              <Route path="/concert-artist/:id" element={<ConcertArtistPage />} />
              <Route path="/set/:id"        element={<SetDetail />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/rate/:setId"    element={<Protected><RateSet /></Protected>} />
              <Route path="/review/set/:setId" element={<Protected><EnhancedRateSet /></Protected>} />
              <Route path="/create-artist"   element={<Protected><CreateDJ /></Protected>} />
              <Route path="/create-set"     element={<Protected><CreateSet /></Protected>} />
              <Route path="/profile/edit"   element={<Protected><EditProfile /></Protected>} />
              <Route path="/feed"           element={<Protected><FeedPage /></Protected>} />
              <Route path="/notifications"  element={<Protected><NotificationsPage /></Protected>} />
              <Route path="/login"          element={<Login  setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/signup"         element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/verify-email"   element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password"  element={<ResetPasswordPage />} />
              <Route path="/help"            element={<HelpPage />} />
              <Route path="/error"           element={<ErrorPage />} />
              <Route path="*"               element={<NotFoundPage />} />
            </Routes>
          </PageWrapper>
        </main>
      </div>
    </>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  return (
    <Router>
      <AppInner isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
}

export default App;
