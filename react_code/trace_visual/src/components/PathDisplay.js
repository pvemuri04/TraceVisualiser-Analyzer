import React from 'react';
import '../styles/PathDisplay.css';

const PathDisplay = ({ path }) => {
  return (
    <div className="path-display">
      <h3>Current Path</h3>
      <div className="path">
        {path.length > 0 ? (
          path.map((item, index) => (
            <div key={index} className="path-item">
              <span>{item}</span>
              {index < path.length - 1 && <span className="path-arrow">↓</span>}
            </div>
          ))
        ) : (
          <div className="empty-path">No path selected</div>
        )}
      </div>
    </div>
  );
};

export default PathDisplay;
