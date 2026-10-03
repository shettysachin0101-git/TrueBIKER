import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Sparkles,
  ChevronsRight, 
  Compass, 
  Gauge, 
  ShieldCheck,
  Award
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-darker text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Flame className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">TRUE<span className="text-primary">BIKER</span></h1>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Motorbike Intelligence</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2 border border-gray-800 hover:border-primary/50 bg-gray-900/50 hover:bg-gray-900 text-sm font-semibold rounded-xl transition-all duration-300"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-20 z-10">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Heading, Subtitle, CTAs) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold tracking-wider text-primary uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span>Discover Your Ultimate Machine</span>
            </motion.div>

            {/* Main Title & Subtitle */}
            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400"
              >
                Unleash the Power of <br />
                <span className="text-primary bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Intelligent Recommendation</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-gray-400 text-sm md:text-lg max-w-2xl leading-relaxed"
              >
                TrueBiker is a high-performance recommendation and matching system tailored for riders. 
                Find your ideal motorcycle based on budget, engine displacement, mileage, and features in seconds.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <button
                onClick={() => navigate('/login')}
                className="group px-8 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center space-x-2 text-xs uppercase tracking-wider w-full sm:w-auto"
              >
                <span>Ignite Engine / Get Started</span>
                <ChevronsRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gray-900/60 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-300 text-xs uppercase tracking-wider w-full sm:w-auto"
              >
                Explore Catalog
              </button>
            </motion.div>
          </div>

          {/* Right Column (Dream Finish slogan card) */}
          <div className="lg:col-span-5 w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-br from-gray-900/90 to-blue-950/20 border border-primary/20 backdrop-blur-xl shadow-[0_20px_50px_rgba(59,130,246,0.15)] overflow-hidden group flex flex-col justify-between min-h-[350px] text-left"
            >
              {/* Glowing decorative elements inside the card */}
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-primary/25 rounded-full blur-[50px] group-hover:bg-primary/35 transition-all duration-700"></div>
              <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-indigo-900/20 rounded-full blur-[40px] group-hover:bg-indigo-900/30 transition-all duration-700"></div>

              <div className="space-y-6 relative z-10">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-primary/20 rounded-full border border-primary/30 text-[10px] uppercase font-black tracking-widest text-primary">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  <span>TrueBiker Promise</span>
                </div>
                <h3 className="text-3xl font-black text-white leading-snug tracking-tight">
                  To Your <br />
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Ultimate Dream</span> <br />
                  Partner.
                </h3>
                <p className="text-gray-200 text-sm md:text-base leading-relaxed font-medium italic border-l-2 border-primary/40 pl-3 py-1">
                  "Thank you for choosing us to give a final touch finish to your dream which will be coming true very soon in a cool way."
                </p>
              </div>

              <div className="pt-6 border-t border-gray-800/60 relative z-10 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Dreams In Motion</span>
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30">
                  <Flame className="w-4 h-4 text-primary animate-pulse" />
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Key Features Grid (Spanning bottom on larger screens) */}
          <div className="lg:col-span-12 w-full pt-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
            >
              {/* Feature 1 */}
              <div className="bg-dark/40 border border-gray-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4 hover:border-primary/30 transition-all duration-300">
                <div className="p-3 bg-blue-500/10 rounded-xl w-fit text-blue-400 border border-blue-500/20">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Preference Profiler</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Filter by category (Street, Cruiser, Touring, Off-Road, Dirt), budget limit (INR), and specific feature requirements to refine your search.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-dark/40 border border-gray-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4 hover:border-primary/30 transition-all duration-300">
                <div className="p-3 bg-purple-500/10 rounded-xl w-fit text-purple-400 border border-purple-500/20">
                  <Gauge className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Specs Analyzer</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Compare price points, engine capacities, top speeds, mileage, and reliability scores directly from the catalog.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-dark/40 border border-gray-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4 hover:border-primary/30 transition-all duration-300">
                <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Pros & Cons</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Get instant access to realistic rider feedback, including pros and cons for every model to make an informed buying decision.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-800/40 py-6 text-center text-xs text-gray-500 z-10 bg-darker/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-primary" />
            <span>TrueBiker Intelligence Inc. &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex space-x-6 text-gray-400">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
