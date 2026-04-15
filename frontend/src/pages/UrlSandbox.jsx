import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldAlert, CheckCircle2, Globe, Link as LinkIcon, AlertTriangle, ArrowRight, ShieldCheck, Zap, X, Copy } from 'lucide-react';
import { analyzeUrl } from '../api/api';

const UrlSandbox = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await analyzeUrl(url);
      if (data.success) {
        setResult(data.analysis);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-12 font-sans selection:bg-cyan-500/30">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/20 p-4 rounded-[2rem] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Globe className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter">URL Sandbox</h1>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Real-time Phishing Analysis Active
              </p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Input Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7"
          >
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
              
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <LinkIcon className="w-6 h-6 text-cyan-400" /> Sandbox Entry
              </h2>

              <form onSubmit={handleAnalyze} className="space-y-6">
                <div className="relative group/input">
                  <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Paste suspicious link here (e.g., http://amazon-verify.net)" 
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-6 outline-none focus:border-cyan-500/50 transition-all font-medium text-lg placeholder:text-slate-600"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading || !url}
                  className="w-full bg-white text-black font-black py-6 rounded-3xl text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                      Analyzing Patterns...
                    </>
                  ) : (
                    <>
                      Start Deep Scan <Zap className="w-6 h-6 fill-black" />
                    </>
                  )}
                </button>
              </form>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-center gap-4 text-rose-400"
                >
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <p className="font-bold">{error}</p>
                </motion.div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
                <h4 className="font-bold text-sm mb-1">Brand Verification</h4>
                <p className="text-xs text-slate-500 leading-relaxed">We check for typosquatting and fake brand domains.</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                <Search className="w-6 h-6 text-blue-400 mb-3" />
                <h4 className="font-bold text-sm mb-1">TLD Audit</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Scrutinizing suspicious extensions like .xyz and .zip.</p>
              </div>
            </div>
          </motion.div>

          {/* Analysis Results */}
          <div className="lg:col-span-5">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl sticky top-12"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Scan Report</h3>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      result.status === 'Malicious' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' :
                      result.status === 'Suspicious' ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' :
                      'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {result.status}
                    </div>
                  </div>

                  {/* Risk Meter */}
                  <div className="mb-10">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Risk Probability</span>
                      <span className={`text-3xl font-black ${
                        result.riskScore > 70 ? 'text-rose-400' : 
                        result.riskScore > 30 ? 'text-orange-400' : 
                        'text-emerald-400'
                      }`}>{result.riskScore}%</span>
                    </div>
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.riskScore}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${
                          result.riskScore > 70 ? 'bg-rose-500' : 
                          result.riskScore > 30 ? 'bg-orange-500' : 
                          'bg-emerald-500'
                        } shadow-[0_0_20px_rgba(244,63,94,0.3)]`}
                      />
                    </div>
                  </div>

                  {/* Findings */}
                  <div className="space-y-4 mb-10">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Search className="w-3 h-3" /> Security Findings
                    </h4>
                    {result.findings.length > 0 ? (
                      <div className="space-y-3">
                        {result.findings.map((finding, i) => (
                          <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3">
                            <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-slate-300 leading-snug">{finding}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex flex-col items-center text-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        <p className="text-sm font-bold text-emerald-400">No immediate threats detected in the URL structure.</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-cyan-500/10 border border-cyan-500/20 rounded-[2rem]">
                    <p className="text-xs text-cyan-400 font-bold leading-relaxed">
                      <strong>AI Advice:</strong> {
                        result.status === 'Malicious' ? "Avoid this site at all costs. It shows multiple signs of being a phishing attempt." :
                        result.status === 'Suspicious' ? "Proceed with extreme caution. The URL looks unusual or impersonates a brand." :
                        "The URL structure seems fine, but always be careful with links from unknown senders."
                      }
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 border border-white/5 border-dashed rounded-[3rem] p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck className="w-10 h-10 text-slate-700" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-600 mb-2">Ready for Scan</h3>
                  <p className="text-sm text-slate-700 max-w-[200px]">Paste a URL to start the deep-pattern sandbox analysis.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlSandbox;