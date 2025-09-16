import React, { useState } from 'react';
import '../styles/ClassTree.css';

const StatementNode = ({ statement }) => {
  const isAssert = statement.type === 'A';
  
  return (
    <div className={`statement-node ${isAssert ? 'assert' : 'debug'}`}>
      <div className="statement-header">
        <span className="statement-type">{isAssert ? 'Assert' : 'Debug'}</span>
        {statement.timestamp && <span className="statement-timestamp">{statement.timestamp}</span>}
      </div>
      <div className="statement-message">{statement.message}</div>
    </div>
  );
};
const ClassNode = ({ node, onNodeSelect, level = 0, path = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const currentPath = [...path, node.name];
  
  const handleClick = () => {
    setExpanded(!expanded);
    onNodeSelect(currentPath);
  };
  
  return (
    <div className="node-container">
      <div 
        className={`class-node ${expanded ? 'expanded' : ''}`} 
        onClick={handleClick}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="node-header">
          <span className="node-name">{node.name}</span>
          {node.timestamp && <span className="node-timestamp">{node.timestamp}</span>}
        </div>
        {node.message && <div className="node-message">{node.message}</div>}
      </div>

      {expanded && node.statements && node.statements.length > 0 && (
        <div className="statements-container" style={{ marginLeft: `${level * 20 + 20}px` }}>
          {node.statements.map((statement, index) => (
            <StatementNode key={index} statement={statement} />
          ))}
        </div>
      )}
      
      {expanded && node.children && node.children.length > 0 && (
        <div className="children-container">
          {node.children.map((child, index) => (
            <React.Fragment key={index}>
              {index < node.children.length  && (
                <div className="arrow-container">
                  <svg width="30" height="40">
                    <defs>
                      <marker
                        id={`arrowhead-vert-${level}-${index}`}
                        markerWidth="10"
                        markerHeight="7"
                        refX="5"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#3498db" />
                      </marker>
                    </defs>
                    <line
                      x1="15"
                      y1="10%"
                      x2="15"
                      y2="90%"
                      stroke="#3498db"
                      strokeWidth="2"
                      markerEnd={`url(#arrowhead-vert-${level}-${index})`}
                    />
                  </svg>
                </div>
              )}
              <ClassNode 
                node={child} 
                onNodeSelect={onNodeSelect} 
                level={level + 1}
                path={currentPath}
              />
              
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

const ClassTree = ({ data, onNodeSelect }) => {
  if (!data || !data.children || data.children.length === 0) {
    return <div className="empty-tree">No data available</div>;
  }

  return (
    <div className="class-tree">
      <h2>Class Hierarchy Visualization</h2>
      {data.children.map((node, index) => (
        <React.Fragment key={index}>
          <ClassNode node={node} onNodeSelect={onNodeSelect} />
          {index < data.children.length - 1 && (
            <div className="arrow-container">
              <svg width="30" height="40">
                <defs>
                  <marker
                    id={`arrowhead-root-vert-${index}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="5"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3498db" />
                  </marker>
                </defs>
                <line
                  x1="15"
                  y1="10%"
                  x2="15"
                  y2="90%"
                  stroke="#3498db"
                  strokeWidth="2"
                  markerEnd={`url(#arrowhead-root-vert-${index})`}
                />
              </svg>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ClassTree;