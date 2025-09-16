import React, { useState, useEffect } from 'react';
import ClassTree from './components/ClassTree';
import PathDisplay from './components/PathDisplay';
import SearchBar from './components/SearchBar';
import TimelineView from './components/TimelineView';
import StatsPanel from './components/StatsPanel';
import AIAnalysisPanel from './components/AIAnalysisPanel'; // New import
import { transformLogData } from './utils/dataTransformer';
import './App.css';

function App() {
  const [logData, setLogData] = useState({}); // Changed to empty object to avoid null checks everywhere
  const [hierarchyData, setHierarchyData] = useState(null);
  const [selectedPath, setSelectedPath] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' or 'timeline'
  const [searchedFunction, setSearchedFunction] = useState(null); // New state for searched function
  const [analysisResults, setAnalysisResults] = useState(null); // New state for AI analysis results
  const [highlightedLogEntry, setHighlightedLogEntry] = useState(null); // New state for highlighting in ClassTree
  const [totalLogEntries, setTotalLogEntries] = useState(0); // New state for total log entries
  const [loading, setLoading] = useState(true); // New loading state

    useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch initial log chunk
        const logChunkResponse = await fetch('http://localhost:5000/api/log_chunk?offset=0&limit=1000');
        const logChunkData = await logChunkResponse.json();
        setLogData(logChunkData.chunk);
        setTotalLogEntries(logChunkData.total_entries);

        // Transform the initial chunk for hierarchy
        const transformed = transformLogData(logChunkData.chunk);
        setHierarchyData(transformed);
        setFilteredData(transformed);

        // Fetch AI analysis results
        const analysisResponse = await fetch('http://localhost:5000/api/analysis');
        const analysisData = await analysisResponse.json();
        setAnalysisResults(analysisData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run once on mount

  const fetchMoreLogData = async (offset, limit) => {
    try {
      const response = await fetch(`http://localhost:5000/api/log_chunk?offset=${offset}&limit=${limit}`);
      const data = await response.json();
      setLogData(prevLogData => ({ ...prevLogData, ...data.chunk }));
      // Re-transform hierarchy data with new log data
      const transformed = transformLogData({ ...logData, ...data.chunk });
      setHierarchyData(transformed);
      setFilteredData(transformed);
      return data.has_more; // Return if there's more data
    } catch (error) {
      console.error("Error fetching more log data:", error);
      return false;
    }
  };

  const handleNodeSelect = (path, node) => { // Added node parameter
    setSelectedPath(path);
    if (node && node.functionName) {
      setSearchedFunction(node.functionName); // Highlight function in timeline
    } else {
      setSearchedFunction(null);
    }
  };

  const navigateToClassTreeAndHighlight = (logEntry) => {
    setActiveTab('tree'); // Switch to Class Tree tab
    setHighlightedLogEntry(logEntry); // Set the log entry to highlight
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading class data...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Class Entry/Exit Visualization</h1>
      </header>
      
      <div className="app-container">
        <aside className="sidebar">
          <PathDisplay path={selectedPath} />
          <StatsPanel logData={logData} analysisResults={analysisResults} />
        </aside>
        
        <main className="main-content">
          <div className="controls">
            <SearchBar 
              hierarchyData={hierarchyData}
              setFilteredData={setFilteredData}
              setSearchTerm={setSearchTerm}
            />
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'tree' ? 'active' : ''}`}
                onClick={() => setActiveTab('tree')}
              >
                Class Tree
              </button>
              <button 
                className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                Timeline
              </button>
              <button 
                className={`tab ${activeTab === 'ai_analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai_analysis')}
              >
                AI Analysis
              </button>
            </div>
          </div>
          
          <div className="view-container">
            {activeTab === 'tree' ? (
              <ClassTree 
                data={filteredData} 
                onNodeSelect={handleNodeSelect} 
                highlightedLogEntry={highlightedLogEntry} // New prop
              />
            ) : activeTab === 'timeline' ? (
              <TimelineView
                logData={logData}
                searchedFunction={searchedFunction}
                totalLogEntries={totalLogEntries}
                fetchMoreLogData={fetchMoreLogData} // New prop
              />
            ) : (
              <AIAnalysisPanel
                analysisResults={analysisResults}
                onNavigateToClassTree={navigateToClassTreeAndHighlight} // New prop
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;