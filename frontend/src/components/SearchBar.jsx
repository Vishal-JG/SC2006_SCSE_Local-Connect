import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import filterIcon from "../assets/filter.png";
import "./SearchBar.css";

const SearchBar = ({ 
  value, 
  onChange, 
  suggestions = [], 
  onSuggestionClick, 
  onFilterClick, 
  fetchResults // optional async function for backend
}) => {
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const containerRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch from backend if function is provided
  useEffect(() => {
    if (!fetchResults) return;
    if (value.trim() === "") {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const data = await fetchResults(value);
        setResults(data || []);
      } catch (err) {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [value, fetchResults]);

  // Local filtering fallback
  const filteredSuggestions = !fetchResults
    ? suggestions.filter((opt) =>
        opt.toLowerCase().includes(value.toLowerCase())
      )
    : results;

  return (
    <div className="search-bar-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          autoComplete="off"
        />
        <button 
          className="filter-btn" 
          aria-label="Filter"
          onClick={onFilterClick}
        >
          <img src={filterIcon} alt="filter" />
        </button>
      </div>

      {focused && filteredSuggestions.length > 0 && (
        <ul className="search-dropdown">
          {filteredSuggestions.map((opt, idx) => (
            <li 
              key={idx} 
              className="search-option"
              onMouseDown={() => onSuggestionClick(opt)}
            >
              {typeof opt === "string" ? opt : opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
