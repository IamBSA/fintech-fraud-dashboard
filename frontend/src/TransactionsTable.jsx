import React, { useState, useEffect } from 'react';

export default function TransactionsTable({ userRole }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch the raw transactions from our new Python endpoint
    fetch('https://fintech-fraud-dashboard.onrender.com/api/transactions')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setTransactions(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch transactions", err);
        setLoading(false);
      });
  }, []);

  // Filter the table based on the search bar
  const filteredTransactions = transactions.filter(tx => 
    tx.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.sender_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.receiver_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.device_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center text-gray-400 mt-20 animate-pulse">Loading ledger...</p>;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl overflow-hidden">
      
      {/* Search Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-blue-400">Master Transaction Ledger</h2>
        <input 
          type="text" 
          placeholder="Search ID, Account, or Device..." 
          className="bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* The Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900/80 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3">Transaction ID</th>
              <th className="px-6 py-3">Sender</th>
              <th className="px-6 py-3">Receiver</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Device ID</th>
              <th className="px-6 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx, idx) => (
              <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-300">{tx.transaction_id}</td>
                <td className="px-6 py-4">{tx.sender_id}</td>
                <td className="px-6 py-4">{tx.receiver_id}</td>
                <td className="px-6 py-4 font-bold text-gray-200">${parseFloat(tx.amount).toFixed(2)}</td>
                <td className="px-6 py-4 text-xs font-mono">{tx.device_id}</td>
                <td className="px-6 py-4 text-xs font-mono">{tx.ip_address}</td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No transactions found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}