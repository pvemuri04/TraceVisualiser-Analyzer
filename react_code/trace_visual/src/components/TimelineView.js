import React from 'react';
import '../styles/TimelineView.css';

const TimelineView = ({ logData }) => {
  if (!logData) return <div>No data available</div>;
  
  const timestamps = Object.keys(logData).sort();
  
  return (
    <div className="timeline-view">
      <h3>Timeline View</h3>
      <div className="timeline-container">
        {timestamps.map((timestamp, index) => {
          const entry = logData[timestamp];
          if (entry.event_type === ">" || entry.event_type === "<") {
            return (
              <div 
                key={index} 
                className={`timeline-item ${entry.event_type === ">" ? 'entry' : 'exit'}`}
              >
                <div className="timeline-time">{timestamp}</div>
                <div className="timeline-content">
                  <div className="timeline-type">
                    {entry.event_type === ">" ? "Entry" : "Exit"}
                  </div>
                  <div className="timeline-class">{entry.class_run}</div>
                  <div className="timeline-message">{entry.message}</div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default TimelineView;