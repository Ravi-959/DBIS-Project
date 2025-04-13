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
      <div className="navbar-center">
        <input
          type="text"
          placeholder="Find Cars, Mobile Phones and more..."
          className="main-search"
        />
        <button className="main-search-btn">
          <FaMagnifyingGlass />
        </button>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        <FaHeart className="icon" onClick={() => navigate("/wishlist")} />
        <FaCommentDots className="icon" />
        <FaBell className="icon" />
        <div className="avatar" onClick={() => navigate("/profile")}>C</div>
        <button className="sell-btn" onClick={() => checkAuthAndNavigate("/sell")}>+ SELL</button>

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