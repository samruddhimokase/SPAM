import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Instagram, 
  MessageSquare, 
  Phone, 
  Search, 
  Users, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Globe,
  Zap,
  Activity,
  ShieldCheck,
  X as CloseIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  const [showScamDatabase, setShowScamDatabase] = useState(false);
  const [showHealthCheck, setShowHealthCheck] = useState(false);
  const [showMonitors, setShowMonitors] = useState(false);
  const [scamSearchQuery, setScamSearchQuery] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  const scamDatabase = [
    { id: 1, type: 'Phishing', platform: 'WhatsApp', risk: 'High', details: 'OTP Verification Scam', date: '2026-03-21' },
    { id: 2, type: 'Investment', platform: 'Telegram', risk: 'Medium', details: 'Crypto Doubling Bot', date: '2026-03-20' },
    { id: 3, type: 'Lottery', platform: 'Instagram', risk: 'High', details: 'Fake Brand Giveaway', date: '2026-03-19' },
    { id: 4, type: 'Job Fraud', platform: 'WhatsApp', risk: 'High', details: 'Work from home scam', date: '2026-03-18' },
    { id: 5, type: 'Bank Alert', platform: 'Telegram', risk: 'Critical', details: 'Fake KYC Update', date: '2026-03-17' },
    { id: 6, type: 'Impersonation', platform: 'WhatsApp', risk: 'High', details: 'Relative in distress scam', date: '2026-03-16' },
    { id: 7, type: 'Phishing', platform: 'Instagram', risk: 'Medium', details: 'Copyright Violation Warning', date: '2026-03-15' },
    { id: 8, type: 'Crypto Fraud', platform: 'Telegram', risk: 'Critical', details: 'Fake Wallet Recovery', date: '2026-03-14' },
    { id: 9, type: 'Ecommerce', platform: 'WhatsApp', risk: 'High', details: 'Unpaid Customs Duty Scam', date: '2026-03-13' },
    { id: 10, type: 'Romance Scam', platform: 'Instagram', risk: 'Medium', details: 'Catfishing Identity Fraud', date: '2026-03-12' },
    { id: 11, type: 'Tech Support', platform: 'Telegram', risk: 'High', details: 'Remote Access Tool scam', date: '2026-03-11' },
    { id: 12, type: 'Govt Fraud', platform: 'WhatsApp', risk: 'Critical', details: 'Tax Refund Phishing', date: '2026-03-10' }
  ];

  const filteredScams = scamDatabase.filter(scam => 
    scam.details.toLowerCase().includes(scamSearchQuery.toLowerCase()) ||
    scam.platform.toLowerCase().includes(scamSearchQuery.toLowerCase()) ||
    scam.type.toLowerCase().includes(scamSearchQuery.toLowerCase())
  );

  const backgroundImages = [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=2070',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2070'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const modules = [
    {
      title: 'Instagram Module',
      icon: <Instagram className="w-8 h-8 text-pink-500" />,
      desc: 'Real-time feed, stories & AI profile risk analysis.',
      link: '/instagram',
      color: 'from-pink-500/20 to-purple-500/20',
      glow: 'group-hover:shadow-pink-500/40'
    },
    {
      title: 'WhatsApp Module',
      icon: <Phone className="w-8 h-8 text-emerald-500" />,
      desc: 'Live chats with spam tracking & origin analysis.',
      link: '/whatsapp',
      color: 'from-emerald-500/20 to-teal-500/20',
      glow: 'group-hover:shadow-emerald-500/40'
    },
    {
      title: 'Telegram Module',
      icon: <MessageSquare className="w-8 h-8 text-blue-500" />,
      desc: 'Secure messaging with NLP scam detection.',
      link: '/telegram',
      color: 'from-blue-500/20 to-cyan-500/20',
      glow: 'group-hover:shadow-blue-500/40'
    },
    {
      title: 'AI Analyzer',
      icon: <Search className="w-8 h-8 text-amber-500" />,
      desc: 'OCR-powered forensic analysis of screenshots.',
      link: '/analyzer',
      color: 'from-amber-500/20 to-orange-500/20',
      glow: 'group-hover:shadow-amber-500/40'
    },
    {
      title: 'URL Sandbox',
      icon: <Globe className="w-8 h-8 text-cyan-500" />,
      desc: 'Deep-pattern phishing analysis for suspicious links.',
      link: '/url-sandbox',
      color: 'from-cyan-500/20 to-blue-500/20',
      glow: 'group-hover:shadow-cyan-500/40'
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Inter',sans-serif] selection:bg-cyan-500/30 relative overflow-x-hidden">
      
      {/* Animated Background Slider */}
      <div className="fixed inset-0 z-0">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentBgIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImages[currentBgIndex]})` }}
          />
        </AnimatePresence>
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#020617]/70 to-[#020617]/95"></div>
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
      </div>

      {/* Decorative Glows */}
      <div className="fixed inset-0 pointer-events-none z-1">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[150px] rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8 relative z-10">
        {/* Navbar */}
        <header className="flex items-center justify-between mb-16 bg-white/5 backdrop-blur-xl border border-white/10 p-4 px-8 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-2xl group-hover:rotate-[360deg] transition-transform duration-1000 shadow-lg shadow-cyan-500/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SocialShield</h1>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] leading-none">Cyber Defense Hub</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-slate-300 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-2.5 rounded-xl text-sm font-black transition-all shadow-xl shadow-blue-600/20 active:scale-95 border border-white/10">
              Register Now
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-8">
              <Activity className="w-3 h-3 animate-pulse" /> Live Security Active
            </div>
            <h2 className="text-6xl lg:text-8xl font-black mb-6 tracking-tighter leading-none">
              Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Social Intelligence.</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
              Unified real-time dashboard for proactive scam detection, profile auditing, and secure social interaction across all platforms.
            </p>
          </motion.div>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {modules.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Link to={m.link} className={`block h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 transition-all duration-500 relative overflow-hidden ${m.glow} hover:bg-white/[0.08] hover:border-white/20`}>
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${m.color} blur-[50px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                    {m.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 group-hover:text-cyan-400 transition-colors">{m.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                    {m.desc}
                  </p>
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                    Launch Module <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Widgets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Global Network widget */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-amber-500/20 p-4 rounded-[1.5rem] border border-amber-500/30">
                    <Globe className="w-8 h-8 text-amber-400 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">Global Threat Intelligence</h3>
                    <p className="text-amber-400/60 text-xs font-bold uppercase tracking-widest">Network Status: Optimized</p>
                  </div>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed max-w-lg mb-12 font-medium">
                  Our neural network analyzes millions of cross-platform patterns to identify scammers before they reach your inbox.
                </p>
              </div>
              <button 
                onClick={() => setShowScamDatabase(true)}
                className="inline-flex items-center gap-4 bg-white text-black font-black px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] group/btn"
              >
                View Scam Database <Search className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
              </button>
              <button 
                onClick={() => setShowHealthCheck(true)}
                className="inline-flex items-center gap-4 bg-transparent border-2 border-cyan-500/50 text-cyan-400 font-black px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all group/btn2"
              >
                Security Health Check <ShieldCheck className="w-6 h-6 group-hover/btn2:scale-110 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Scam Database Modal */}
          <AnimatePresence>
            {showScamDatabase && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#020617]/90 backdrop-blur-2xl"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-[#0f172a] border border-white/10 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/30">
                        <Globe className="w-6 h-6 text-amber-400" />
                      </div>
                      <h3 className="text-2xl font-black">Live Threat Intelligence</h3>
                    </div>
                    <button 
                      onClick={() => setShowScamDatabase(false)}
                      className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
                    >
                      <CloseIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-8">
                    <div className="relative mb-8 group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search patterns, platforms, or threat levels..." 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-cyan-500/50 transition-all font-medium"
                        value={scamSearchQuery}
                        onChange={(e) => setScamSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                      {filteredScams.map((scam) => (
                        <div key={scam.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex flex-wrap md:flex-nowrap items-center justify-between gap-6 hover:bg-white/10 transition-all hover:translate-x-1">
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                              scam.risk === 'Critical' ? 'bg-rose-500/20 border-rose-500/30' : 
                              scam.risk === 'High' ? 'bg-orange-500/20 border-orange-500/30' : 
                              'bg-amber-500/20 border-amber-500/30'
                            }`}>
                              <AlertTriangle className={
                                scam.risk === 'Critical' ? 'text-rose-400' : 
                                scam.risk === 'High' ? 'text-orange-400' : 
                                'text-amber-400'
                              } />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded-md">{scam.platform}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{scam.date}</span>
                              </div>
                              <h4 className="text-xl font-bold">{scam.details}</h4>
                              <p className="text-sm text-slate-500 font-medium">{scam.type} Analysis Pattern</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Threat Level</p>
                              <p className={`font-black ${
                                scam.risk === 'Critical' ? 'text-rose-400' : 
                                scam.risk === 'High' ? 'text-orange-400' : 
                                'text-amber-400'
                              }`}>{scam.risk}</p>
                            </div>
                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                              <ArrowRight className="w-5 h-5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {filteredScams.length === 0 && (
                        <div className="text-center py-20">
                          <Search className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                          <p className="text-slate-500 font-bold">No threats found matching your search.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 bg-white/5 border-t border-white/10 text-center">
                    <p className="text-slate-500 text-sm font-medium">Real-time database powered by <span className="text-cyan-400 font-bold">SocialShield AI</span></p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Health Check Modal */}
          <AnimatePresence>
            {showHealthCheck && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#020617]/95 backdrop-blur-3xl"
              >
                <motion.div 
                  initial={{ scale: 0.8, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 50 }}
                  className="bg-[#0f172a] border border-white/10 w-full max-w-3xl rounded-[4rem] shadow-2xl overflow-hidden flex flex-col"
                >
                  <div className="p-10 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="bg-cyan-500/20 p-4 rounded-3xl border border-cyan-500/30">
                        <ShieldCheck className="w-8 h-8 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter">Security Health Check</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">AI-Powered Risk Assessment</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowHealthCheck(false)}
                      className="p-4 hover:bg-white/10 rounded-3xl transition-colors"
                    >
                      <CloseIcon className="w-8 h-8" />
                    </button>
                  </div>

                  <div className="p-10">
                    {/* Score Section */}
                    <div className="flex flex-col items-center mb-12">
                      <div className="relative w-48 h-48 mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                          <motion.circle 
                            cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552.92}
                            initial={{ strokeDashoffset: 552.92 }}
                            animate={{ strokeDashoffset: 552.92 * (1 - 0.92) }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="text-cyan-400" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-black tracking-tighter">92</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trust Score</span>
                        </div>
                      </div>
                      <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">Optimal Security Status</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: '2FA Status', status: 'Enabled', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
                        { label: 'Account Origin', status: 'Verified', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
                        { label: 'Suspicious Activity', status: 'None', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
                        { label: 'Login Locations', status: 'Trusted', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> }
                      ].map((item, i) => (
                        <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
                            <p className="font-bold text-lg">{item.status}</p>
                          </div>
                          {item.icon}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-10 bg-white/5 border-t border-white/10 flex items-center justify-between">
                    <p className="text-slate-500 text-sm font-medium italic">Last scan: 2 minutes ago</p>
                    <button 
                      onClick={() => setShowHealthCheck(false)}
                      className="bg-white text-black px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all"
                    >
                      Close Report
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Monitors Modal */}
          <AnimatePresence>
            {showMonitors && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#020617]/95 backdrop-blur-3xl"
              >
                <motion.div 
                  initial={{ scale: 0.8, rotate: 20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0.8, rotate: 20 }}
                  className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
                >
                  <div className="p-10 border-b border-white/10 flex items-center justify-between bg-cyan-500/10">
                    <div className="flex items-center gap-4">
                      <div className="bg-cyan-500/20 p-4 rounded-2xl border border-cyan-500/30">
                        <Lock className="w-8 h-8 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter text-white">Network Monitors</h3>
                        <p className="text-xs text-cyan-400/60 font-bold uppercase tracking-widest mt-1">Live Encryption Status</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowMonitors(false)}
                      className="p-4 hover:bg-white/10 rounded-3xl transition-colors"
                    >
                      <CloseIcon className="w-8 h-8 text-white" />
                    </button>
                  </div>

                  <div className="p-10 space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Active', val: '2,450', color: 'text-emerald-400' },
                        { label: 'Uptime', val: '99.9%', color: 'text-cyan-400' },
                        { label: 'Latency', val: '14ms', color: 'text-blue-400' }
                      ].map((m, i) => (
                        <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl text-center">
                          <p className="text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">{m.label}</p>
                          <p className={`text-2xl font-black ${m.color}`}>{m.val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 px-2">Regional Distribution</h4>
                      {[
                        { region: 'North America', status: 'Optimal', count: 842 },
                        { region: 'Europe / UK', status: 'Optimal', count: 615 },
                        { region: 'Asia Pacific', status: 'Optimizing', count: 993 }
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="font-bold">{r.region}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-xs font-bold text-slate-500">{r.count} Nodes</span>
                            <span className="text-[10px] font-black uppercase px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">{r.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-white/5 border-t border-white/10 flex justify-center">
                    <button 
                      onClick={() => { setShowMonitors(false); showToast('All systems recalibrated successfully.'); }}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black px-10 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-cyan-500/20"
                    >
                      RECALIBRATE NETWORK
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Real-time Stats Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 bg-gradient-to-br from-blue-600/20 to-indigo-900/20 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Zap className="w-40 h-40 text-blue-400" />
            </div>
            
            <h3 className="text-2xl font-black mb-12 flex items-center gap-3">
              <div className="w-2 h-8 bg-cyan-400 rounded-full"></div> Live Security Metrics
            </h3>

            <div className="space-y-8">
              {[
                { label: 'Threats Blocked', val: '14,209', icon: <AlertTriangle className="text-rose-400" />, color: 'rose', bg: 'bg-rose-500/10', border: 'border-rose-500/20', action: () => setShowScamDatabase(true) },
                { label: 'AI Accuracy', val: '99.8%', icon: <CheckCircle2 className="text-emerald-400" />, color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', action: () => setShowHealthCheck(true) },
                { label: 'Active Monitors', val: '2,450', icon: <Lock className="text-cyan-400" />, color: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', action: () => setShowMonitors(true) }
              ].map((stat, i) => (
                <button 
                  key={i} 
                  onClick={stat.action}
                  className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group cursor-pointer active:scale-[0.98]"
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-xl ${stat.bg} border ${stat.border} group-hover:scale-110 transition-transform`}>
                      {stat.icon}
                    </div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest group-hover:text-white transition-colors">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-black tabular-nums">{stat.val}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Particles/Elements Simulation */}
        <div className="fixed top-[15%] left-[5%] w-2 h-2 bg-cyan-400 rounded-full blur-[1px] animate-pulse"></div>
        <div className="fixed top-[40%] right-[8%] w-3 h-3 bg-blue-500 rounded-full blur-[2px] animate-ping"></div>
        <div className="fixed bottom-20 left-[12%] w-2 h-2 bg-purple-500 rounded-full blur-[1px] animate-bounce"></div>
      </div>

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 border border-white/10 px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-bold text-white">{toast.message}</span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      ` }} />
    </div>
  );
};

export default Dashboard;
