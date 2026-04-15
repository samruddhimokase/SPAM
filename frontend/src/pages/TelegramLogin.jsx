import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';

const TelegramLogin = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // 'idle', 'scanning', 'authorizing', 'complete'

  useEffect(() => {
    // Simulation of QR scan detection after 5 seconds
    const timer = setTimeout(() => {
      setStatus('scanning');
      setTimeout(() => {
        setStatus('authorizing');
        setTimeout(() => {
          setStatus('complete');
          setTimeout(() => {
            navigate('/telegram-clone');
          }, 1500);
        }, 2000);
      }, 1500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white text-[#222] flex flex-col items-center justify-center font-sans p-4">
      {/* AI Security Overlay for Demo */}
      <div className="fixed top-6 right-6 z-50">
        <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl shadow-emerald-500/20 animate-bounce">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm font-bold tracking-tight">AI Security: Login Monitor Active</span>
        </div>
      </div>

      <div className="max-w-[400px] w-full text-center space-y-8">
        {/* QR Code Section */}
        <div className="relative inline-block mx-auto group">
          <div className="w-[240px] h-[240px] bg-white border border-slate-100 rounded-3xl p-4 shadow-sm relative overflow-hidden">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x240&data=TelegramLoginSocialShieldDemo" 
              alt="Telegram QR Code" 
              className={`w-full h-full object-contain transition-all duration-500 ${status !== 'idle' ? 'blur-md opacity-50 scale-90' : 'opacity-100 scale-100'}`}
            />
            
            {/* Overlay Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-[#3390ec] w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10 group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.34-.14 1.1-.55 1.47-.94 1.51-.85.08-1.5-.56-2.32-1.09-1.28-.84-2-1.36-3.25-2.19-1.44-.96-.51-1.49.31-2.45.22-.25 3.96-3.62 4.03-3.94.01-.04.01-.19-.08-.27-.09-.08-.22-.05-.32-.03-.14.03-2.35 1.49-6.64 4.39-.63.43-1.2.64-1.72.63-.57-.01-1.67-.32-2.48-.59-.99-.33-1.78-.5-1.71-1.06.04-.29.42-.59 1.14-.9 4.44-1.93 7.4-3.2 8.88-3.81 4.22-1.73 5.1-2.03 5.67-2.04.13 0 .41.03.59.18.15.12.2.29.22.41.02.08.03.23.02.36z" />
                </svg>
              </div>
            </div>

            {/* Animation Overlays */}
            {status === 'scanning' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50/80 backdrop-blur-sm z-20"
              >
                <div className="w-12 h-12 border-4 border-[#3390ec] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#3390ec] font-bold text-sm">Scanning QR Code...</p>
              </motion.div>
            )}

            {status === 'authorizing' && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-50/80 backdrop-blur-sm z-20"
              >
                <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4 animate-pulse" />
                <p className="text-emerald-600 font-bold text-sm">Authenticating Device...</p>
                <p className="text-[10px] text-emerald-500 uppercase tracking-widest mt-1">AI Verified Link</p>
              </motion.div>
            )}

            {status === 'complete' && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30"
              >
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <p className="text-[#222] font-black text-xl mt-4 tracking-tight">Login Secure</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Log in to Telegram by QR Code</h1>
          
          <div className="text-left text-[15px] text-[#707579] space-y-3 px-4 max-w-[320px] mx-auto leading-relaxed">
            <div className="flex gap-3 items-start">
              <span className="bg-[#3390ec15] text-[#3390ec] w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">1</span>
              <p>Open Telegram on your phone</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-[#3390ec15] text-[#3390ec] w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">2</span>
              <p>Go to <span className="font-bold text-[#222]">Settings</span> {'>'} <span className="font-bold text-[#222]">Devices</span> {'>'} <span className="font-bold text-[#222]">Link Desktop Device</span></p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-[#3390ec15] text-[#3390ec] w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">3</span>
              <p>Point your phone at this screen to confirm login</p>
            </div>
          </div>
        </div>

        <div className="pt-8 space-y-6">
          <button className="text-[#3390ec] font-bold text-sm uppercase tracking-wider hover:bg-blue-50 px-6 py-2 rounded-xl transition-colors">
            Log in by Phone Number
          </button>
          
          <div className="pt-2">
            <button className="text-[#3390ec] font-bold text-sm uppercase tracking-wider hover:bg-blue-50 px-6 py-2 rounded-xl transition-colors">
              Log in by Passkey
            </button>
          </div>
        </div>

        {/* Security Warning Section */}
        <div className="mt-12 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Security Recommendation</p>
            <p className="text-xs text-amber-700 leading-normal">
              Always verify that the QR code is generated by <span className="font-bold">web.telegram.org</span>. SocialShield AI monitors for session hijacking attempts during QR authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramLogin;
