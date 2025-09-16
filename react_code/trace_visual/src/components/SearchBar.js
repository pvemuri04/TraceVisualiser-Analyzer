import React, { useState } from 'react';
import '../styles/SearchBar.css';



const SearchBar = ({ hierarchyData, setFilteredData, setSearchTerm }) => {
  const [classSearch, setClassSearch] = useState('');
  const [functionSearch, setFunctionSearch] = useState('');

  // Deep clone omitting 'parent' property
  const deepCloneWithoutParent = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(deepCloneWithoutParent);
    } else if (obj && typeof obj === 'object') {
      const clone = {};
      for (const key in obj) {
        if (key === 'parent') continue;
        clone[key] = deepCloneWithoutParent(obj[key]);
      }
      return clone;
    }
    return obj;
  };

  // Return only the exact matching node(s) with no children
  const findExactMatches = (nodes, term) => {
    let matches = [];
    for (const node of nodes) {
      if (node.name.toLowerCase() === term.toLowerCase()) {
        matches.push({ ...node, children: [] });
      }
      if (node.children && node.children.length > 0) {
        matches = matches.concat(findExactMatches(node.children, term));
      }
    }
    return matches;
  };


  // Search by class name only
  const handleClassChange = (e) => {
    const value = e.target.value;
    setClassSearch(value);
    setSearchTerm(value);

    if (!value.trim() && !functionSearch.trim()) {
      setFilteredData(hierarchyData);
      return;
    }

    const hierarchyCopy = deepCloneWithoutParent(hierarchyData);
    let matchedChildren = hierarchyCopy.children;
    if (value.trim()) {
      matchedChildren = findExactMatches(hierarchyCopy.children, value);
    }
    // If function search is also active, filter further
    if (functionSearch.trim()) {
      matchedChildren = filterByFunctionName(matchedChildren, functionSearch);
    }
    setFilteredData({ ...hierarchyCopy, children: matchedChildren });
  };

  // Search by function name only
  const handleFunctionChange = (e) => {
    const value = e.target.value;
    setFunctionSearch(value);

    if (!value.trim() && !classSearch.trim()) {
      setFilteredData(hierarchyData);
      return;
    }

    const hierarchyCopy = deepCloneWithoutParent(hierarchyData);
    let matchedChildren = hierarchyCopy.children;
    if (classSearch.trim()) {
      matchedChildren = findExactMatches(hierarchyCopy.children, classSearch);
    }
    if (value.trim()) {
      matchedChildren = filterByFunctionName(matchedChildren, value);
    }
    setFilteredData({ ...hierarchyCopy, children: matchedChildren });
  };

  // Helper: filter nodes by function name in message (recursive)
  const filterByFunctionName = (nodes, funcTerm) => {
    let matches = [];
    for (const node of nodes) {
      const msg = node.message ? node.message.toLowerCase() : '';
      if (msg.includes(funcTerm.toLowerCase())) {
        matches.push({ ...node, children: [] });
      }
      if (node.children && node.children.length > 0) {
        matches = matches.concat(filterByFunctionName(node.children, funcTerm));
      }
    }
    return matches;
  };

  return (
    <div className="search-bar" style={{ display: 'flex', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <input
          type="text"
          placeholder="Search by class name..."
          value={classSearch}
          onChange={handleClassChange}
        />
        {classSearch && (
          <button className="clear-button" onClick={() => handleClassChange({ target: { value: '' } })}>
            ×
          </button>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <input
          type="text"
          placeholder="Search by function name..."
          value={functionSearch}
          onChange={handleFunctionChange}
        />
        {functionSearch && (
          <button className="clear-button" onClick={() => handleFunctionChange({ target: { value: '' } })}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;