import React, { useMemo } from 'react';
import '../styles/StatsPanel.css';

const StatsPanel = ({ logData, analysisResults }) => { // Added analysisResults prop
  const stats = useMemo(() => {
    if (!analysisResults || !analysisResults.basic_analysis) return { total_entries: 0, total_exits: 0, unique_classes_count: 0, class_counts: {} };

    return analysisResults.basic_analysis.stats; // Use stats from basic_analysis
  }, [analysisResults]); // Dependency on analysisResults

  const topClasses = useMemo(() => {
    if (!analysisResults || !analysisResults.basic_analysis || !analysisResults.basic_analysis.stats || !analysisResults.basic_analysis.stats.class_counts) return [];
    return Object.entries(analysisResults.basic_analysis.stats.class_counts)
      .sort((a, b) => b[1].entries - a[1].entries)
      .slice(0, 5);
  }, [analysisResults]);

  return (
    <div className="stats-panel">
      <h3>Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Total Class Entries</div>
          <div className="stat-value">{stats.total_entries}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Total Class Exits</div>
          <div className="stat-value">{stats.total_exits}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Unique Classes</div>
          <div className="stat-value">{stats.unique_classes_count}</div>
        </div>
      </div>

      <h4>Top Classes</h4>
      <div className="class-stats">
        {topClasses.map(([className, counts], index) => (
          <div key={index} className="class-stat-item">
            <div className="class-name">{className}</div>
            <div className="class-counts">
              <span className="entry-count">Entries: {counts.entries}</span>
              <span className="exit-count">Exits: {counts.exits}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Display Unmatched Calls - New AI Feature */}
      {analysisResults && analysisResults.basic_analysis && analysisResults.basic_analysis.unmatched_calls && analysisResults.basic_analysis.unmatched_calls.length > 0 && (
        <>
          <h4>Unmatched Calls (Potential Errors)</h4>
          <div className="unmatched-calls">
            {analysisResults.basic_analysis.unmatched_calls.slice(0, 5).map((call, index) => (
              <div key={index} className="unmatched-call-item">
                <div className="call-type">{call.type.replace(/_/g, ' ')}</div>
                <div className="call-details">
                  {call.event.function_name} in {call.event.class_run} at {call.event.timestamp}
                </div>
              </div>
            ))}
            {analysisResults.basic_analysis.unmatched_calls.length > 5 && (
              <div className="more-unmatched-calls">... and {analysisResults.basic_analysis.unmatched_calls.length - 5} more</div>
            )}
          </div>
        </>
      )}

      {/* Display Aggregated Durations - New AI Feature */}
      {analysisResults && analysisResults.basic_analysis && analysisResults.basic_analysis.aggregated_durations && Object.keys(analysisResults.basic_analysis.aggregated_durations).length > 0 && (
        <>
          <h4>Function Performance (Aggregated)</h4>
          <div className="function-performance">
            {Object.entries(analysisResults.basic_analysis.aggregated_durations)
              .sort((a, b) => b[1].avg_duration - a[1].avg_duration)
              .slice(0, 5)
              .map(([funcName, data], index) => (
                <div key={index} className="func-perf-item">
                  <div className="func-name">{funcName}</div>
                  <div className="func-stats">
                    <span>Avg: {data.avg_duration.toFixed(2)}ms</span>
                    <span>Max: {data.max_duration.toFixed(2)}ms</span>
                    <span>Calls: {data.count}</span>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StatsPanel;
