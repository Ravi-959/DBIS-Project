import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import LoginModal from "../pages/LoginModal.jsx";
import "../css/Navbar.css";
import {
  FaMagnifyingGlass,
  FaHeart,
  FaCommentDots,
  FaBell,
  FaChevronDown,
} from "react-icons/fa6";

const SearchBar = ({ navigate }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length > 1) {
      const timer = setTimeout(() => {
        fetchSuggestions();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`${apiUrl}/search-suggestions?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const queryParam = `query=${encodeURIComponent(query)}`;
    let searchUrl = `/category/${suggestion.category_id}`;
  
    if (suggestion.subcategory_id) {
      searchUrl += `/${suggestion.subcategory_id}`;
    }
  
    searchUrl += `?${queryParam}`;
    navigate(searchUrl);
  };
  
  return (
    <div className="navbar-center" style={{ position: 'relative' }}>
      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', width: '100%' }}>
        <input
          type="text"
          placeholder="Search products..."
          className="main-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <button className="main-search-btn" type="submit">
          <FaMagnifyingGlass />
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="suggestion-item"
              onMouseDown={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.display}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const Navbar = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const sessionKey = 'cachedCategories';
    const fetchCategories = async () => {
      const cachedData = sessionStorage.getItem(sessionKey);
      if (cachedData) {
        setCategories(JSON.parse(cachedData));
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/categories-with-subcategories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          sessionStorage.setItem(sessionKey, JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch(`${apiUrl}/isloggedin`, {
          method: "GET",
          credentials: "include",
        });
        setIsLoggedIn(response.ok);
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  const checkAuthAndNavigate = async (path) => {
    try {
      const response = await fetch(`${apiUrl}/isloggedin`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        navigate(path);
      } else {
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setShowLoginModal(true);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.status === 200) {
        setIsLoggedIn(false);
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleChatIconClick = () => {
    // You can replace null with an actual conversation_id if you want to pass a specific conversation
    navigate(`/chat`); // Assuming 'null' or an actual ID should be passed
  };


  return (
    <nav className="navbar">
      {/* Left Section */}
      <div className="navbar-left">
        <div className="logo" onClick={() => navigate("/dashboard")}>OLX</div>
        <div className="categories-dropdown-container" ref={dropdownRef}>
          <button
            className="categories-dropdown-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            ALL CATEGORIES
            <FaChevronDown className={`dropdown-icon ${isDropdownOpen ? 'rotate' : ''}`} />
          </button>
          {isDropdownOpen && (
            <div className="categories-dropdown">
              <div className="dropdown-header">ALL CATEGORIES</div>
              <div className="categories-grid">
                {categories.map((category) => (
                  <div key={category.category_id} className="category-group">
                    <div
                      className="category-item"
                      onClick={() => {
                        navigate(`/category/${category.category_id}`);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <strong>{category.name}</strong>
                    </div>
                    {category.subcategories.map((subcategory) => (
                      <div
                        key={subcategory.subcategory_id}
                        className="subcategory-item"
                        onClick={() => {
                          navigate(`/category/${category.category_id}/${subcategory.subcategory_id}`);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {subcategory.name}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Section */}
      <SearchBar navigate={navigate} />


      {/* Right Section */}
      <div className="navbar-right">
        <FaHeart className="icon" onClick={() => checkAuthAndNavigate("/wishlist")} />
        <FaCommentDots className="icon" onClick={() =>{handleChatIconClick();}} />
        <FaBell className="icon" />
        <div className="avatar" onClick={() => checkAuthAndNavigate(`/profile`)}>C</div>
        <button className="sell-btn" onClick={() => checkAuthAndNavigate("/postad")}>+ SELL</button>

        {isLoggedIn ? (
          <button className="auth-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <button className="auth-btn" onClick={() => setShowLoginModal(true)}>Sign In / Sign Up</button>
        )}
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </nav>
  );
};

export default Navbar;