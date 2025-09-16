import React, { memo } from 'react';

const TimelineItem = memo(({ entry, isSearched, handleItemClick, functionDurations, minLogTime, maxLogTime, totalLogRange, searchedRef }) => {
  // Determine background highlight for function duration
  let durationHighlightStyle = {};
  if (functionDurations[entry.function_name]) {
    const relevantDurations = functionDurations[entry.function_name].filter(d => 
      new Date(entry.timestamp).getTime() >= d.startTime && new Date(entry.timestamp).getTime() <= d.endTime
    );
    if (relevantDurations.length > 0) {
      const durationItem = relevantDurations[0]; // Take the first relevant duration
      const startOffset = ((durationItem.startTime - minLogTime) / totalLogRange) * 100;
      const endOffset = ((durationItem.endTime - minLogTime) / totalLogRange) * 100;
      const width = endOffset - startOffset;

      let bgColor = 'rgba(0,0,0,0.05)'; // Default subtle highlight
      if (durationItem.severity === 'WARN') bgColor = 'rgba(255,255,0,0.1)';
      if (durationItem.severity === 'ERROR') bgColor = 'rgba(255,0,0,0.1)';

      durationHighlightStyle = {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${startOffset}%`,
        width: `${width}%`,
        backgroundColor: bgColor,
        zIndex: 0,
        borderRadius: '5px',
      };
    }
  }

  return (
    <div 
      ref={searchedRef} // Use the passed searchedRef
      className={`timeline-item ${entry.event_type === ">" ? 'entry' : 'exit'} ${isSearched ? 'searched' : ''} severity-${entry.severity.toLowerCase()}`}
      onClick={() => handleItemClick(entry)}
    >
      {durationHighlightStyle.width && <div style={durationHighlightStyle}></div>} {/* Background highlight */}
      <div className="timeline-time">{entry.timestamp}</div>
      <div className="timeline-content">
        <div className="timeline-type">
          {entry.event_type === ">" ? "Entry" : "Exit"}
        </div>
        <div className="timeline-function">{entry.function_name}</div>
        <div className="timeline-message">{entry.message}</div>
      </div>
    </div>
  );
});

export default TimelineItem;