import DashboardStats from './DashboardStats';
import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn, UserButton, useUser } from "@clerk/clerk-react";
import './App.css';
import GraphView from './GraphView';

function App() {
  const [alerts, setAlerts] = useState([]);

  const { user } = useUser();
  // Grab the role from Clerk, default to 'customer' if they don't have one
  const userRole = user?.publicMetadata?.role || 'customer'; 
  // Define what this user is allowed to do
  const canUploadData = userRole === 'admin';
  const canManageCases = userRole === 'admin' || userRole === 'analyst';
  const isSupport = userRole === 'customer_support';

  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState({});
  const handleNoteChange = (alertId, text) => {
    setNotes(prev => ({ ...prev, [alertId]: text }));
  };

  const [isUploading, setIsUploading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  // Function to handle the decision button clicks
  const handleStatusUpdate = async (caseId, newStatus) => {
    try {
      const response = await fetch(`https://fintech-fraud-dashboard.onrender.com/api/alerts/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus, 
          user_id: user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Unknown User',
          note: notes[caseId] || "" // <-- NEW: Send the note if one exists!
        })
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

  // Reusable function to fetch alerts
  const loadAlerts = () => {
    fetch('https://fintech-fraud-dashboard.onrender.com/api/alerts')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') setAlerts(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch alerts:", err);
        setLoading(false);
      });
  };

  // Load alerts when the page first opens
  useEffect(() => {
    loadAlerts();
  }, []);

  // Function to handle the file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    // Package the file exactly how FastAPI expects it
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://fintech-fraud-dashboard.onrender.com/upload-csv', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        alert(data.message); // Show a success popup
        loadAlerts(); // Automatically refresh the dashboard!
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
      event.target.value = null; // Reset the input
    }
  };

  // If the user clicked the button, hide the list and show the graph!
  if (showGraph) {
    return <GraphView onBack={() => setShowGraph(false)} />;
  }

  return (
    <>
      {/* If the user is NOT logged in, send them to the Clerk Login page */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      {/* If the user IS logged in, show them the dashboard */}
      <SignedIn>
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
          <div className="max-w-6xl mx-auto">
        
            {/* Header Section */}
            <header className="mb-8 border-b border-gray-700 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-400">Fraud Detection Dashboard</h1>
                <p className="text-gray-400 mt-1">Review and investigate suspicious transactions.</p>
              </div>
              
              {/* Right Side Stats, Upload, and User Profile */}
              <div className="flex items-center gap-4">
                
                {/* Only Admins can upload new system data */}
                {canUploadData && (
                  <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors shadow-lg flex items-center gap-2 ${isUploading ? 'bg-gray-600 text-gray-300' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
                    {isUploading ? 'Processing...' : '+ Upload CSV'}
                   <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                 </label>
                )}

                <div className="bg-gray-800 px-4 py-2 rounded-lg shadow border border-gray-700">
                  <span className="text-gray-400 text-sm">Total Alerts: </span>
                  <span className="text-xl font-bold text-red-400">{alerts.length}</span>
                </div>

                {/* THE MISSING PIECE: The Clerk User Profile Avatar */}
                <div className="ml-2 pl-4 border-l border-gray-700">
                  <UserButton afterSignOutUrl="/" />
                </div>
                
              </div>
            </header>

            {/* --- NEW: Insert the Analytics Dashboard right here! --- */}
            {alerts.length > 0 && <DashboardStats alerts={alerts} />}

            {/* If there are no alerts, show a welcome message */}
            {alerts.length === 0 && !loading && (
              <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-xl text-gray-400">No alerts found. Upload a CSV to get started.</p>
              </div>
            )}

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

                      {/* Analyst Notes Section */}
                      {canManageCases && alert.status === 'Pending' && (
                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                          <textarea 
                            placeholder="Add investigation notes before making a decision..."
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                            rows="2"
                            value={notes[alert.id] || ''}
                            onChange={(e) => handleNoteChange(alert.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                      
                    {/* Action Buttons based on Role */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {canManageCases ? (
                        // Admins and Analysts see the action buttons
                        alert.status === 'Pending' ? (
                          <>
                            <button onClick={() => handleStatusUpdate(alert.id, 'True Fraud')} className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded text-sm border border-red-700 transition-colors">
                              ✓ True Fraud
                            </button>
                            <button onClick={() => handleStatusUpdate(alert.id, 'Not Fraud')} className="px-4 py-2 bg-green-900/50 hover:bg-green-800 text-green-200 rounded text-sm border border-green-700 transition-colors">
                              ✕ Not Fraud
                            </button>
                          </>
                        ) : (
                          <div className={`px-4 py-2 rounded border text-center text-sm font-medium ${alert.status === 'True Fraud' ? 'bg-red-900/20 text-red-400 border-red-800' : 'bg-green-900/20 text-green-400 border-green-800'}`}>
                            Status: {alert.status}
                          </div>
                        )
                      ) : (
                        // Customer Support just sees a read-only badge
                        <div className="px-4 py-2 rounded border border-gray-700 bg-gray-800 text-gray-400 text-center text-sm font-medium italic">
                          Read-Only View
                        </div>
                      )}

                      {/* Everyone can see the graph */}
                      <button onClick={() => setShowGraph(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors">
                        Investigate Graph
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SignedIn>
    </>
  );
}

export default App;