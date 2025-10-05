// SearchBar.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import './SearchBar.css'; 
// Example usage: <SearchBar value={search} onChange={...} suggestions={...} ... />

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
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setFocused(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch from backend if function provided
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
        (typeof opt === "string" ? opt : opt.name)
          .toLowerCase()
          .includes(value.toLowerCase())
      )
    : results;

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!focused || filteredSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((prev) =>
        prev === -1
          ? filteredSuggestions.length - 1
          : (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length
      );
    } else if (e.key === "Enter" && highlight > -1) {
      onSuggestionClick(filteredSuggestions[highlight]);
      setFocused(false);
      setHighlight(-1);
    }
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      <div className="search-bar-input-wrapper">
        <FaSearch className="text-gray-500" style={{ marginRight: "6px" }} />
        <input
          className="search-bar-input"
          type="text"
          placeholder="Search..."
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button
          className="search-bar-filter"
          aria-label="Filter"
          onClick={onFilterClick}
          type="button"
        >
          <FaFilter />
        </button>
      </div>
      {focused && value.trim() && filteredSuggestions.length > 0 && (
        <div className="search-bar-dropdown" role="listbox">
          <div style={{ fontSize: "0.85rem", padding: "10px 18px", color: "#555", borderBottom: "1px solid #eaeaea" }}>
            Search Results
          </div>
          {filteredSuggestions.map((opt, idx) => (
            <p
              key={idx}
              role="option"
              aria-selected={highlight === idx}
              className={`search-bar-dropdown-item${highlight === idx ? " highlighted" : ""}`}
              onMouseDown={() => onSuggestionClick(opt)}
              onMouseEnter={() => setHighlight(idx)}
              style={{
                background: highlight === idx ? "#f2f6fa" : "transparent"
              }}
            >
              {typeof opt === "string" ? opt : opt.name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
