import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
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
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // Fetch categories and subcategories once per session
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


  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.status === 200) {
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
            <FaChevronDown 
              className={`dropdown-icon ${isDropdownOpen ? 'rotate' : ''}`} 
            />
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

      {/* Right section */}
      <div className="navbar-right">

        <FaHeart className="icon" onClick={() => navigate("/wishlist")} />
        <FaCommentDots className="icon" />
        <FaBell className="icon" />
        <div className="avatar" onClick={() => navigate("/profile")}>C</div>
        <button className="sell-btn" onClick={() => navigate("/sell")}>+ SELL</button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;