export function transformLogData(logData) {
  const result = {
    name: "root",
    children: [],
    path: []
  };
  
  const stack = [result];
  
  // Sort timestamps
  const timestamps = Object.keys(logData).sort();
  
  timestamps.forEach(timestamp => {
    const entry = logData[timestamp];
    
    // Only process entry and exit events
    if (entry.event_type === ">" || entry.event_type === "<") {
      const className = entry.class_run;
      const message = entry.message;
      
      if (entry.event_type === ">") {
        // Entry event
        const newNode = {
          name: className,
          message: message,
          timestamp: timestamp,
          children: [],
          parent: stack[stack.length - 1]
        };
        
        stack[stack.length - 1].children.push(newNode);
        stack.push(newNode);
      } else if (entry.event_type === "<") {
        // Exit event - pop from stack if class name matches
        if (stack[stack.length - 1].name === className) {
          stack.pop();
        }
      }
    }
  });
  
  return result;
}