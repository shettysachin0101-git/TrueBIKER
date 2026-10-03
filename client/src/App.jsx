import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BikeDetails from './pages/BikeDetails';
import Compare from './pages/Compare';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    // Set headers for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      const res = await axios.get('/api/auth/user');
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-darker text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-400 font-medium">Igniting engines...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-darker text-white">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <Home />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={fetchUser} />} 
          />

          {/* Authenticated User Routes */}
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={handleLogout} onUpdateUser={fetchUser} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/bikes/:id" 
            element={user ? <BikeDetails user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/compare" 
            element={user ? <Compare user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/favorites" 
            element={user ? <Favorites user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              user && user.role === 'admin' ? (
                <AdminDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
