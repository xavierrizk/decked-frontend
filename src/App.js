import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import API_URL from './api';
import Home              from './pages/Home';
import DJProfile         from './pages/DJProfile';
import SetDetail         from './pages/SetDetail';
import RateSet           from './pages/RateSet';
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [banInfo, setBanInfo] = useState(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  // Check ban status on mount if logged in
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
  };

  const Protected = ({ children }) =>
    isLoggedIn ? children : <Navigate to="/login" />;

  return (
    <Router>
      <div className="animated-bg" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <AnnouncementsBanner />
        {banInfo && (
          <div className="bg-red-900/60 border-b border-red-500/40 px-4 py-3 text-center">
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
              <Route path="/search"         element={<SearchPage />} />
              <Route path="/discover"       element={<DiscoveryPage />} />
              <Route path="/verification"   element={<Protected><VerificationRequestPage /></Protected>} />
              <Route path="/admin"          element={<Protected><AdminDashboard /></Protected>} />
              <Route path="/request-dj"     element={<Protected><RequestDJPage /></Protected>} />
              <Route path="/my-djs"         element={<Protected><MyDJsPage /></Protected>} />
              <Route path="/dj/:id"         element={<DJProfile />} />
              <Route path="/set/:id"        element={<SetDetail />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/rate/:setId"    element={<Protected><RateSet /></Protected>} />
              <Route path="/create-dj"      element={<Protected><CreateDJ /></Protected>} />
              <Route path="/create-set"     element={<Protected><CreateSet /></Protected>} />
              <Route path="/profile/edit"   element={<Protected><EditProfile /></Protected>} />
              <Route path="/feed"           element={<Protected><FeedPage /></Protected>} />
              <Route path="/notifications"  element={<Protected><NotificationsPage /></Protected>} />
              <Route path="/login"          element={<Login  setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/signup"         element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
            </Routes>
          </PageWrapper>
        </main>
      </div>
    </Router>
  );
}

export default App;
