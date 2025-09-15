import React, { useMemo } from 'react';
import '../styles/StatsPanel.css';

const StatsPanel = ({ logData }) => {
  const stats = useMemo(() => {
    if (!logData) return { totalEntries: 0, totalExits: 0, uniqueClasses: new Set(), classCounts: {} };
    
    const result = {
      totalEntries: 0,
      totalExits: 0,
      uniqueClasses: new Set(),
      classCounts: {}
    };
    
    Object.values(logData).forEach(entry => {
      if (entry.event_type === ">") {
        result.totalEntries++;
        result.uniqueClasses.add(entry.class_run);
        
        if (!result.classCounts[entry.class_run]) {
          result.classCounts[entry.class_run] = { entries: 0, exits: 0 };
        }
        result.classCounts[entry.class_run].entries++;
      }
      else if (entry.event_type === "<") {
        result.totalExits++;
        
        if (!result.classCounts[entry.class_run]) {
          result.classCounts[entry.class_run] = { entries: 0, exits: 0 };
        }
        result.classCounts[entry.class_run].exits++;
      }
    });
    
    return result;
  }, [logData]);
  
  return (
    <div className="stats-panel">
      <h3>Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Total Class Entries</div>
          <div className="stat-value">{stats.totalEntries}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Class Exits</div>
          <div className="stat-value">{stats.totalExits}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Unique Classes</div>
          <div className="stat-value">{stats.uniqueClasses.size}</div>
        </div>
      </div>
      
      <h4>Top Classes</h4>
      <div className="class-stats">
        {Object.entries(stats.classCounts)
          .sort((a, b) => b[1].entries - a[1].entries)
          .slice(0, 5)
          .map(([className, counts], index) => (
            <div key={index} className="class-stat-item">
              <div className="class-name">{className}</div>
              <div className="class-counts">
                <span className="entry-count">Entries: {counts.entries}</span>
                <span className="exit-count">Exits: {counts.exits}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default StatsPanel;