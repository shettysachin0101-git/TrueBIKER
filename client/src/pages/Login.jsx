import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Flame, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const res = await axios.post(endpoint, payload);
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        if (onLoginSuccess) {
          await onLoginSuccess();
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.msg || 'An error occurred during authentication');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-darker relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-8 bg-dark border border-gray-800 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.5)] backdrop-blur-md bg-opacity-80"
      >
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.25)] flex items-center justify-center">
            <Flame className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-wider text-white">TRUE<span className="text-primary">BIKER</span></h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Motorbike Match Engine</p>
          </div>
        </div>

        <div className="space-y-1 text-center">
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            It's time to set you up
          </h3>
          <p className="text-xs text-gray-400">
            {isLogin ? 'Enter your details to access your matches' : 'Register to set your rider preferences'}
          </p>
        </div>
        
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 text-xs text-red-400 bg-red-950/20 border border-red-500/30 rounded-xl text-center font-medium"
          >
            {errorMsg}
          </motion.div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          {!isLogin && (
            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Name</span>
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                autoComplete="off"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800/80 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-white text-sm transition-all placeholder-gray-600" 
                placeholder="Rider name" 
              />
            </div>
          )}
          <div>
            <label className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>Email Address</span>
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="off"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800/80 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-white text-sm transition-all placeholder-gray-600" 
              placeholder="rider@truebiker.com" 
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="w-full pl-4 pr-12 py-3 bg-gray-900 border border-gray-800/80 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-white text-sm transition-all placeholder-gray-600" 
                placeholder="••••••••" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-primary transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Confirm Password</span>
              </label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                  autoComplete="new-password"
                  className="w-full pl-4 pr-12 py-3 bg-gray-900 border border-gray-800/80 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none text-white text-sm transition-all placeholder-gray-600" 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-500 hover:text-primary transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full py-3.5 mt-4 text-white font-bold bg-primary rounded-xl hover:bg-blue-600 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 text-xs uppercase tracking-wider"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 border-t border-gray-800/40 pt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
              setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              setShowPassword(false);
              setShowConfirmPassword(false);
            }} 
            className="text-primary hover:underline font-semibold"
          >
            {isLogin ? 'Register now' : 'Sign in here'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
