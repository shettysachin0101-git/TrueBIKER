import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldAlert, BarChart3, Users, Layers, Plus, Search, Edit2, Trash2, 
  Check, Fuel, Flame, HelpCircle, Save, X, ExternalLink 
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AdminDashboard({ user, onLogout }) {
  const [activeSubTab, setActiveSubTab] = useState('analytics'); // 'analytics', 'catalog', 'users'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bike CRUD Catalog States
  const [bikes, setBikes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBike, setEditingBike] = useState(null); // Null if adding new
  const [formData, setFormData] = useState({
    bikeName: '',
    brand: '',
    engineCC: 150,
    mileage: 45,
    topSpeed: 110,
    price: 150000,
    fuelType: 'Petrol',
    transmission: 'Manual',
    weight: 140,
    seatHeight: 790,
    reliabilityScore: 8,
    beginnerFriendly: true,
    resaleValue: 'High',
    categories: '',
    features: '',
    pros: '',
    cons: '',
    imageUrl: '',
    officialWebsite: '',
    launchYear: 2024,
    availability: 'Available'
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch admin statistics
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsersList(res.data);
    } catch (err) {
      console.error('Error fetching user list:', err);
    }
  };

  // Fetch bikes for administrative catalog list
  const fetchAdminBikes = async (pageNo = 1) => {
    setCatalogLoading(true);
    try {
      const res = await axios.get(`/api/bikes?page=${pageNo}&limit=10&search=${search}`);
      setBikes(res.data.bikes);
      setTotal(res.data.total);
      setPage(res.data.page);
      setPages(res.data.pages);
    } catch (err) {
      console.error('Error fetching admin catalog:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchAdminBikes(1)]);
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Re-run administrative bike search
  useEffect(() => {
    if (activeSubTab === 'catalog') {
      fetchAdminBikes(1);
    }
  }, [search, activeSubTab]);

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingBike(null);
    setFormError('');
    setFormSuccess('');
    setFormData({
      bikeName: '',
      brand: '',
      engineCC: 150,
      mileage: 45,
      topSpeed: 110,
      price: 150000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      weight: 140,
      seatHeight: 790,
      reliabilityScore: 8,
      beginnerFriendly: true,
      resaleValue: 'High',
      categories: 'Commuter, Street',
      features: 'ABS, LED Headlight',
      pros: 'Good Mileage, Easy handling',
      cons: 'Lacks premium power',
      imageUrl: '',
      officialWebsite: 'https://',
      launchYear: 2024,
      availability: 'Available'
    });
    setModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (bike) => {
    setEditingBike(bike);
    setFormError('');
    setFormSuccess('');
    setFormData({
      bikeName: bike.bikeName,
      brand: bike.brand,
      engineCC: bike.engineCC,
      mileage: bike.mileage,
      topSpeed: bike.topSpeed,
      price: bike.price,
      fuelType: bike.fuelType,
      transmission: bike.transmission,
      weight: bike.weight,
      seatHeight: bike.seatHeight,
      reliabilityScore: bike.reliabilityScore,
      beginnerFriendly: bike.beginnerFriendly,
      resaleValue: bike.resaleValue,
      categories: bike.categories.join(', '),
      features: bike.features.join(', '),
      pros: bike.pros.join(', '),
      cons: bike.cons.join(', '),
      imageUrl: bike.imageUrl || '',
      officialWebsite: bike.officialWebsite,
      launchYear: bike.launchYear,
      availability: bike.availability
    });
    setModalOpen(true);
  };

  // Delete Bike action
  const handleDelete = async (bikeId) => {
    if (window.confirm("Are you sure you want to delete this motorcycle record? This action cannot be undone.")) {
      try {
        await axios.delete(`/api/admin/bikes/${bikeId}`);
        fetchAdminBikes(page);
        fetchStats(); // Update stats numbers
      } catch (err) {
        console.error('Error deleting bike:', err);
        alert(err.response?.data?.msg || "Failed to delete record.");
      }
    }
  };

  // Form submit handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Pre-process comma-separated strings to arrays
    const categoriesArray = formData.categories.split(',').map(s => s.trim()).filter(Boolean);
    const featuresArray = formData.features.split(',').map(s => s.trim()).filter(Boolean);
    const prosArray = formData.pros.split(',').map(s => s.trim()).filter(Boolean);
    const consArray = formData.cons.split(',').map(s => s.trim()).filter(Boolean);

    if (categoriesArray.length === 0 || prosArray.length === 0 || consArray.length === 0) {
      setFormError("Categories, Pros, and Cons are required list fields (comma-separated).");
      return;
    }

    const payload = {
      ...formData,
      engineCC: Number(formData.engineCC),
      mileage: Number(formData.mileage),
      topSpeed: Number(formData.topSpeed),
      price: Number(formData.price),
      weight: Number(formData.weight),
      seatHeight: Number(formData.seatHeight),
      reliabilityScore: Number(formData.reliabilityScore),
      launchYear: Number(formData.launchYear),
      categories: categoriesArray,
      features: featuresArray,
      pros: prosArray,
      cons: consArray
    };

    try {
      if (editingBike) {
        await axios.put(`/api/admin/bikes/${editingBike._id}`, payload);
        setFormSuccess("Motorcycle record updated successfully!");
      } else {
        await axios.post('/api/admin/bikes', payload);
        setFormSuccess("Motorcycle record created successfully!");
      }
      
      // Reload lists
      fetchAdminBikes(page);
      fetchStats();

      // Close modal shortly
      setTimeout(() => {
        setModalOpen(false);
      }, 1500);

    } catch (err) {
      console.error('Error submitting form:', err);
      setFormError(err.response?.data?.msg || "Server validation error. Check specification formats.");
    }
  };

  return (
    <div className="min-h-screen bg-darker pb-20 text-white font-sans relative">
      <Navbar user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Title */}
        <div className="space-y-1.5 text-left border-b border-gray-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center space-x-2.5">
              <ShieldAlert className="w-7 h-7 text-amber-500" />
              <span>Administrative Console</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">Manage database catalogs, evaluate preferences analytics, and monitor accounts.</p>
          </div>

          <div className="flex bg-gray-900/60 p-1 border border-gray-800 rounded-xl">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeSubTab === 'analytics' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
            
            <button
              onClick={() => setActiveSubTab('catalog')}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeSubTab === 'catalog' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Manage Catalog</span>
            </button>
            
            <button
              onClick={() => setActiveSubTab('users')}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${
                activeSubTab === 'users' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users ({usersList.length})</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            <span className="text-gray-500 text-sm">Synchronizing dashboard...</span>
          </div>
        ) : (
          <div>
            {/* SUB TAB 1: ANALYTICS */}
            {activeSubTab === 'analytics' && stats && (
              <div className="space-y-8">
                {/* 3 Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Bikes */}
                  <div className="bg-dark border border-gray-800 rounded-3xl p-6 shadow-xl flex items-center space-x-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Total Cataloged Bikes</span>
                      <span className="text-3xl font-black text-white">{stats.totalBikes}</span>
                    </div>
                  </div>

                  {/* Total Users */}
                  <div className="bg-dark border border-gray-800 rounded-3xl p-6 shadow-xl flex items-center space-x-4">
                    <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Registered Accounts</span>
                      <span className="text-3xl font-black text-white">{stats.totalUsers}</span>
                    </div>
                  </div>

                  {/* Avg Preference Budget */}
                  <div className="bg-dark border border-gray-800 rounded-3xl p-6 shadow-xl flex items-center space-x-4">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                      <Fuel className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Average Target Budget Limit</span>
                      <span className="text-2xl font-black text-white">₹{stats.preferences.averageBudgetMax?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Analytics tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand Breakdown */}
                  <div className="bg-dark border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-3 flex items-center justify-between">
                      <span>Brand Concentration</span>
                      <span className="text-xs text-gray-400">{stats.brandStats.length} Unique Brands</span>
                    </h3>
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {stats.brandStats.map((brand, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1">
                          <span className="text-gray-400 font-semibold">{brand._id}</span>
                          <span className="text-white font-extrabold bg-gray-900 border border-gray-800 px-3 py-1 rounded-xl text-xs">
                            {brand.count} Trims
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category counts */}
                  <div className="bg-dark border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-3 flex items-center justify-between">
                      <span>Category Distribution</span>
                      <span className="text-xs text-gray-400">{stats.categoryStats.length} Classes</span>
                    </h3>
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {stats.categoryStats.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-1">
                          <span className="text-gray-400 font-semibold">{cat._id}</span>
                          <span className="text-white font-extrabold bg-gray-900 border border-gray-800 px-3 py-1 rounded-xl text-xs">
                            {cat.count} Bikes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB TAB 2: MANAGE CATALOG (CRUD LIST) */}
            {activeSubTab === 'catalog' && (
              <div className="space-y-6">
                {/* Search & Add Bar */}
                <div className="bg-dark border border-gray-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md w-full">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search admin catalog by name or brand..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white"
                    />
                  </div>

                  <button
                    onClick={handleOpenAdd}
                    className="flex items-center space-x-1.5 px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl transition duration-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/10 w-full md:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Motorcycle Record</span>
                  </button>
                </div>

                {/* Bike List */}
                <div className="bg-dark border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                  {catalogLoading ? (
                    <div className="text-center py-16 text-gray-500 text-xs font-semibold animate-pulse">Syncing catalog data...</div>
                  ) : bikes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b border-gray-850 text-xs text-gray-500 uppercase font-black bg-gray-950/20">
                            <th className="p-4 pl-6">Motorcycle</th>
                            <th className="p-4">Brand</th>
                            <th className="p-4">Engine CC</th>
                            <th className="p-4">Price (INR)</th>
                            <th className="p-4">Launch Year</th>
                            <th className="p-4">Availability</th>
                            <th className="p-4 pr-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-850">
                          {bikes.map(bike => (
                            <tr key={bike._id} className="hover:bg-gray-900/30 transition">
                              <td className="p-4 pl-6 font-extrabold text-white">{bike.bikeName}</td>
                              <td className="p-4 font-semibold text-gray-400">{bike.brand}</td>
                              <td className="p-4 font-medium text-white">{bike.engineCC} cc</td>
                              <td className="p-4 font-extrabold text-white">₹{bike.price.toLocaleString()}</td>
                              <td className="p-4 font-medium text-gray-400">{bike.launchYear}</td>
                              <td className="p-4">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider ${
                                  bike.availability === 'Available' 
                                    ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20'
                                    : 'bg-amber-950/30 text-amber-400 border-amber-500/20'
                                }`}>
                                  {bike.availability}
                                </span>
                              </td>
                              <td className="p-4 pr-6 text-right space-x-1.5">
                                <button
                                  onClick={() => handleOpenEdit(bike)}
                                  className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg border border-transparent hover:border-gray-700 transition"
                                  title="Edit Specs"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(bike._id)}
                                  className="p-2 hover:bg-red-950/40 text-gray-400 hover:text-red-400 rounded-lg border border-transparent hover:border-red-500/20 transition"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500 text-sm">No motorcycle records match this search query.</div>
                  )}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center items-center space-x-2 pt-4">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(pageNo => (
                      <button
                        key={pageNo}
                        onClick={() => fetchAdminBikes(pageNo)}
                        className={`w-8.5 h-8.5 rounded-lg border text-xs font-bold transition ${
                          page === pageNo 
                            ? 'bg-primary border-primary text-white' 
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                        }`}
                      >
                        {pageNo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB TAB 3: REGISTERED USERS LIST */}
            {activeSubTab === 'users' && (
              <div className="bg-dark border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-850 text-xs text-gray-500 uppercase font-black bg-gray-950/20">
                        <th className="p-4 pl-6">Rider Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4 pr-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850">
                      {usersList.map(u => (
                        <tr key={u._id} className="hover:bg-gray-900/30 transition">
                          <td className="p-4 pl-6 font-extrabold text-white">{u.name}</td>
                          <td className="p-4 font-semibold text-gray-400">{u.email}</td>
                          <td className="p-4 font-bold text-white uppercase text-xs">
                            <span className={`px-2 py-0.5 rounded-lg border tracking-wider ${
                              u.role === 'admin' 
                                ? 'bg-amber-950/30 text-amber-500 border-amber-500/20' 
                                : 'bg-gray-900 text-gray-400 border-gray-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500 font-medium">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 pr-6">
                            <span className="text-[10px] font-black bg-green-950/20 text-green-400 border border-green-500/10 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CRUD Modals (Add / Edit Bike specification form) */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-4xl bg-dark border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl my-8 relative flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingBike ? `Edit Technical Specs: ${editingBike.bikeName}` : 'Add New Motorcycle Record'}
                  </h3>
                  <p className="text-xs text-gray-500">Provide all 21 parameters required for the recommendation engine match calculations.</p>
                </div>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-xl transition"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto py-5 space-y-6 text-left">
                {formError && (
                  <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-center text-red-400 text-xs font-semibold">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-4 bg-green-950/40 border border-green-500/30 rounded-xl text-center text-green-400 text-xs font-semibold">
                    {formSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Bike Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Motorcycle Trim/Model Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.bikeName}
                      onChange={(e) => setFormData({ ...formData, bikeName: e.target.value })}
                      placeholder="e.g. Pulsar NS200 Pro ABS"
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Brand */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Manufacturer/Brand</label>
                    <input 
                      type="text" 
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Bajaj"
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Launch Year */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Launch Year</label>
                    <input 
                      type="number" 
                      required
                      value={formData.launchYear}
                      onChange={(e) => setFormData({ ...formData, launchYear: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Ex-Showroom Price (INR)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-855 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Engine CC */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Engine Displacement (cc)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.engineCC}
                      onChange={(e) => setFormData({ ...formData, engineCC: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Mileage */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Real Mileage (km/l)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Top Speed */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Top Speed (km/h)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.topSpeed}
                      onChange={(e) => setFormData({ ...formData, topSpeed: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (kg)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Seat Height */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Seat Height (mm)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.seatHeight}
                      onChange={(e) => setFormData({ ...formData, seatHeight: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Fuel Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Fuel Type</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Transmission */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Transmission</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>

                  {/* Reliability Score */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Reliability Score (1-10)</label>
                    <input 
                      type="number" 
                      min="1"
                      max="10"
                      required
                      value={formData.reliabilityScore}
                      onChange={(e) => setFormData({ ...formData, reliabilityScore: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Resale value */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Resale Value Demand</label>
                    <select
                      value={formData.resaleValue}
                      onChange={(e) => setFormData({ ...formData, resaleValue: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  {/* Availability */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Availability Status</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
                      <option value="Coming Soon">Coming Soon</option>
                    </select>
                  </div>

                  {/* Beginner Friendly toggle */}
                  <div className="space-y-2 flex items-center justify-between border border-gray-850 rounded-xl p-3 bg-gray-900/40">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">Beginner Friendly</span>
                      <span className="text-[9px] text-gray-500 font-medium">Safe specifications</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, beginnerFriendly: !prev.beginnerFriendly }))}
                      className={`w-10 h-5.5 rounded-full transition-all duration-300 p-0.5 flex items-center ${
                        formData.beginnerFriendly ? 'bg-primary justify-end' : 'bg-gray-800 justify-start'
                      }`}
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md"></div>
                    </button>
                  </div>
                </div>

                {/* Rich Texts and Comma Separated arrays */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Categories */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Categories (Comma separated list)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.categories}
                      onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                      placeholder="e.g. Commuter, Street, Retro"
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Features */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Features (Comma separated list)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      placeholder="e.g. ABS, Digital Console, Bluetooth"
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Pros */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pros / Advantages (Comma separated list)</label>
                    <textarea 
                      required
                      rows="2"
                      value={formData.pros}
                      onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                      placeholder="e.g. Comfortable seat, Excellent fuel efficiency, Affordable upkeep"
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    ></textarea>
                  </div>

                  {/* Cons */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Cons / Limitations (Comma separated list)</label>
                    <textarea 
                      required
                      rows="2"
                      value={formData.cons}
                      onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                      placeholder="e.g. Weak top end acceleration, Simple looks"
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Image URL */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Image URL (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="e.g. https://images.unsplash.com/... or keep blank"
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Official Website */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Official Website URL</label>
                    <input 
                      type="url" 
                      required
                      value={formData.officialWebsite}
                      onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                      placeholder="e.g. https://www.heromotocorp.com"
                      className="w-full bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-2.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-xl transition text-xs font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl transition duration-300 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-primary/10"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingBike ? 'Update Specifications' : 'Save Record'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
