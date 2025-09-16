export function transformLogData(logData) {
  const result = {
    name: "root",
    children: [],
    path: []
  };
  
  const stack = [result];

  const getSeverity = (message) => {
    if (!message) return 'INFO';
    const lowerCaseMessage = message.toLowerCase();
    if (lowerCaseMessage.includes('error') || lowerCaseMessage.includes('fail') || lowerCaseMessage.includes('exception')) {
      return 'ERROR';
    }
    if (lowerCaseMessage.includes('warn') || lowerCaseMessage.includes('warning')) {
      return 'WARN';
    }
    return 'INFO';
  };
  
  // Sort timestamps
  const timestamps = Object.keys(logData).sort();
  
  timestamps.forEach(timestamp => {
    const entry = logData[timestamp];
    const severity = getSeverity(entry.message); // Calculate severity for the raw entry
    entry.severity = severity; // Add severity directly to the raw entry object

    // Only process entry and exit events
    if (entry.event_type === ">" || entry.event_type === "<") {
      const className = entry.class_run; // Keep class_run for hierarchy
      const functionName = entry.function_name; // Use function_name for timeline events
      const message = entry.message;
      
      if (entry.event_type === ">") {
        // Entry event
        const newNode = {
          name: className, // Node name is class name for hierarchy
          functionName: functionName, // Store function name separately
          message: message,
          timestamp: timestamp,
          children: [],
          statements: [],
          parent: stack[stack.length - 1],
          severity: severity,
          rawEntry: entry,
        };
        
        stack[stack.length - 1].children.push(newNode);
        stack.push(newNode);
      } else if (entry.event_type === "<") {
        // Exit event - pop from stack if class name matches
        if (stack.length > 1 && stack[stack.length - 1].name === className) { 
          stack.pop();
        }
      }
    }
    else if (entry.event_type === "A" || entry.event_type === "D") {
      // Assert or Debug statement - add to current class's statements
      if (stack.length > 1) { // Make sure we have a current class
        const statement = {
          type: entry.event_type,
          message: entry.message,
          timestamp: timestamp,
          className: entry.class_run
        };
        
        stack[stack.length - 1].statements.push(statement);
      }
    }
  });
  
  return result;
}