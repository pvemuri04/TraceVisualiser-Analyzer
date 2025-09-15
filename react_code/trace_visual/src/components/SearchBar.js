import React, { useState } from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by class name..."
        value={searchTerm}
        onChange={handleChange}
      />
      {searchTerm && (
        <button className="clear-button" onClick={() => handleChange({ target: { value: '' } })}>
          ×
        </button>
      )}
    </div>
  );
};

export default SearchBar;