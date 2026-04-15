import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  ArrowLeft, Download, MessageSquare, User, Clock, 
  TrendingUp, Search, AlertTriangle, ShieldCheck, 
  ThumbsUp, ThumbsDown, Meh, BarChart3, PieChart as PieChartIcon,
  Activity, Hash, Clock3, Zap, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const SENTIMENT_COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#94a3b8'
};

const ChatAnalytics = () => {
  const navigate = useNavigate();
  const [inputData, setInputData] = useState('');
  const [analyzedData, setAnalyzedData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock Analysis Logic (to be replaced by actual parser)
  const performAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate parsing and computation
    setTimeout(() => {
      const mockInsights = {
        totalMessages: 1284,
        mostActiveUser: "Rohit Gupta",
        userDistribution: [
          { name: 'Rohit Gupta', count: 542 },
          { name: 'Aryan Gupta', count: 328 },
          { name: 'Isha Patel', count: 215 },
          { name: 'Siddharth Sharma', count: 199 }
        ],
        dailyActivity: [
          { day: 'Mon', count: 120 },
          { day: 'Tue', count: 150 },
          { day: 'Wed', count: 180 },
          { day: 'Thu', count: 140 },
          { day: 'Fri', count: 210 },
          { day: 'Sat', count: 280 },
          { day: 'Sun', count: 204 }
        ],
        peakHours: [
          { hour: '08:00', count: 20 },
          { hour: '10:00', count: 45 },
          { hour: '12:00', count: 60 },
          { hour: '14:00', count: 85 },
          { hour: '16:00', count: 70 },
          { hour: '18:00', count: 120 },
          { hour: '20:00', count: 150 },
          { hour: '22:00', count: 90 }
        ],
        sentiment: [
          { name: 'Positive', value: 45, color: '#22c55e' },
          { name: 'Neutral', value: 35, color: '#94a3b8' },
          { name: 'Negative', value: 20, color: '#ef4444' }
        ],
        frequentWords: [
          { word: 'okay', count: 84 },
          { word: 'thanks', count: 62 },
          { word: 'meeting', count: 45 },
          { word: 'send', count: 38 },
          { word: 'good', count: 35 }
        ],
        avgResponseTime: "12 minutes",
        suspiciousBehavior: [
          { type: 'High Frequency', detail: 'Rapid bursts of messages detected at 2:00 AM' },
          { type: 'Spam Pattern', detail: 'Repetitive promotional link sharing from user Aryan' }
        ],
        patterns: "Consistent evening activity with primarily positive sentiment. Frequent use of professional terminology."
      };
      setAnalyzedData(mockInsights);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b141a] p-4 md:p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-[#202c33] rounded-full transition-colors dark:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold dark:text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-[#00a884]" />
              WhatsApp Insights
            </h1>
          </div>
          {analyzedData && (
            <button className="flex items-center gap-2 px-4 py-2 bg-[#00a884] text-white rounded-lg font-bold hover:bg-[#008f6f] transition-all shadow-md active:scale-95">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          )}
        </div>

        {!analyzedData ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#111b21] rounded-2xl p-6 md:p-10 shadow-xl border border-slate-200 dark:border-[#202c33]"
          >
            <h2 className="text-xl font-bold dark:text-white mb-4">Chat Data Input</h2>
            <p className="text-slate-500 dark:text-[#8696a0] mb-6">Paste your WhatsApp chat export data below to generate detailed insights and visualizations.</p>
            
            <textarea 
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="[10/19/23, 14:15:30] Rohit: Hello!
[10/19/23, 14:16:05] Aryan: Hey, how are you?..."
              className="w-full h-64 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-slate-800 rounded-xl p-4 dark:text-white focus:ring-2 focus:ring-[#00a884] outline-none transition-all resize-none custom-scrollbar mb-6"
            />
            
            <button 
              onClick={performAnalysis}
              disabled={!inputData.trim() || isAnalyzing}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                !inputData.trim() || isAnalyzing 
                ? 'bg-slate-100 dark:bg-[#202c33] text-slate-400 cursor-not-allowed' 
                : 'bg-[#00a884] text-white hover:bg-[#008f6f] shadow-lg active:scale-[0.98]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Chat Data...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  Generate Analytics
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Messages', value: analyzedData.totalMessages, icon: MessageSquare, color: 'text-blue-500' },
                { label: 'Most Active', value: analyzedData.mostActiveUser.split(' ')[0], icon: User, color: 'text-green-500' },
                { label: 'Avg. Response', value: analyzedData.avgResponseTime, icon: Clock3, color: 'text-amber-500' },
                { label: 'Top Word', value: analyzedData.frequentWords[0].word, icon: Hash, color: 'text-purple-500' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-[#111b21] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-[#202c33] flex flex-col items-center text-center"
                >
                  <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                  <span className="text-2xl font-bold dark:text-white">{stat.value}</span>
                  <span className="text-xs text-slate-500 dark:text-[#8696a0] uppercase tracking-wider mt-1">{stat.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Message Distribution */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-[#111b21] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#202c33]"
              >
                <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-blue-500" />
                  Message Distribution
                </h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyzedData.userDistribution}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {analyzedData.userDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Weekly Activity */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-[#111b21] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#202c33]"
              >
                <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Weekly Activity
                </h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyzedData.dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8696a0' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8696a0' }} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0, 168, 132, 0.1)' }}
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Bar dataKey="count" fill="#00a884" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Peak Hours */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#111b21] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#202c33]"
              >
                <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Peak Chatting Hours
                </h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyzedData.peakHours}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#8696a0' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8696a0' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#f59e0b" fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Sentiment Analysis */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#111b21] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#202c33]"
              >
                <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Sentiment Analysis
                </h3>
                <div className="space-y-4">
                  {analyzedData.sentiment.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="dark:text-white flex items-center gap-2">
                          {item.name === 'Positive' && <ThumbsUp className="w-4 h-4 text-green-500" />}
                          {item.name === 'Negative' && <ThumbsDown className="w-4 h-4 text-red-500" />}
                          {item.name === 'Neutral' && <Meh className="w-4 h-4 text-slate-400" />}
                          {item.name}
                        </span>
                        <span className="font-bold dark:text-white">{item.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-[#202c33] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.value}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-slate-50 dark:bg-[#202c33] rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-[#8696a0]">
                    <span className="font-bold">Observation:</span> {analyzedData.patterns}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Suspicious Activity & Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white dark:bg-[#111b21] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#202c33]">
                <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  Suspicious Activity Detected
                </h3>
                <div className="space-y-3">
                  {analyzedData.suspiciousBehavior.map((item, i) => (
                    <div key={i} className="p-4 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
                        <ShieldCheck className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="font-bold dark:text-white text-sm">{item.type}</h4>
                        <p className="text-xs text-slate-500 dark:text-[#8696a0] mt-1">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#111b21] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#202c33]">
                <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00a884]" />
                  Common Words
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analyzedData.frequentWords.map((item, i) => (
                    <div 
                      key={i} 
                      className="px-3 py-1.5 bg-slate-100 dark:bg-[#202c33] rounded-full text-sm dark:text-white border border-slate-200 dark:border-slate-800 flex items-center gap-2 hover:bg-[#00a884] hover:text-white hover:border-[#00a884] transition-all cursor-default"
                    >
                      <span className="font-bold opacity-50">#</span>
                      {item.word}
                      <span className="text-[10px] opacity-60 ml-1">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Final Conclusion */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#00a884] text-white p-8 rounded-2xl shadow-lg relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-32 h-32" />
              </div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8" />
                Data Analyst Conclusion
              </h2>
              <p className="text-lg opacity-90 leading-relaxed max-w-3xl">
                The chat exhibits a healthy and professional interaction pattern. With an average response time of {analyzedData.avgResponseTime} and a predominantly {analyzedData.sentiment[0].name.toLowerCase()} sentiment, the communication is efficient and constructive. However, the identified {analyzedData.suspiciousBehavior[0].type.toLowerCase()} at night should be monitored to ensure it doesn't represent automated bot activity or unauthorized access.
              </p>
            </motion.div>

            <button 
              onClick={() => setAnalyzedData(null)}
              className="w-full py-4 border-2 border-slate-200 dark:border-[#202c33] rounded-xl font-bold dark:text-white hover:bg-slate-100 dark:hover:bg-[#202c33] transition-all mb-10"
            >
              Start New Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAnalytics;
