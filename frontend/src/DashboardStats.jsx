import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardStats({ alerts }) {
  // 1. Calculate the data for the Pie Chart (Status Distribution)
  const statusData = useMemo(() => {
    const counts = { Pending: 0, 'True Fraud': 0, 'Not Fraud': 0 };
    alerts.forEach(a => {
      if (counts[a.status] !== undefined) counts[a.status]++;
    });
    return [
      { name: 'Pending', value: counts['Pending'], color: '#facc15' },    // Yellow
      { name: 'True Fraud', value: counts['True Fraud'], color: '#ef4444' }, // Red
      { name: 'Not Fraud', value: counts['Not Fraud'], color: '#22c55e' }  // Green
    ];
  }, [alerts]);

  // 2. Calculate Top 5 Riskiest Transactions for the Bar Chart
  const topRisky = useMemo(() => {
    return [...alerts]
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 5)
      .map(a => ({
        name: `TXN: ${a.transaction_id.substring(0, 6)}...`,
        score: a.risk_score,
        amount: a.amount
      }));
  }, [alerts]);

  // 3. Quick Stats Cards
  const totalValueAtRisk = alerts
    .filter(a => a.status === 'Pending')
    .reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);

  return (
    <div className="mb-8 space-y-4">
      
      {/* Top Row: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Total Alerts</h3>
          <p className="text-3xl font-bold text-white mt-1">{alerts.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Pending Action</h3>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{statusData[0].value}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Value at Risk (Pending)</h3>
          <p className="text-3xl font-bold text-red-400 mt-1">${totalValueAtRisk.toLocaleString()}</p>
        </div>
      </div>

      {/* Bottom Row: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pie Chart */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md h-72 flex flex-col">
          <h3 className="text-gray-300 font-semibold mb-2">Alert Status Distribution</h3>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md h-72 flex flex-col">
          <h3 className="text-gray-300 font-semibold mb-2">Top 5 Highest Risk Scores</h3>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRisky} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={80} stroke="#9ca3af" fontSize={12} />
                <Tooltip cursor={{fill: '#374151'}} contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }} />
                <Bar dataKey="score" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}