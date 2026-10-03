import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, LogOut, Sparkles, Layers, GitCompare, Heart, ShieldAlert } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItemClass = (path) => {
    return `flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
      isActive(path)
        ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
        : 'text-gray-400 hover:text-white border border-transparent hover:bg-gray-900/60'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-darker/80 border-b border-gray-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/30 group-hover:border-primary/60 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300">
            <Flame className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">
              TRUE<span className="text-primary font-black">BIKER</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Motorbike Intelligence</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap justify-center gap-2">
          <Link to="/dashboard" className={navItemClass('/dashboard')}>
            <Sparkles className="w-4 h-4" />
            <span>Recommendations</span>
          </Link>
          
          <Link to="/compare" className={navItemClass('/compare')}>
            <GitCompare className="w-4 h-4" />
            <span>Compare</span>
          </Link>
          
          <Link to="/favorites" className={navItemClass('/favorites')}>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            <span>Favorites</span>
          </Link>
          
          {user && user.role === 'admin' && (
            <Link to="/admin" className={navItemClass('/admin')}>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* User Info and Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-sm font-semibold text-white">Rider: {user?.name}</span>
            <span className="text-xs text-gray-400">{user?.role === 'admin' ? 'Administrator' : user?.email}</span>
          </div>
          
          <button 
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all duration-300 text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
