import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, Plus, Sparkles, AlertCircle, Compass, HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Compare({ user, onLogout }) {
  const navigate = useNavigate();
  const [compareList, setCompareList] = useState([]);
  
  // Search state for adding a bike
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('compareList') || '[]');
    setCompareList(list);
  }, []);

  const handleRemove = (bikeId) => {
    const updated = compareList.filter(b => b._id !== bikeId);
    setCompareList(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
  };

  const handleAddBike = (bike) => {
    if (compareList.some(b => b._id === bike._id)) {
      setSearchOpen(false);
      return;
    }
    if (compareList.length >= 3) {
      alert("You can compare up to 3 motorcycles at a time. Please remove one first.");
      return;
    }
    const updated = [...compareList, bike];
    setCompareList(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Search bikes to add
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await axios.get(`/api/bikes?search=${searchQuery}&limit=5`);
        setSearchResults(res.data.bikes || []);
      } catch (err) {
        console.error('Error searching bikes:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Utility to determine the 'best' value to highlight
  const getBestValue = (key, type = 'high') => {
    if (compareList.length < 2) return null;
    const values = compareList.map(b => b[key]);
    if (type === 'high') {
      const max = Math.max(...values);
      return max;
    } else {
      const min = Math.min(...values);
      return min;
    }
  };

  const bestPrice = getBestValue('price', 'low');
  const bestMileage = getBestValue('mileage', 'high');
  const bestTopSpeed = getBestValue('topSpeed', 'high');
  const bestCC = getBestValue('engineCC', 'high');
  const bestReliability = getBestValue('reliabilityScore', 'high');

  return (
    <div className="min-h-screen bg-darker pb-20 text-white font-sans relative">
      <Navbar user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {compareList.length < 3 && (
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl transition duration-300 text-xs font-bold uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Add Motorcycle</span>
            </button>
          )}
        </div>

        {/* Heading */}
        <div className="space-y-1.5 text-left">
          <h1 className="text-2xl font-black text-white flex items-center space-x-2">
            <span>Motorcycle Comparison</span>
          </h1>
          <p className="text-xs text-gray-400">Side-by-side analysis of key technical specifications, fuel efficiency, and ratings.</p>
        </div>

        {/* Empty state */}
        {compareList.length === 0 ? (
          <div className="bg-dark/40 border border-gray-800 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-6">
            <Compass className="w-12 h-12 text-gray-600 mx-auto" />
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-white">Your Comparison list is Empty</h3>
              <p className="text-sm text-gray-400">Add up to 3 motorcycles from the recommendation results or the catalog to start comparing specs.</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
            >
              Explore Motorcycles
            </button>
          </div>
        ) : (
          <div className="bg-dark border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Horizontal Scroll wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[700px] border-collapse text-left">
                {/* Headers */}
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="w-1/4 p-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Specifications</th>
                    {compareList.map(bike => (
                      <th key={bike._id} className="p-6 relative group">
                        {/* Remove Action */}
                        <button
                          onClick={() => handleRemove(bike._id)}
                          className="absolute top-4 right-4 p-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 rounded-lg border border-red-500/10 hover:border-red-500/30 transition duration-300"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{bike.brand}</span>
                          <h4 className="font-bold text-base text-white leading-tight">{bike.bikeName}</h4>
                          <span className="inline-block bg-gray-800 text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-gray-700">
                            {bike.categories[0]}
                          </span>
                        </div>
                      </th>
                    ))}
                    {/* Placeholder columns if < 3 */}
                    {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                      <th key={idx} className="p-6 text-center">
                        <button
                          onClick={() => setSearchOpen(true)}
                          className="mx-auto w-12 h-12 rounded-full border border-dashed border-gray-700 hover:border-primary flex items-center justify-center text-gray-500 hover:text-primary transition-all duration-300 group"
                        >
                          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                        <span className="text-xs text-gray-500 block mt-2">Compare Another</span>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body Rows */}
                <tbody className="divide-y divide-gray-850 text-sm">
                  {/* Price */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Ex-Showroom Price</td>
                    {compareList.map(bike => {
                      const isBest = bike.price === bestPrice;
                      return (
                        <td key={bike._id} className="p-6 font-bold">
                          <span className={isBest ? 'text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/15' : 'text-white'}>
                            ₹{bike.price.toLocaleString()}
                          </span>
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Engine displacement */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Engine Displacement</td>
                    {compareList.map(bike => {
                      const isBest = bike.engineCC === bestCC;
                      return (
                        <td key={bike._id} className={`p-6 font-bold ${isBest ? 'text-primary' : 'text-white'}`}>
                          {bike.engineCC} cc
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Mileage */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Fuel Economy (Mileage)</td>
                    {compareList.map(bike => {
                      const isBest = bike.mileage === bestMileage;
                      return (
                        <td key={bike._id} className="p-6 font-bold">
                          <span className={isBest ? 'text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/15' : 'text-white'}>
                            {bike.mileage} km/l
                          </span>
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Top Speed */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Top Speed</td>
                    {compareList.map(bike => {
                      const isBest = bike.topSpeed === bestTopSpeed;
                      return (
                        <td key={bike._id} className={`p-6 font-bold ${isBest ? 'text-amber-400' : 'text-white'}`}>
                          {bike.topSpeed} km/h
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Reliability */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Reliability Rating</td>
                    {compareList.map(bike => {
                      const isBest = bike.reliabilityScore === bestReliability;
                      return (
                        <td key={bike._id} className="p-6 font-bold">
                          <span className={isBest ? 'text-emerald-400' : 'text-white'}>
                            {bike.reliabilityScore} / 10
                          </span>
                        </td>
                      );
                    })}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Transmission */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Transmission Type</td>
                    {compareList.map(bike => (
                      <td key={bike._id} className="p-6 font-medium text-white">{bike.transmission}</td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Fuel Type */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Fuel Type</td>
                    {compareList.map(bike => (
                      <td key={bike._id} className="p-6 font-medium text-white">{bike.fuelType}</td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Weight */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Kerb Weight</td>
                    {compareList.map(bike => (
                      <td key={bike._id} className="p-6 font-bold text-white">{bike.weight} kg</td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Seat Height */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Seat Height</td>
                    {compareList.map(bike => (
                      <td key={bike._id} className="p-6 font-bold text-white">{bike.seatHeight} mm</td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Resale Demand */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Resale Demand</td>
                    {compareList.map(bike => (
                      <td key={bike._id} className="p-6 font-bold text-white">{bike.resaleValue}</td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Beginner Friendly */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Beginner Friendly</td>
                    {compareList.map(bike => (
                      <td key={bike._id} className="p-6 font-bold text-white">{bike.beginnerFriendly ? 'Yes' : 'No'}</td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Features */}
                  <tr>
                    <td className="p-6 font-semibold text-gray-400 bg-gray-900/10">Highlight Technology</td>
                    {compareList.map(bike => (
                      <td key={bike._id} className="p-6">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {bike.features.slice(0, 4).map((f, index) => (
                            <span key={index} className="bg-gray-900 text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded border border-gray-800">
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>

                  {/* Action */}
                  <tr className="bg-gray-950/20">
                    <td className="p-6"></td>
                    {compareList.map(bike => (
                      <td key={bike._id} className="p-6">
                        <button
                          onClick={() => navigate(`/bikes/${bike._id}`)}
                          className="w-full py-2.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition duration-300 flex items-center justify-center space-x-1"
                        >
                          <span>Full Specifications</span>
                        </button>
                      </td>
                    ))}
                    {Array.from({ length: 3 - compareList.length }).map((_, i) => <td key={i} className="p-6"></td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Bike Overlay Modal */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-lg bg-dark border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="font-bold text-base text-white">Compare Another Motorcycle</h3>
                  <button 
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="text-gray-400 hover:text-white font-medium text-xs uppercase"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search by model or brand (e.g. Splendor, Hunter)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
                    autoFocus
                  />
                  
                  {searchLoading && (
                    <div className="text-center py-4 text-xs text-gray-500 font-medium animate-pulse">Searching catalog...</div>
                  )}

                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-850">
                    {searchResults.map(bike => (
                      <button
                        key={bike._id}
                        onClick={() => handleAddBike(bike)}
                        className="w-full text-left py-3 px-3 hover:bg-gray-900 transition flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-primary uppercase block">{bike.brand}</span>
                          <span className="text-sm font-extrabold text-white">{bike.bikeName}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-400">₹{bike.price.toLocaleString()}</span>
                      </button>
                    ))}

                    {!searchLoading && searchQuery.trim() !== '' && searchResults.length === 0 && (
                      <div className="text-center py-6 text-xs text-gray-500 font-medium">No results found matching "{searchQuery}"</div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
