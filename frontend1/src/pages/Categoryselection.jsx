import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/config';
import '../css/categoryselection.css'

const CategorySelection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const authResponse = await fetch(`${apiUrl}/isLoggedIn`, {
                  credentials: "include",
                });
        if (! authResponse.ok) {
          navigate(`/login`);
        }
        const response = await fetch(`${apiUrl}/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedCategory) {
        try {
          const response = await fetch(`${apiUrl}/subcategories?categoryId=${selectedCategory}`);
          if (response.ok) {
            const data = await response.json();
            setSubcategories(data);
          }
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      } else {
        setSubcategories([]);
      }
    };
    fetchSubcategories();
  }, [selectedCategory]);

  const handleContinue = () => {
    if (selectedCategory) {
      navigate('/postad/details', {
        state: {
          categoryId: selectedCategory,
          subcategoryId: selectedSubcategory || null
        }
      });
    }
  };

  return (
    <div className="category-selection">
      <h1>What are you selling?</h1>
      <div className="selection-container">
        <div className="form-group">
          <label>Category*</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory('');
            }}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Subcategory</label>
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={!selectedCategory}
          >
            <option value="">Select a subcategory</option>
            {subcategories.map(subcategory => (
              <option key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleContinue} 
          disabled={!selectedCategory}
          className="continue-btn"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default CategorySelection;