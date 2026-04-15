import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';

const InstagramLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 3000);
  };

  // Redirect if already logged in
  useEffect(() => {
    const session = localStorage.getItem('instagram_session');
    if (session) {
      navigate('/instagram');
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Demo login logic
    localStorage.setItem('instagram_session', 'true');
    navigate('/instagram');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-[1100px] mx-auto w-full px-6 gap-16 md:gap-24">
        
        {/* Left Section - Hero */}
        <div className="hidden md:flex flex-col items-center text-center max-w-[500px] animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="w-full flex justify-start mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-[20px] flex items-center justify-center p-0.5">
              <div className="bg-white w-full h-full rounded-[18px] flex items-center justify-center">
                <Instagram className="w-11 h-11 text-[#262626]" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          
          <h1 className="text-[44px] font-bold leading-[1.1] tracking-tight text-[#262626] mb-14 text-left w-full">
            See everyday moments from your <br />
            <span className="bg-gradient-to-r from-[#ff3040] via-[#ee2a7b] to-[#6228d7] bg-clip-text text-transparent">close friends.</span>
          </h1>

          {/* Overlapping Stories Mockup - Higher fidelity based on screenshot */}
          <div className="relative w-full h-[400px] mt-4 flex justify-center">
            {/* Left Phone */}
            <div className="absolute left-4 bottom-4 w-[190px] aspect-[9/18] rounded-[24px] overflow-hidden shadow-2xl border-4 border-white rotate-[-10deg] z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 ring-1 ring-black/5">
              <img src="https://picsum.photos/seed/insta1/400/800" className="w-full h-full object-cover" alt="" />
            </div>
            {/* Center Phone */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[210px] aspect-[9/18] rounded-[24px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.2)] border-4 border-white z-20 animate-in fade-in slide-in-from-bottom-8 duration-700 ring-1 ring-black/5">
              <img src="https://picsum.photos/seed/insta2/400/800" className="w-full h-full object-cover" alt="" />
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-9 h-9 rounded-full border-2 border-white p-0.5 shadow-md">
                  <img src="https://i.pravatar.cc/150?u=1" className="w-full h-full rounded-full object-cover" alt="" />
                </div>
              </div>
              {/* Story Progress Bar */}
              <div className="absolute top-2 left-2 right-2 h-[2px] bg-white/30 rounded-full">
                <div className="w-1/2 h-full bg-white rounded-full"></div>
              </div>
              {/* Bottom UI Mock */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                <div className="w-10 h-10 rounded-full border border-white/50 flex items-center justify-center">
                  <span className="text-xs">Aa</span>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full border border-white/50"></div>
                </div>
              </div>
            </div>
            {/* Right Phone */}
            <div className="absolute right-4 bottom-8 w-[180px] aspect-[9/18] rounded-[24px] overflow-hidden shadow-2xl border-4 border-white rotate-[8deg] z-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500 ring-1 ring-black/5">
              <img src="https://picsum.photos/seed/insta3/400/800" className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        </div>

        {/* Vertical Divider (Desktop) */}
        <div className="hidden md:block w-px h-[520px] bg-[#dbdbdb] opacity-60"></div>

        {/* Right Section - Login Form */}
        <div className="w-full max-w-[360px] flex flex-col animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="bg-white p-8 md:p-10 flex flex-col border border-[#dbdbdb] md:border-transparent rounded-2xl">
            <h2 className="text-[18px] font-bold text-[#262626] mb-10 text-left">Log into Instagram</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Mobile number, username or email" 
                  className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-lg px-4 py-3.5 text-[14px] outline-none focus:border-[#a8a8a8] transition-colors"
                  value={formData.identifier}
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                />
              </div>
              
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-lg px-4 py-3.5 text-[14px] outline-none focus:border-[#a8a8a8] transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={!formData.identifier || formData.password.length < 6}
                className={`w-full py-2.5 rounded-xl text-[14px] font-bold transition-all mt-6 shadow-sm ${
                  formData.identifier && formData.password.length >= 6 
                    ? 'bg-[#0095f6] text-white hover:bg-[#1877f2]' 
                    : 'bg-[#0095f6]/40 text-white cursor-default'
                }`}
              >
                Log in
              </button>

              <div className="flex flex-col items-center gap-8 mt-10">
                <button 
                  type="button" 
                  onClick={() => showToast('Password reset link sent to your registered email.')}
                  className="text-[14px] font-bold text-[#262626] hover:opacity-70 transition-opacity"
                >
                  Forgot password?
                </button>
                
                <div className="w-full h-px bg-transparent"></div>

                <div className="w-full flex flex-col gap-3">
                  <button 
                    type="button"
                    onClick={() => showToast('Log in with Facebook is temporarily unavailable.')}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 border border-[#dbdbdb] rounded-xl text-[14px] font-bold text-[#262626] hover:bg-slate-50 transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-[#1877f2] fill-[#1877f2]" />
                    Log in with Facebook
                  </button>

                  <button 
                    type="button"
                    onClick={() => navigate('/register')}
                    className="w-full py-2.5 border border-[#0095f6] rounded-xl text-[14px] font-bold text-[#0095f6] hover:bg-blue-50 transition-colors"
                  >
                    Create new account
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-14 flex flex-col items-center gap-2 opacity-80">
              <div className="flex items-center gap-1.5 text-[#8e8e8e]">
                <svg viewBox="0 0 60 12" width="60" height="12" fill="currentColor">
                  <path d="M10.2 1.2c-1.1 0-2.1.2-3.1.6C6.1 2.2 5.2 2.8 4.5 3.5c-.7.7-1.3 1.6-1.7 2.6-.4 1-.6 2-.6 3.1 0 1.1.2 2.1.6 3.1.4 1 1 1.9 1.7 2.6.7.7 1.6 1.3 2.6 1.7 1 .4 2 .6 3.1.6 1.1 0 2.1-.2 3.1-.6 1-.4 1.9-1 2.6-1.7.7-.7 1.3-1.6 1.7-2.6.4-1 .6-2 .6-3.1 0-1.1-.2-2.1-.6-3.1-.4-1-1-1.9-1.7-2.6-.7-.7-1.6-1.3-2.6-1.7-1-.4-2-.6-3.1-.6zm0 10.2c-.8 0-1.6-.2-2.3-.5-.7-.3-1.3-.8-1.8-1.4-.5-.5-1-1.2-1.2-1.9-.3-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3.3-.7.7-1.4 1.2-1.9.5-.6 1.1-1 1.8-1.4.7-.3 1.5-.5 2.3-.5.8 0 1.6.2 2.3.5.7.3 1.3.8 1.8 1.4.5.5 1 1.2 1.2 1.9.3.7.4 1.5.4 2.3 0 .8-.1 1.6-.4 2.3-.3.7-.7 1.4-1.2 1.9-.5.6-1.1 1-1.8 1.4-.7.3-1.5.5-2.3.5zM24.1 1.2h-1.8v11.4h1.8v-11.4zm6.1 0h-1.8v11.4h1.8v-11.4zm6.1 0h-1.8v11.4h1.8v-11.4z" />
                </svg>
                <span className="text-[11px] font-bold tracking-[2px] uppercase">Meta</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#262626] text-white px-6 py-3 rounded-xl shadow-2xl z-[300] animate-in slide-in-from-bottom-5 duration-300">
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="py-10 px-6 flex flex-wrap justify-center gap-x-5 gap-y-3 text-[12px] text-[#8e8e8e] max-w-[1100px] mx-auto w-full">
        {['Meta', 'About', 'Blog', 'Jobs', 'Help', 'API', 'Privacy', 'Terms', 'Locations', 'Instagram Lite', 'Threads', 'Contact Uploading & Non-Users', 'Meta Verified'].map((link, idx) => (
          <button key={idx} className="hover:underline transition-all">{link}</button>
        ))}
        <div className="w-full text-center mt-6 text-[#8e8e8e]/80">
          © 2026 Instagram from Meta
        </div>
      </footer>
    </div>
  );
};

export default InstagramLogin;
