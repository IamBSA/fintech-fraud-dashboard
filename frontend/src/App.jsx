import { useState, useEffect } from 'react';
import './App.css';
import GraphView from './GraphView';
function App() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGraph, setShowGraph] = useState(false);
  // Function to handle the decision button clicks
  const handleStatusUpdate = async (caseId, newStatus) => {
    try {
      const response = await fetch(`https://fintech-fraud-dashboard.onrender.com/api/alerts/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, user_id: 'Analyst_1' })
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Update the UI instantly without refreshing the page
        setAlerts(alerts.map(alert => 
          alert.case_id === caseId ? { ...alert, status: newStatus } : alert
        ));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Fetch the alerts from your Python backend when the page loads
  useEffect(() => {
    fetch('https://fintech-fraud-dashboard.onrender.com/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setAlerts(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch alerts:", err);
        setLoading(false);
      });
  }, []);

  // If the user clicked the button, hide the list and show the graph!
  if (showGraph) {
    return <GraphView onBack={() => setShowGraph(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-blue-400">Fraud Detection Dashboard</h1>
            <p className="text-gray-400 mt-1">Review and investigate suspicious transactions.</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg shadow">
            <span className="text-gray-400 text-sm">Total Alerts: </span>
            <span className="text-xl font-bold text-red-400">{alerts.length}</span>
          </div>
        </header>

        {/* Alerts List */}
        {loading ? (
          <p className="text-center text-gray-400 mt-20 text-lg animate-pulse">Loading alerts...</p>
        ) : (
          <div className="grid gap-6">
            {alerts.map((alert) => (
              <div key={alert.case_id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-gray-600">
                
                {/* Left Side: Transaction Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold border border-red-500/30">
                      Score: {alert.risk_score}
                    </span>
                    <span className="text-gray-400 text-sm">Case #{alert.case_id}</span>
                    <span className="text-gray-400 text-sm">• TXN: {alert.transaction_id}</span>
                  </div>
                  
                  <div className="text-lg font-medium text-gray-200 mb-1">
                    {alert.sender_id} <span className="text-gray-500 mx-2">→</span> {alert.receiver_id}
                  </div>
                  <div className="text-blue-300 font-bold text-xl mb-3">
                    ${alert.amount.toFixed(2)}
                  </div>

                  {/* Explainability Panel (The "Why") */}
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Flagged Reasons:</p>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      {alert.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex flex-col gap-2 w-full md:w-auto min-w-[150px]">

                  {/* Show decision buttons ONLY if the status is Pending */}
                  {alert.status === 'Pending' ? (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(alert.case_id, 'True Fraud')}
                        className="bg-red-900/50 hover:bg-red-600 text-red-200 border border-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                      >
                        ✓ True Fraud
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(alert.case_id, 'Not Fraud')}
                        className="bg-green-900/50 hover:bg-green-600 text-green-200 border border-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                      >
                        ✕ Not Fraud
                      </button>
                    </>
                  ) : (
                    /* If a decision was made, show a permanent badge instead */
                    <div className={`px-4 py-2 rounded-lg text-sm font-bold text-center border ${
                      alert.status === 'True Fraud' ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-green-900/20 border-green-500 text-green-400'
                    }`}>
                      Status: {alert.status}
                    </div>
                  )}

                  {/* The Graph Button stays visible always */}
                  <button 
                    onClick={() => setShowGraph(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 mt-2 rounded-lg text-sm font-medium transition-colors w-full shadow-lg"
                  >
                    Investigate Graph
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;