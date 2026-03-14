import { useState, useEffect, useCallback } from 'react';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';

export default function GraphView({ onBack }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Fetch the network data from the backend
  useEffect(() => {
    fetch('https://fintech-fraud-dashboard.onrender.com/api/network')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      });
  }, []);

  // These functions allow you to drag and drop the nodes around the screen!
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-10 shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-blue-400">Transaction Provenance Graph</h2>
          <p className="text-gray-400 text-sm">Drag the accounts around to untangle the transaction network.</p>
        </div>
        <button 
          onClick={onBack} 
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          ← Back to Alerts
        </button>
      </div>

      {/* The React Flow Canvas */}
      <div className="flex-1 w-full h-full">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#374151" gap={20} size={1.5} />
          <Controls className="bg-gray-800 fill-white" />
        </ReactFlow>
      </div>
    </div>
  );
}