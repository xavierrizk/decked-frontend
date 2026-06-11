import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import DJProfile from './pages/DJProfile';
import SetDetail from './pages/SetDetail';
import RateSet from './pages/RateSet';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import CreateDJ from './pages/CreateDJ';
import CreateSet from './pages/CreateSet';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import PageWrapper from './components/PageWrapper';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      {/* Animated background — sits behind everything */}
      <div className="animated-bg" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <main className="flex-1">
          <PageWrapper>
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/dj/:id"      element={<DJProfile />} />
              <Route path="/set/:id"     element={<SetDetail />} />
              <Route path="/rate/:setId" element={isLoggedIn ? <RateSet />    : <Navigate to="/login" />} />
              <Route path="/create-dj"   element={isLoggedIn ? <CreateDJ />   : <Navigate to="/login" />} />
              <Route path="/create-set"  element={isLoggedIn ? <CreateSet />  : <Navigate to="/login" />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/profile/edit"  element={isLoggedIn ? <EditProfile /> : <Navigate to="/login" />} />
              <Route path="/login"          element={<Login   setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/signup"         element={<Signup  setIsLoggedIn={setIsLoggedIn} />} />
            </Routes>
          </PageWrapper>
        </main>
      </div>
    </Router>
  );
}

export default App;
