import React, { useState } from 'react';
import '../styles/AIAnalysisPanel.css';

const AIAnalysisPanel = ({ analysisResults, onNavigateToClassTree }) => {
  const [showAllUnmatched, setShowAllUnmatched] = useState(false);

  if (!analysisResults || !analysisResults.ai_insights || !analysisResults.basic_analysis) {
    return <div className="ai-analysis-panel">Loading AI Analysis...</div>;
  }

  const { anomalous_durations, error_patterns, recommendations } = analysisResults.ai_insights;
  const { unmatched_calls } = analysisResults.basic_analysis;

  const toggleShowAllUnmatched = () => {
    setShowAllUnmatched(!showAllUnmatched);
  };

  const displayedUnmatchedCalls = showAllUnmatched ? unmatched_calls : unmatched_calls.slice(0, 10);

  return (
    <div className="ai-analysis-panel">
      <h2>AI-Powered Analysis & Recommendations</h2>

      <div className="analysis-section recommendations">
        <h3>Recommendations</h3>
        {recommendations && recommendations.length > 0 ? (
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        ) : (
          <p>No specific recommendations at this time.</p>
        )}
      </div>

      <div className="analysis-section performance-anomalies">
        <h3>Performance Anomalies</h3>
        {anomalous_durations && anomalous_durations.length > 0 ? (
          anomalous_durations.map((anomaly, index) => (
            <div key={index} className="anomaly-item">
              <strong>{anomaly.function_name}</strong>
              <p>{anomaly.explanation}</p>
            </div>
          ))
        ) : (
          <p>No significant performance anomalies detected.</p>
        )}
      </div>

      <div className="analysis-section error-patterns">
        <h3>Recurring Error Patterns</h3>
        {error_patterns && error_patterns.length > 0 ? (
          error_patterns.map((pattern, index) => (
            <div key={index} className="error-pattern-item">
              <strong>{pattern.function_name}</strong>
              <p>{pattern.explanation}</p>
              <pre className="sample-message">{pattern.sample_message}</pre>
            </div>
          ))
        ) : (
          <p>No recurring error patterns found.</p>
        )}
      </div>

      <div className="analysis-section unmatched-calls">
        <h3>Unmatched Calls</h3>
        {unmatched_calls && unmatched_calls.length > 0 ? (
          <>
            <div className="unmatched-calls-list">
              {displayedUnmatchedCalls.map((call, index) => (
                <div
                  key={index}
                  className="unmatched-call-item"
                  onClick={() => onNavigateToClassTree(call.event)}
                >
                  <div className="call-type">{call.type.replace(/_/g, ' ')}</div>
                  <div className="call-details">
                    {call.event.function_name} in {call.event.class_run} at {call.event.timestamp}
                  </div>
                </div>
              ))}
            </div>
            {unmatched_calls.length > 10 && (
              <button onClick={toggleShowAllUnmatched} className="show-more-button">
                {showAllUnmatched ? 'Show Less' : `Show ${unmatched_calls.length - 10} More`}
              </button>
            )}
          </>
        ) : (
          <p>No unmatched calls detected.</p>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisPanel;
