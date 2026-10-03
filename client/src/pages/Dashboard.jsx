import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Sliders, 
  Check, 
  Flame, 
  DollarSign, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles,
  Layers,
  CheckSquare,
  ChevronsRight,
  Filter,
  Bike,
  Fuel,
  Cpu,
  Zap,
  ShieldCheck,
  Timer,
  Heart,
  GitCompare,
  ArrowRight,
  UserCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
  Compass
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Dashboard({ user, onLogout, onUpdateUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' or 'catalog'
  
  // Questionnaire state (pre-filled with user preferences if they exist)
  const [preferences, setPreferences] = useState({
    ridingTypes: user.preferences?.ridingTypes || [],
    budgetMin: user.preferences?.budgetMin !== undefined ? user.preferences.budgetMin : 50000,
    budgetMax: user.preferences?.budgetMax !== undefined ? user.preferences.budgetMax : 500000,
    brands: user.preferences?.brands || [],
    features: user.preferences?.features || [],
    beginnerFriendly: user.preferences?.beginnerFriendly || false,
    resaleValue: user.preferences?.resaleValue || 'Any',
    comfortImportance: user.preferences?.comfortImportance || false,
    mileageImportance: user.preferences?.mileageImportance || false,
    reliabilityImportance: user.preferences?.reliabilityImportance || false
  });

  // Flow control: Show preference configuration wizard or match results
  const [showWizard, setShowWizard] = useState(
    !user.preferences || !user.preferences.ridingTypes || user.preferences.ridingTypes.length === 0
  );

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Catalog server-side state
  const [catalogBikes, setCatalogBikes] = useState([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogPages, setCatalogPages] = useState(1);
  const [catalogLoading, setCatalogLoading] = useState(false);
  
  // Catalog filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogBrandFilter, setCatalogBrandFilter] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('');

  // Favorites state
  const [favoritesList, setFavoritesList] = useState([]);
  
  // Curated fallback bikes state
  const [trendingBikes, setTrendingBikes] = useState([]);
  const [topBuys, setTopBuys] = useState([]);
  const [allRounders, setAllRounders] = useState([]);
  const [curatedTab, setCuratedTab] = useState('trending');

  // Options lists
  const ridingTypesList = ['Commuter', 'Street', 'Sports', 'Cruiser', 'Retro', 'Adventure', 'Off-Road', 'Scooter', 'Superbike'];
  const brandsList = [
    'Hero', 'Honda', 'Yamaha', 'KTM', 'Royal Enfield', 'Bajaj', 'TVS', 'Suzuki', 
    'Kawasaki', 'Triumph', 'BMW Motorrad', 'Ducati', 'Harley-Davidson', 'Aprilia', 'Benelli', 'Jawa', 'Yezdi'
  ];
  const featuresList = [
    'ABS', 'LED Headlight', 'Bluetooth Connectivity', 'Slipper Clutch', 'TFT Display', 
    'Traction Control', 'Windshield', 'Spoke Wheels', 'Dual Exhausts', 'i3S Tech', 'VVA Engine'
  ];

  // Fetch user favorites
  const fetchFavorites = async () => {
    try {
      const res = await axios.get('/api/bikes/favorites/all');
      setFavoritesList(res.data.map(b => b._id));
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  // Fetch paginated catalog
  const fetchCatalog = async (page = 1) => {
    setCatalogLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: searchQuery,
        brand: catalogBrandFilter,
        category: catalogCategoryFilter
      };
      const res = await axios.get('/api/bikes', { params });
      setCatalogBikes(res.data.bikes);
      setCatalogTotal(res.data.total);
      setCatalogPage(res.data.page);
      setCatalogPages(res.data.pages);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  // Fetch Curated Collections (for Dashboard Highlights)
  const fetchCurated = async () => {
    try {
      // Get all standard bikes to filter down
      const res = await axios.get('/api/bikes?limit=50');
      const list = res.data.bikes;
      setTrendingBikes(list.filter(b => b.price >= 150000 && b.topSpeed >= 130).slice(0, 3));
      setTopBuys(list.filter(b => b.price <= 120000 && b.mileage >= 50).slice(0, 3));
      setAllRounders(list.filter(b => b.reliabilityScore >= 9 && b.engineCC >= 120 && b.engineCC <= 350).slice(0, 3));
    } catch (err) {
      console.error('Error fetching curated:', err);
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchCurated();
    // If user has saved preferences, auto-run recommendations and skip wizard
    if (user.preferences && user.preferences.ridingTypes && user.preferences.ridingTypes.length > 0) {
      generateRecommendations(user.preferences);
      setShowWizard(false);
    }
  }, []);

  // Re-run catalog query when filters change
  useEffect(() => {
    if (activeTab === 'catalog') {
      fetchCatalog(1);
    }
  }, [searchQuery, catalogBrandFilter, catalogCategoryFilter, activeTab]);

  const generateRecommendations = async (prefPayload = preferences) => {
    setLoading(true);
    setErrorMsg('');
    
    // Cool loading text transitions
    const loadingTexts = [
      'Calibrating fuel injection...',
      'Optimizing engine displacement...',
      'Testing suspension travel...',
      'Calculating mileage metrics...',
      'Analyzing reliability ratings...'
    ];
    let textIdx = 0;
    setLoadingText(loadingTexts[0]);
    const textInterval = setInterval(() => {
      textIdx = (textIdx + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[textIdx]);
    }, 600);

    try {
      const payload = {
        ...prefPayload,
        budgetMin: Number(prefPayload.budgetMin),
        budgetMax: Number(prefPayload.budgetMax)
      };

      const res = await axios.post('/api/recommendations', payload);
      setRecommendations(res.data);
      setShowWizard(false);
      // Refresh favorites too
      fetchFavorites();
      if (onUpdateUser) onUpdateUser();
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setErrorMsg('Failed to generate recommendations. Please try again.');
    } finally {
      clearInterval(textInterval);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  // Helper to toggle item in array
  const toggleArrayItem = (key, item) => {
    setPreferences(prev => {
      const list = prev[key];
      const newList = list.includes(item)
        ? list.filter(i => i !== item)
        : [...list, item];
      return { ...prev, [key]: newList };
    });
  };

  // Handle Favorites toggle
  const toggleFavorite = async (bikeId) => {
    const isFav = favoritesList.includes(bikeId);
    try {
      if (isFav) {
        await axios.delete(`/api/bikes/${bikeId}/favorite`);
        setFavoritesList(prev => prev.filter(id => id !== bikeId));
      } else {
        await axios.post(`/api/bikes/${bikeId}/favorite`);
        setFavoritesList(prev => [...prev, bikeId]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Add to comparison tool
  const addToCompare = (bike) => {
    let compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    // Check if already in list
    if (!compareList.some(b => b._id === bike._id)) {
      if (compareList.length >= 3) {
        // Shift first element out to allow at most 3
        compareList.shift();
      }
      compareList.push(bike);
      localStorage.setItem('compareList', JSON.stringify(compareList));
    }
    navigate('/compare');
  };

  return (
    <div className="min-h-screen bg-darker pb-20 text-white font-sans relative overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Global Navigation Header */}
      <Navbar user={user} onLogout={onLogout} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-8 relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800 mb-8 space-x-2">
          <button 
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all duration-300 ${
              activeTab === 'recommendations' 
                ? 'border-primary text-primary shadow-[0_4px_12px_rgba(59,130,246,0.05)]' 
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Recommendation Engine</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('catalog');
              fetchCatalog(1);
            }}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all duration-300 ${
              activeTab === 'catalog' 
                ? 'border-primary text-primary shadow-[0_4px_12px_rgba(59,130,246,0.05)]' 
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Bike Catalog</span>
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'recommendations' ? (
            <motion.div 
              key="rec-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {loading ? (
                /* Loading screen */
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
                  </div>
                  <span className="text-gray-400 font-semibold text-base tracking-widest uppercase animate-pulse">{loadingText}</span>
                </div>
              ) : showWizard ? (
                /* STEP 1: Preference Configuration Wizard */
                <div
                  className="max-w-4xl mx-auto bg-dark border border-gray-800 rounded-3xl p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.4)] backdrop-blur-md bg-opacity-70 space-y-8"
                >
                  <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black flex items-center space-x-2 text-white">
                        <Sliders className="w-6 h-6 text-primary" />
                        <span>Configure Your Motorcycle Preferences</span>
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">Configure your riding preferences and specs to design your ultimate machine.</p>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-center text-red-400 text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Category Selector */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-primary" />
                        <span>1. Select Riding Styles / Categories</span>
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {ridingTypesList.map(type => {
                          const isSelected = preferences.ridingTypes.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => toggleArrayItem('ridingTypes', type)}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center space-x-1.5 ${
                                isSelected 
                                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                              }`}
                            >
                              <Bike className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-gray-500'}`} />
                              <span>{type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Manufacturers Selector */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                        <Bike className="w-4 h-4 text-primary" />
                        <span>2. Preferred Manufacturers (Optional)</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {brandsList.map(brand => {
                          const isSelected = preferences.brands.includes(brand);
                          return (
                            <button
                              key={brand}
                              type="button"
                              onClick={() => toggleArrayItem('brands', brand)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 flex items-center space-x-1.5 ${
                                isSelected 
                                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(59,130,246,0.15)]' 
                                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                              }`}
                            >
                              <span>{brand}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Budget Section */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span>3. Target Budget Limits (INR)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/40 p-3.5 border border-gray-800/80 rounded-2xl">
                          <span className="text-[10px] text-gray-500 block mb-1 font-semibold">MIN VALUE</span>
                          <div className="relative">
                            <span className="absolute left-1.5 top-0.5 text-gray-400 text-sm">₹</span>
                            <input 
                              type="number"
                              value={preferences.budgetMin}
                              onChange={(e) => setPreferences({ ...preferences, budgetMin: e.target.value })}
                              className="w-full bg-transparent pl-5 pr-1 py-0.5 text-sm font-bold text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="bg-gray-900/40 p-3.5 border border-gray-800/80 rounded-2xl">
                          <span className="text-[10px] text-gray-500 block mb-1 font-semibold">MAX VALUE</span>
                          <div className="relative">
                            <span className="absolute left-1.5 top-0.5 text-gray-400 text-sm">₹</span>
                            <input 
                              type="number"
                              value={preferences.budgetMax}
                              onChange={(e) => setPreferences({ ...preferences, budgetMax: e.target.value })}
                              className="w-full bg-transparent pl-5 pr-1 py-0.5 text-sm font-bold text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4 text-primary" />
                        <span>4. Preferred Highlight Features</span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {featuresList.map(feature => {
                          const isSelected = preferences.features.includes(feature);
                          return (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => toggleArrayItem('features', feature)}
                              className={`px-3 py-2.5 rounded-xl text-left text-xs font-medium border transition-all duration-300 flex items-center space-x-2.5 ${
                                isSelected 
                                  ? 'bg-primary/10 border-primary/50 text-white shadow-[0_0_10px_rgba(59,130,246,0.05)]' 
                                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                isSelected ? 'bg-primary border-primary text-white' : 'border-gray-700'
                              }`}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                              <span className="truncate">{feature}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Additional Weights (New specifications filters) */}
                    <div className="space-y-3 pt-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                        <Sliders className="w-4 h-4 text-primary" />
                        <span>5. Driving Experience & Priorities</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Beginner Friendly */}
                        <div className="bg-gray-900/40 p-4 border border-gray-800/80 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Beginner Friendly</span>
                            <span className="text-[10px] text-gray-500 font-medium">Filter for manageable control</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreferences(prev => ({ ...prev, beginnerFriendly: !prev.beginnerFriendly }))}
                            className={`w-11 h-6 rounded-full transition-all duration-300 p-0.5 flex items-center ${
                              preferences.beginnerFriendly ? 'bg-primary justify-end' : 'bg-gray-800 justify-start'
                            }`}
                          >
                            <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-md"></motion.div>
                          </button>
                        </div>

                        {/* Comfort Importance */}
                        <div className="bg-gray-900/40 p-4 border border-gray-800/80 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Prioritize Comfort</span>
                            <span className="text-[10px] text-gray-500 font-medium">Ergonomic seating & posture</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreferences(prev => ({ ...prev, comfortImportance: !prev.comfortImportance }))}
                            className={`w-11 h-6 rounded-full transition-all duration-300 p-0.5 flex items-center ${
                              preferences.comfortImportance ? 'bg-primary justify-end' : 'bg-gray-800 justify-start'
                            }`}
                          >
                            <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-md"></motion.div>
                          </button>
                        </div>

                        {/* Mileage Importance */}
                        <div className="bg-gray-900/40 p-4 border border-gray-800/80 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Fuel Efficiency Priority</span>
                            <span className="text-[10px] text-gray-500 font-medium">Prioritize higher km/l mileage</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreferences(prev => ({ ...prev, mileageImportance: !prev.mileageImportance }))}
                            className={`w-11 h-6 rounded-full transition-all duration-300 p-0.5 flex items-center ${
                              preferences.mileageImportance ? 'bg-primary justify-end' : 'bg-gray-800 justify-start'
                            }`}
                          >
                            <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-md"></motion.div>
                          </button>
                        </div>

                        {/* Reliability Importance */}
                        <div className="bg-gray-900/40 p-4 border border-gray-800/80 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Reliability Focus</span>
                            <span className="text-[10px] text-gray-500 font-medium">High dependability scores</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreferences(prev => ({ ...prev, reliabilityImportance: !prev.reliabilityImportance }))}
                            className={`w-11 h-6 rounded-full transition-all duration-300 p-0.5 flex items-center ${
                              preferences.reliabilityImportance ? 'bg-primary justify-end' : 'bg-gray-800 justify-start'
                            }`}
                          >
                            <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-md"></motion.div>
                          </button>
                        </div>

                        {/* Resale Value Selection */}
                        <div className="bg-gray-900/40 p-4 border border-gray-800/80 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Resale Value Demand</span>
                            <span className="text-[10px] text-gray-500 font-medium">Expected resale market value</span>
                          </div>
                          <select
                            value={preferences.resaleValue}
                            onChange={(e) => setPreferences(prev => ({ ...prev, resaleValue: e.target.value }))}
                            className="bg-gray-900 border border-gray-850 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          >
                            <option value="Any">Any Value</option>
                            <option value="High">High Only</option>
                            <option value="Medium">Medium & High</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-800/80 pt-6">
                    <span className="text-[11px] text-gray-500 font-medium">Preferences are automatically saved to your account.</span>
                    <button
                      onClick={() => generateRecommendations(preferences)}
                      disabled={preferences.ridingTypes.length === 0}
                      className="px-8 py-3.5 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
                    >
                      <span>Match Recommendations</span>
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                  </div>
              ) : (
                /* STEP 2: Recommendations Results Page */
                <div 
                  className="space-y-6"
                >
                  {/* Preferences Summary bar */}
                  <div className="bg-dark border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Active Profile:</span>
                        <div className="flex flex-wrap gap-1">
                          {preferences.ridingTypes.map(c => (
                            <span key={c} className="bg-gray-800 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-gray-700">{c}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">
                        Price range: <span className="text-white font-bold">₹{Number(preferences.budgetMin).toLocaleString()}</span> to <span className="text-white font-bold">₹{Number(preferences.budgetMax).toLocaleString()}</span>
                        {preferences.brands.length > 0 && ` • Brands: ${preferences.brands.join(', ')}`}
                        {preferences.beginnerFriendly && ' • Beginner Friendly Only'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowWizard(true)}
                      className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-gray-900 border border-gray-800 hover:border-primary/50 text-gray-300 hover:text-white rounded-xl transition-all duration-300 text-xs font-bold uppercase tracking-wider"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Update Preferences</span>
                    </button>
                  </div>

                  {/* Recommendations Cards Header */}
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                      <span>Your Match Results</span>
                    </h3>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{recommendations.length} Matches Found</span>
                  </div>

                  {/* Recommendation Grid */}
                  {recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendations.map(({ bike, matchPercentage, reasons }) => {
                        const isFav = favoritesList.includes(bike._id);
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            key={bike._id} 
                            className="bg-dark border border-gray-800 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] rounded-3xl overflow-hidden flex flex-col transition-all duration-300 group"
                          >
                            {/* Image */}
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
                                <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 to-gray-800 flex items-center justify-center">
                                  <Flame className="w-12 h-12 text-gray-800" />
                                </div>
                              )}
                              {/* Match Percentage Badge */}
                              <div className="absolute top-3 right-3 bg-green-600/90 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-lg border border-green-400/30 flex items-center space-x-1 uppercase tracking-wide">
                                <Sparkles className="w-3 h-3 text-white" />
                                <span>{matchPercentage}% Match</span>
                              </div>

                              {/* Favorite Button Overlay */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(bike._id);
                                }}
                                className="absolute top-3 left-3 p-2 bg-darker/60 hover:bg-darker/90 text-rose-500 rounded-full border border-gray-800 backdrop-blur-sm transition-all duration-300"
                              >
                                <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-rose-500'}`} />
                              </button>
                            </div>

                            {/* Info Body */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{bike.brand}</span>
                                  <span className="text-[10px] text-gray-500 font-medium">{bike.categories.join(' / ')}</span>
                                </div>
                                <h4 className="text-base font-extrabold text-white mt-1 leading-snug group-hover:text-primary transition-colors duration-300">{bike.bikeName}</h4>
                              </div>

                              {/* Spec Summary */}
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

                              {/* Customized reasons / explanations tags */}
                              {reasons && reasons.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[9px] text-gray-500 block font-bold uppercase tracking-wider">Matching strengths:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {reasons.slice(0, 3).map((reason, idx) => (
                                      <span key={idx} className="bg-primary/5 text-primary border border-primary/20 text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center space-x-1">
                                        <Check className="w-2.5 h-2.5" />
                                        <span>{reason}</span>
                                      </span>
                                    ))}
                                    {reasons.length > 3 && (
                                      <span className="bg-gray-800 text-gray-400 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                        +{reasons.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Card Actions */}
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                  onClick={() => addToCompare(bike)}
                                  className="w-full py-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-xl transition-all duration-300 text-[10px] font-bold flex items-center justify-center space-x-1"
                                  title="Compare with similar bikes"
                                >
                                  <GitCompare className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="truncate">Compare with similar bikes</span>
                                </button>
                                <button
                                  onClick={() => navigate(`/bikes/${bike._id}`)}
                                  className="w-full py-2 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white border border-primary/30 shadow-[0_0_12px_rgba(59,130,246,0.25)] rounded-full transition-all duration-300 text-xs font-extrabold flex items-center justify-center space-x-2"
                                >
                                  <span>Know More</span>
                                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-dark/40 border border-gray-800 rounded-3xl p-12 text-center text-gray-400">
                      <Sliders className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="font-bold text-lg text-white">No matching bikes found.</p>
                      <p className="text-sm mt-1 max-w-md mx-auto">Try updating your budget limits or adding more categories / manufacturers to expand the match pool.</p>
                      <button
                        onClick={() => setShowWizard(true)}
                        className="mt-6 px-6 py-2.5 bg-primary hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300"
                      >
                        Adjust Preferences
                      </button>
                    </div>
                  )}

                  {/* Curated Collections Section */}
                  <div className="mt-16 pt-10 border-t border-gray-800/80 space-y-6">
                    <div className="space-y-1.5 text-left">
                      <h3 className="text-xl font-black text-white flex items-center space-x-2">
                        <Flame className="w-5.5 h-5.5 text-primary animate-pulse" />
                        <span>Explore Curated Collections</span>
                      </h3>
                      <p className="text-xs text-gray-400">Handpicked motorbikes categorized by performance, value, and versatility.</p>
                    </div>

                    {/* Curated Tabs */}
                    <div className="flex border-b border-gray-800 space-x-2">
                      {[
                        { id: 'trending', label: 'Trending', icon: <Flame className="w-4 h-4 text-primary" /> },
                        { id: 'topbuy', label: 'Top Value Buys', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
                        { id: 'allrounder', label: 'All Rounders', icon: <Compass className="w-4 h-4 text-blue-400" /> },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setCuratedTab(tab.id)}
                          className={`flex items-center space-x-2 px-5 py-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                            curatedTab === tab.id
                              ? 'border-primary text-primary'
                              : 'border-transparent text-gray-400 hover:text-white'
                          }`}
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Curated List */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(curatedTab === 'trending' ? trendingBikes : curatedTab === 'topbuy' ? topBuys : allRounders).map(bike => {
                        const isFav = favoritesList.includes(bike._id);
                        return (
                          <motion.div
                            key={bike._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => navigate(`/bikes/${bike._id}`)}
                            className="bg-dark/60 border border-gray-800/60 hover:border-primary/30 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 cursor-pointer group relative"
                          >
                            {/* Small Image */}
                            <div className="relative h-32 bg-gray-900 overflow-hidden flex items-center justify-center">
                              {bike.imageUrl ? (
                                <img
                                  src={bike.imageUrl}
                                  alt={bike.bikeName}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentNode.classList.add('fallback-gradient');
                                  }}
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 to-gray-800 flex items-center justify-center">
                                  <Flame className="w-8 h-8 text-gray-800" />
                                </div>
                              )}
                              <div className="absolute top-2 right-2 bg-primary/20 text-primary border border-primary/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {bike.brand}
                              </div>

                              {/* Favorite overlay */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(bike._id);
                                }}
                                className="absolute top-2 left-2 p-1.5 bg-darker/60 hover:bg-darker/90 text-rose-500 rounded-full border border-gray-800 backdrop-blur-sm transition-all duration-300"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                              </button>
                            </div>

                            {/* Detail summary */}
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-left">
                              <div>
                                <h4 className="text-sm font-bold text-white leading-tight group-hover:text-primary transition-colors">{bike.bikeName}</h4>
                                <p className="text-[10px] text-gray-400 mt-1">{bike.categories.join(' • ')}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-800/50 text-[10px]">
                                <div>
                                  <span className="text-gray-500 block uppercase font-bold text-[8px]">Price</span>
                                  <span className="font-extrabold text-white">₹{bike.price.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 block uppercase font-bold text-[8px]">Engine</span>
                                  <span className="font-extrabold text-white">{bike.engineCC} cc</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* Tab 2: General Catalog Tab with server-side pagination and filters */
            <motion.div 
              key="catalog-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Filters Panel */}
              <div className="bg-dark border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search by name, brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white placeholder-gray-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Brand Filter */}
                  <select
                    value={catalogBrandFilter}
                    onChange={(e) => setCatalogBrandFilter(e.target.value)}
                    className="bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-gray-300"
                  >
                    <option value="">All Brands</option>
                    {brandsList.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>

                  {/* Category Filter */}
                  <select
                    value={catalogCategoryFilter}
                    onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                    className="bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-gray-300"
                  >
                    <option value="">All Categories</option>
                    {ridingTypesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Show item summary */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium px-1">
                <span>Showing {Math.min(catalogTotal, (catalogPage - 1) * 12 + 1)}–{Math.min(catalogTotal, catalogPage * 12)} of {catalogTotal} motorcycles</span>
              </div>

              {/* Bike List */}
              {catalogLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                  <span className="text-gray-500 text-sm">Fetching catalog...</span>
                </div>
              ) : catalogBikes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catalogBikes.map(bike => {
                    const isFav = favoritesList.includes(bike._id);
                    return (
                      <motion.div 
                        layout
                        key={bike._id} 
                        className="bg-dark border border-gray-800 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.08)] rounded-3xl overflow-hidden flex flex-col transition-all duration-300 group"
                      >
                        {/* Image section */}
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
                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 to-gray-800 flex items-center justify-center">
                              <Flame className="w-12 h-12 text-gray-800" />
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 bg-darker/80 border border-gray-800/80 text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                            {bike.categories.join(' • ')}
                          </div>

                          {/* Favorite button overlay */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(bike._id);
                            }}
                            className="absolute top-3 left-3 p-2 bg-darker/60 hover:bg-darker/90 text-rose-500 rounded-full border border-gray-800 backdrop-blur-sm transition-all duration-300"
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                          </button>
                        </div>

                        {/* Details */}
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

                          {/* Highlight Features */}
                          <div className="space-y-1">
                            <span className="text-[9px] text-gray-500 block font-bold uppercase tracking-wider">Features:</span>
                            <div className="flex flex-wrap gap-1">
                              {bike.features.slice(0, 3).map((f, idx) => (
                                <span key={idx} className="bg-gray-800 text-gray-300 text-[9px] font-bold px-2 py-0.5 rounded border border-gray-700/50">
                                  {f}
                                </span>
                              ))}
                              {bike.features.length > 3 && (
                                <span className="bg-gray-800 text-gray-400 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                  +{bike.features.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/40">
                            <button
                              onClick={() => addToCompare(bike)}
                              className="w-full py-2.5 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-xl transition-all duration-300 text-[10px] font-bold flex items-center justify-center space-x-1"
                              title="Compare with similar bikes"
                            >
                              <GitCompare className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">Compare with similar bikes</span>
                            </button>
                            <button
                              onClick={() => navigate(`/bikes/${bike._id}`)}
                              className="w-full py-2.5 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white border border-primary/30 shadow-[0_0_12px_rgba(59,130,246,0.25)] rounded-full transition-all duration-300 text-xs font-extrabold flex items-center justify-center space-x-2"
                            >
                              <span>Know More</span>
                              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-dark/40 border border-gray-800 rounded-3xl p-12 text-center text-gray-400">
                  <Sliders className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="font-bold text-lg text-white">No motorcycles found in the catalog.</p>
                  <p className="text-sm mt-1">Try relaxing your search query or brand/category filters.</p>
                </div>
              )}

              {/* Catalog Pagination Controls */}
              {catalogPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-6">
                  <button
                    onClick={() => fetchCatalog(catalogPage - 1)}
                    disabled={catalogPage === 1}
                    className="p-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: catalogPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => fetchCatalog(page)}
                      className={`w-9 h-9 rounded-xl border text-xs font-bold transition-all ${
                        catalogPage === page
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => fetchCatalog(catalogPage + 1)}
                    disabled={catalogPage === catalogPages}
                    className="p-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
