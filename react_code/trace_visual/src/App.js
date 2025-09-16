import React, { useState, useEffect } from 'react';
import ClassTree from './components/ClassTree';
import PathDisplay from './components/PathDisplay';
import SearchBar from './components/SearchBar';
import TimelineView from './components/TimelineView';
import StatsPanel from './components/StatsPanel';
import { transformLogData } from './utils/dataTransformer';
import './App.css';

// Sample data - replace with actual data fetching
import sampleData from './parser/parsed_log.json';

function App() {
  const [logData, setLogData] = useState(null);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [selectedPath, setSelectedPath] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' or 'timeline'

    useEffect(() => {
    // In a real app, you would fetch the data from your API or server
    // For now, we'll use the sample data
    const fetchData = async () => {
      try {
        // Simulating API call with setTimeout
        setTimeout(() => {
          setLogData(sampleData);
          const transformed = transformLogData(sampleData);
          setHierarchyData(transformed);
          setFilteredData(transformed);
        }, 500);
        
        // In a real app, you would do something like:
        // const response = await fetch('/api/parsed_log.json');
        // const data = await response.json();
        // setLogData(data);
        // setHierarchyData(transformLogData(data));
      } catch (error) {
        console.error("Error fetching log data:", error);
      }
    };
    
    fetchData();
  }, []);



  const handleNodeSelect = (path) => {
    setSelectedPath(path);
  };

  if (!logData || !hierarchyData) {
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
          <StatsPanel logData={logData} />
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
            </div>
          </div>
          
          <div className="view-container">
            {activeTab === 'tree' ? (
              <ClassTree 
                data={filteredData} 
                onNodeSelect={handleNodeSelect} 
              />
            ) : (
              <TimelineView logData={logData} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;