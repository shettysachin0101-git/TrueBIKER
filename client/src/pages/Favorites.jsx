import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Heart, Info, GitCompare, Sparkles, Flame, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Favorites({ user, onLogout }) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('/api/bikes/favorites/all');
      setFavorites(res.data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleUnfavorite = async (bikeId) => {
    try {
      await axios.delete(`/api/bikes/${bikeId}/favorite`);
      // Update UI state immediately
      setFavorites(prev => prev.filter(b => b._id !== bikeId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const handleAddToCompare = (bike) => {
    let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    if (!compareList.some(b => b._id === bike._id)) {
      if (compareList.length >= 3) {
        compareList.shift();
      }
      compareList.push(bike);
      localStorage.setItem('compareList', JSON.stringify(compareList));
    }
    navigate('/compare');
  };

  return (
    <div className="min-h-screen bg-darker pb-20 text-white font-sans relative">
      <Navbar user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Navigation */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        {/* Heading */}
        <div className="space-y-1.5 text-left">
          <h1 className="text-2xl font-black text-white flex items-center space-x-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>Saved Motorcycles</span>
          </h1>
          <p className="text-xs text-gray-400 font-medium">Keep track of your favorite models, compare specifications, and monitor availability.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            <span className="text-gray-500 text-sm font-medium">Retrieving saved bikes...</span>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-dark/40 border border-gray-800 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-6">
            <Heart className="w-12 h-12 text-gray-700 mx-auto" />
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-white">No Saved Motorcycles</h3>
              <p className="text-sm text-gray-400">Your favorite motorcycles will appear here. Click the heart icon on any recommendation card or catalog page to save models.</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
            >
              Explore Motorcycles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(bike => (
              <div 
                key={bike._id} 
                className="bg-dark border border-gray-800 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] rounded-3xl overflow-hidden flex flex-col transition-all duration-300 group"
              >
                {/* Image Section */}
                <div className="relative h-48 bg-gray-900 overflow-hidden flex items-center justify-center">
                  {bike.imageUrl ? (
                    <img 
                      src={bike.imageUrl} 
                      alt={bike.bikeName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.classList.add('fallback-gradient');
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 to-gray-850 flex items-center justify-center">
                      <Flame className="w-12 h-12 text-gray-800" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-darker/80 border border-gray-800/80 text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {bike.categories.join(' • ')}
                  </div>

                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => handleUnfavorite(bike._id)}
                    className="absolute top-3 left-3 p-2 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-full border border-red-500/20 backdrop-blur-sm transition duration-300 shadow-md"
                    title="Remove from Saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{bike.brand}</span>
                    <h4 className="text-base font-extrabold text-white mt-1 leading-snug group-hover:text-primary transition-colors">{bike.bikeName}</h4>
                  </div>

                  {/* Spec summary grid */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-gray-950/60 border border-gray-900 rounded-2xl text-center">
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase font-bold block">Price</span>
                      <span className="text-xs font-extrabold text-white">₹{bike.price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase font-bold block">Engine</span>
                      <span className="text-xs font-extrabold text-white">{bike.engineCC} cc</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase font-bold block">Mileage</span>
                      <span className="text-xs font-extrabold text-white">{bike.mileage} km/l</span>
                    </div>
                  </div>

                  {/* Tech specs highlight list */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 block font-bold uppercase tracking-wider">Specs summary:</span>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-gray-400 font-medium">
                      <div>Top Speed: <span className="text-white font-semibold">{bike.topSpeed} km/h</span></div>
                      <div>Reliability: <span className="text-white font-semibold">{bike.reliabilityScore}/10</span></div>
                      <div>Transmission: <span className="text-white font-semibold">{bike.transmission}</span></div>
                      <div>Resale Demand: <span className="text-white font-semibold">{bike.resaleValue}</span></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/40">
                    <button
                      onClick={() => handleAddToCompare(bike)}
                      className="w-full py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-xl transition duration-305 text-[10px] font-bold flex items-center justify-center space-x-1"
                      title="Compare with similar bikes"
                    >
                      <GitCompare className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">Compare with similar bikes</span>
                    </button>
                    <button
                      onClick={() => navigate(`/bikes/${bike._id}`)}
                      className="w-full py-2 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white border border-primary/30 shadow-[0_0_12px_rgba(59,130,246,0.25)] rounded-full transition duration-300 text-xs font-extrabold flex items-center justify-center space-x-2"
                    >
                      <span>Know More</span>
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
