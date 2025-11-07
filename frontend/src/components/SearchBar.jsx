import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaSortAmountDown, FaDollarSign, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "./SearchBar.css";

const SearchBar = ({
  value,
  onChange,
  suggestions = [],
  onSuggestionClick,
  fetchResults,
  onFilterSelect,
}) => {
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const [showFilter, setShowFilter] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
        setShowFilter(false);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      } catch {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [value, fetchResults]);

  const filteredSuggestions = !fetchResults
    ? suggestions.filter((opt) =>
        (typeof opt === "string" ? opt : opt.name)
          .toLowerCase()
          .includes(value.toLowerCase())
      )
    : results;

  const handleFilterSelect = (type) => {
    if (onFilterSelect) onFilterSelect(type);
    setShowFilter(false);
  };

  return (
    <div className="modern-searchbar" ref={containerRef}>
      <div className="search-input-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search..."
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          autoComplete="off"
        />
        <button
          className={`filter-btn ${showFilter ? "active" : ""}`}
          onClick={() => setShowFilter((prev) => !prev)}
          aria-label="Filter options"
        >
          <FaSortAmountDown />
        </button>


        <AnimatePresence>
          {showFilter && (
            <motion.ul
              className="filter-dropdown-modern"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <li onClick={() => handleFilterSelect("price")}>
                <FaDollarSign /> Sort by Price
              </li>
              <li onClick={() => handleFilterSelect("location")}>
                <FaMapMarkerAlt /> Nearest Location
              </li>
              <li onClick={() => handleFilterSelect("rating")}>
                <FaStar /> Rating
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {focused && value.trim() && filteredSuggestions.length > 0 && (
          <motion.div
            className="search-suggestions"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="suggestion-header">Search Results</div>
            {filteredSuggestions.map((opt, idx) => (
              <div
                key={idx}
                className="suggestion-item"
                onMouseDown={() => onSuggestionClick(opt)}
              >
                {typeof opt === "string" ? opt : opt.name}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
