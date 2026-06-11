import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
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
import Navbar            from './components/Navbar';
import PageWrapper       from './components/PageWrapper';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const Protected = ({ children }) =>
    isLoggedIn ? children : <Navigate to="/login" />;

  return (
    <Router>
      <div className="animated-bg" />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <main className="flex-1">
          <PageWrapper>
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/trending"       element={<TrendingPage />} />
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
