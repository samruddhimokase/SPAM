import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const ProfileAnalytics = ({ data }) => {
  // Mock data for visualization based on typical Instagram analytics
  const followerData = [
    { name: 'Mon', followers: 4000, reach: 2400 },
    { name: 'Tue', followers: 3000, reach: 1398 },
    { name: 'Wed', followers: 2000, reach: 9800 },
    { name: 'Thu', followers: 2780, reach: 3908 },
    { name: 'Fri', followers: 1890, reach: 4800 },
    { name: 'Sat', followers: 2390, reach: 3800 },
    { name: 'Sun', followers: 3490, reach: 4300 },
  ];

  const genderData = [
    { name: 'Male', value: 45 },
    { name: 'Female', value: 52 },
    { name: 'Other', value: 3 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
      <h2 className="text-xl font-bold mb-4">Profile Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Growth Chart */}
        <div className="h-64">
          <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Follower Growth & Reach</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={followerData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="followers" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="reach" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Audience Demographics */}
        <div className="h-64 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Audience Gender (AI Prediction)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProfileAnalytics;
