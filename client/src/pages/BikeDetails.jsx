import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Heart, GitCompare, ExternalLink, ThumbsUp, ThumbsDown, 
  Fuel, Compass, Check, Calendar, HelpCircle, ShieldCheck, Cpu 
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function BikeDetails({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const fetchBikeAndFavorites = async () => {
      try {
        const [bikeRes, favsRes] = await Promise.all([
          axios.get(`/api/bikes/${id}`),
          axios.get('/api/bikes/favorites/all')
        ]);
        setBike(bikeRes.data);
        setIsFav(favsRes.data.some(b => b._id === id));
      } catch (err) {
        console.error('Error fetching bike details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBikeAndFavorites();
  }, [id]);

  const handleFavoriteToggle = async () => {
    try {
      if (isFav) {
        await axios.delete(`/api/bikes/${id}/favorite`);
        setIsFav(false);
      } else {
        await axios.post(`/api/bikes/${id}/favorite`);
        setIsFav(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleAddToCompare = () => {
    if (!bike) return;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-darker flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-gray-400 font-medium">Gathering specifications...</p>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="min-h-screen bg-darker flex flex-col items-center justify-center space-y-4 text-center px-4">
        <p className="text-xl font-bold text-white">Motorcycle details not found.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Segmenting specifications for categorized grid view
  const mechanicalSpecs = [
    { label: 'Engine Capacity', value: `${bike.engineCC} cc` },
    { label: 'Top Speed', value: `${bike.topSpeed} km/h` },
    { label: 'Fuel Type', value: bike.fuelType },
    { label: 'Transmission', value: bike.transmission },
    { label: 'Weight', value: `${bike.weight} kg` },
    { label: 'Seat Height', value: `${bike.seatHeight} mm` }
  ];

  const valueSpecs = [
    { label: 'Ex-Showroom Price', value: `₹${bike.price.toLocaleString()}` },
    { label: 'Real Mileage', value: `${bike.mileage} km/l` },
    { label: 'Reliability Index', value: `${bike.reliabilityScore} / 10` },
    { label: 'Resale Demands', value: bike.resaleValue },
    { label: 'Beginner Friendly', value: bike.beginnerFriendly ? 'Yes' : 'No' },
    { label: 'Availability Status', value: bike.availability }
  ];

  return (
    <div className="min-h-screen bg-darker pb-20 text-white font-sans">
      <Navbar user={user} onLogout={onLogout} />

      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-8">
        {/* Back navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Hero Card */}
        <div className="bg-dark border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          {/* Left half: Image */}
          <div className="relative md:w-1/2 h-64 md:h-auto bg-gray-900 flex items-center justify-center">
            {bike.imageUrl ? (
              <img 
                src={bike.imageUrl} 
                alt={bike.bikeName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.classList.add('fallback-gradient');
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-950 to-gray-850 flex items-center justify-center">
                <Compass className="w-16 h-16 text-gray-800" />
              </div>
            )}
            
            {/* Status Overlays */}
            <div className="absolute top-4 left-4 bg-primary/20 text-primary border border-primary/30 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
              {bike.brand}
            </div>
            
            {bike.beginnerFriendly && (
              <div className="absolute bottom-4 left-4 bg-green-500/90 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Beginner Approved</span>
              </div>
            )}
          </div>

          {/* Right half: Summary */}
          <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between space-y-6">
            <div className="space-y-3 text-left">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{bike.brand}</span>
                <h1 className="text-2xl md:text-3xl font-black text-white mt-1 leading-tight">{bike.bikeName}</h1>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {bike.categories.map((c, i) => (
                  <span key={i} className="bg-gray-800/80 text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-gray-700">
                    {c}
                  </span>
                ))}
              </div>

              <div className="text-2xl font-black text-white pt-2">
                ₹{bike.price.toLocaleString()}
                <span className="text-xs text-gray-500 font-medium ml-1.5 uppercase">ex-showroom</span>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleFavoriteToggle}
                className={`py-3 rounded-xl text-xs font-bold border transition duration-300 flex items-center justify-center space-x-1.5 ${
                  isFav 
                    ? 'bg-rose-950/40 border-rose-500/30 text-rose-500 hover:bg-rose-900/40' 
                    : 'bg-gray-900 border-gray-800 hover:border-rose-500/30 text-gray-400 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFav ? 'In Favorites' : 'Add to Favorites'}</span>
              </button>

              <button 
                onClick={handleAddToCompare}
                className="py-3 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-xl transition duration-300 text-xs font-bold flex items-center justify-center space-x-1.5"
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mechanical Specs */}
          <div className="bg-dark border border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h2 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
              <Cpu className="w-5 h-5 text-primary" />
              <span>Mechanical Specifications</span>
            </h2>
            <div className="divide-y divide-gray-850">
              {mechanicalSpecs.map((spec, i) => (
                <div key={i} className="flex justify-between py-3 text-sm">
                  <span className="text-gray-400 font-medium">{spec.label}</span>
                  <span className="text-white font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Value Specs */}
          <div className="bg-dark border border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h2 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-gray-800 pb-3">
              <Fuel className="w-5 h-5 text-primary" />
              <span>Economic & Value Ratings</span>
            </h2>
            <div className="divide-y divide-gray-850">
              {valueSpecs.map((spec, i) => (
                <div key={i} className="flex justify-between py-3 text-sm">
                  <span className="text-gray-400 font-medium">{spec.label}</span>
                  <span className="text-white font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highlight Features & Pros/Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Highlight Features */}
          <div className="bg-dark border border-gray-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="text-base font-extrabold text-white border-b border-gray-800 pb-3">Highlight Technology Features</h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {bike.features.map((feature, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-800 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* External links and launch info */}
          <div className="bg-dark border border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4 text-left">
              <h3 className="text-base font-extrabold text-white border-b border-gray-800 pb-3">Launch Info & manufacturer Link</h3>
              <div className="flex items-center justify-between text-sm py-2">
                <span className="text-gray-400 font-medium flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Launch Year</span>
                </span>
                <span className="text-white font-bold">{bike.launchYear}</span>
              </div>
            </div>

            <a 
              href={bike.officialWebsite} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2 text-xs uppercase tracking-wider shadow-lg shadow-primary/10"
            >
              <span>Visit Official Page</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Pros & Cons list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-950/15 border border-green-500/20 rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="text-base font-extrabold text-green-400 flex items-center space-x-2">
              <ThumbsUp className="w-5 h-5" />
              <span>Key Advantages</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-300 font-medium pl-1">
              {bike.pros.map((pro, i) => (
                <li key={i} className="flex items-start space-x-2.5">
                  <div className="p-0.5 bg-green-500/10 text-green-400 rounded-md mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-950/15 border border-red-500/20 rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="text-base font-extrabold text-red-400 flex items-center space-x-2">
              <ThumbsDown className="w-5 h-5" />
              <span>Key Limitations</span>
            </h3>
            <ul className="space-y-2 text-sm text-gray-300 font-medium pl-1">
              {bike.cons.map((con, i) => (
                <li key={i} className="flex items-start space-x-2.5">
                  <div className="p-0.5 bg-red-500/10 text-red-400 rounded-md mt-0.5">
                    <Check className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
