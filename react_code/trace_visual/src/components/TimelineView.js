import React, { useEffect, useRef, useState, useMemo } from 'react';
import TimelineItem from './TimelineItem';
import '../styles/TimelineView.css';

const TimelineView = ({ logData, searchedFunction, totalLogEntries, fetchMoreLogData }) => {
  const searchedRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(1000); // Initial display limit

  useEffect(() => {
    if (searchedRef.current) {
      searchedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [searchedFunction]);

  // Process logData to identify function durations for background highlighting
  // This should be outside any conditional rendering
  const { functionDurations, minLogTime, maxLogTime, totalLogRange } = useMemo(() => {
    const localFunctionDurations = {}; 
    const activeFunctions = {}; 

    if (!logData) return { functionDurations: {}, minLogTime: 0, maxLogTime: 0, totalLogRange: 0 };

    const sortedTimestamps = Object.keys(logData).sort().slice(0, displayLimit);

    sortedTimestamps.forEach(timestamp => {
      const entry = logData[timestamp];
      const functionName = entry.function_name;
      const time = new Date(timestamp).getTime();

      if (entry.event_type === ">") {
        activeFunctions[functionName] = { startTime: time, entryEvent: entry };
      } else if (entry.event_type === "<") {
        if (activeFunctions[functionName]) {
          const { startTime, entryEvent } = activeFunctions[functionName];
          const duration = time - startTime;
          if (!localFunctionDurations[functionName]) { 
            localFunctionDurations[functionName] = [];
          }
          localFunctionDurations[functionName].push({
            startTime: startTime, // Use the actual start time
            endTime: time, // Use the actual end time
            duration: duration,
            severity: entryEvent.severity, 
          });
          delete activeFunctions[functionName];
        }
      }
    });

    const allTimestamps = Object.keys(logData).map(ts => new Date(ts).getTime());

    // Replace Math.min(...allTimestamps) and Math.max(...allTimestamps)
    let min = Infinity;
    let max = -Infinity;
    for (const time of allTimestamps) {
      if (time < min) min = time;
      if (time > max) max = time;
    }
    const minLogTime = min;
    const maxLogTime = max;
    const totalLogRange = maxLogTime - minLogTime;

    return { functionDurations: localFunctionDurations, minLogTime, maxLogTime, totalLogRange };
  }, [logData, displayLimit]);

  if (!logData) return <div>No data available</div>;
  
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="timeline-view">
      <h3>Timeline View</h3>
      <div className="timeline-container">
        {Object.keys(logData).sort().slice(0, displayLimit).map((timestamp, index) => {
          const entry = logData[timestamp];
          const isSearched = entry.function_name === searchedFunction;

          if (entry.event_type === ">" || entry.event_type === "<") {
            return (
              <TimelineItem
                key={index}
                entry={entry}
                isSearched={isSearched}
                handleItemClick={handleItemClick}
                functionDurations={functionDurations}
                minLogTime={minLogTime}
                maxLogTime={maxLogTime}
                totalLogRange={totalLogRange}
                searchedRef={isSearched ? searchedRef : null} // Pass searchedRef here
              />
            );
          }
          return null;
        })}
      </div>

      {displayLimit < totalLogEntries && (
        <button
          className="load-more-button"
          onClick={async () => {
            const hasMore = await fetchMoreLogData(displayLimit, 1000);
            if (hasMore) {
              setDisplayLimit(prevLimit => prevLimit + 1000);
            } else {
              setDisplayLimit(totalLogEntries); // Set to total to hide button if no more data
            }
          }}
        >
          Load More ({totalLogEntries - displayLimit} remaining)
        </button>
      )}

      {selectedItem && (
        <div className="timeline-detail-popup">
          <h4>Details for {selectedItem.function_name}</h4>
          <p><strong>Timestamp:</strong> {selectedItem.timestamp}</p>
          <p><strong>Event Type:</strong> {selectedItem.event_type === ">" ? "Entry" : "Exit"}</p>
          <p><strong>Function Name:</strong> {selectedItem.function_name}</p>
          <p><strong>Message:</strong> {selectedItem.message}</p>
          <p><strong>Severity:</strong> {selectedItem.severity}</p>
          {selectedItem.rawEntry && (
            <div>
              <h5>Raw Entry Data:</h5>
              <pre>{JSON.stringify(selectedItem.rawEntry, null, 2)}</pre>
            </div>
          )}
          {selectedItem.rawExit && (
            <div>
              <h5>Raw Exit Data:</h5>
              <pre>{JSON.stringify(selectedItem.rawExit, null, 2)}</pre>
            </div>
          )}
          <button onClick={() => setSelectedItem(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default TimelineView;