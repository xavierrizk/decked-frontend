import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dj/:id" element={<DJProfile />} />
          <Route path="/set/:id" element={<SetDetail />} />
          <Route path="/rate/:setId" element={isLoggedIn ? <RateSet /> : <Navigate to="/login" />} />
          <Route path="/create-dj" element={isLoggedIn ? <CreateDJ /> : <Navigate to="/login" />} />
          <Route path="/create-set" element={isLoggedIn ? <CreateSet /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
