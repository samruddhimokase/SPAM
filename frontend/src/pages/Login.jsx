import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Apple, Facebook } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#111827] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Tech/Circuit Pattern Mockup */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 100h200l50 50h300l50-50h400" stroke="#4f46e5" fill="none" strokeWidth="1" />
          <path d="M1000 300h-200l-50 50h-300l-50-50h-400" stroke="#4f46e5" fill="none" strokeWidth="1" />
          <path d="M0 500h150l30 30h200l30-30h400l30 30h160" stroke="#4f46e5" fill="none" strokeWidth="1" />
          <circle cx="200" cy="100" r="3" fill="#4f46e5" />
          <circle cx="800" cy="300" r="3" fill="#4f46e5" />
          <circle cx="500" cy="500" r="3" fill="#4f46e5" />
        </svg>
      </div>

      <Link 
        to="/" 
        className="absolute top-8 left-8 px-6 py-2 rounded-full border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 transition-all z-20"
      >
        Go to Homepage
      </Link>

      <div className="w-full max-w-[500px] bg-[#1f2937] rounded-[2.5rem] shadow-2xl p-12 relative z-10 border border-slate-800">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm">Please login to your account</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 ml-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-6 py-4 bg-[#374151] border border-transparent rounded-2xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300 ml-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-6 py-4 bg-[#374151] border border-transparent rounded-2xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Remember me</span>
            </label>
            <button type="button" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password</button>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-4 rounded-2xl text-lg shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
          >
            Login
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1f2937] px-2 text-slate-500 font-bold">or</span></div>
          </div>

          <div className="space-y-3">
            <button type="button" className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-slate-700 text-white hover:bg-slate-800 transition-all text-sm font-semibold">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pjax/google.png" className="w-5 h-5" alt="" />
              Login With Google
            </button>
            <button type="button" className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-slate-700 text-white hover:bg-slate-800 transition-all text-sm font-semibold">
              <Facebook className="w-5 h-5 text-blue-500 fill-current" />
              Login With Facebook
            </button>
            <button type="button" className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-slate-700 text-white hover:bg-slate-800 transition-all text-sm font-semibold">
              <Apple className="w-5 h-5 text-white fill-current" />
              Login With Apple ID
            </button>
          </div>

          <p className="text-center text-sm text-slate-400 font-medium">
            Dont have an Account ? <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
