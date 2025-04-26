import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import "../css/filterbar.css";

const FilterBar = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [filters, setFilters] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const fetchSubcategories = async () => {
        try {
          const response = await axios.get(`/api/categories/${selectedCategory}/subcategories`);
          setSubcategories(response.data);
        } catch (error) {
          console.error('Error fetching subcategories:', error);
        }
      };
      fetchSubcategories();
    }
  }, [selectedCategory]);

  // Fetch category attributes when category/subcategory changes
  useEffect(() => {
    const fetchAttributes = async () => {
      if (selectedCategory || selectedSubcategory) {
        try {
          const endpoint = selectedSubcategory 
            ? `/api/subcategories/${selectedSubcategory}/attributes`
            : `/api/categories/${selectedCategory}/attributes`;
          
          const response = await axios.get(endpoint);
          setCategoryAttributes(response.data);
          
          // Initialize empty filters for each attribute
          const initialFilters = {};
          response.data.forEach(attr => {
            initialFilters[attr.name] = attr.data_type === 'number' 
              ? { min: '', max: '' } 
              : '';
          });
          setFilters(initialFilters);
        } catch (error) {
          console.error('Error fetching attributes:', error);
        }
      }
    };
    fetchAttributes();
  }, [selectedCategory, selectedSubcategory]);

  // Apply filters to URL
  const applyFilters = () => {
    const queryParams = new URLSearchParams();
    
    if (selectedCategory) queryParams.append('category', selectedCategory);
    if (selectedSubcategory) queryParams.append('subcategory', selectedSubcategory);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (typeof value === 'object') {
          if (value.min) queryParams.append(`${key}_min`, value.min);
          if (value.max) queryParams.append(`${key}_max`, value.max);
        } else {
          queryParams.append(key, value);
        }
      }
    });
    
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setFilters({});
    navigate(location.pathname);
  };

  // Handle filter input changes
  const handleFilterChange = (attrName, value) => {
    setFilters(prev => {
      const attribute = categoryAttributes.find(a => a.name === attrName);
      
      if (attribute.data_type === 'number') {
        return {
          ...prev,
          [attrName]: {
            ...prev[attrName],
            ...value
          }
        };
      }
      return { ...prev, [attrName]: value };
    });
  };

  // Render appropriate input based on attribute type
  const renderFilterInput = (attribute) => {
    switch (attribute.data_type) {
      case 'number':
        return (
          <div className="filter-number-range">
            <input
              type="number"
              placeholder="Min"
              value={filters[attribute.name]?.min || ''}
              onChange={(e) => handleFilterChange(
                attribute.name, 
                { min: e.target.value }
              )}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters[attribute.name]?.max || ''}
              onChange={(e) => handleFilterChange(
                attribute.name, 
                { max: e.target.value }
              )}
            />
          </div>
        );
      
      case 'enum':
        return (
          <select
            value={filters[attribute.name] || ''}
            onChange={(e) => handleFilterChange(attribute.name, e.target.value)}
          >
            <option value="">Any {attribute.name}</option>
            {attribute.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <div className="filter-boolean">
            <label>
              <input
                type="checkbox"
                checked={filters[attribute.name] || false}
                onChange={(e) => handleFilterChange(attribute.name, e.target.checked)}
              />
              Yes
            </label>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={filters[attribute.name] || ''}
            onChange={(e) => handleFilterChange(attribute.name, e.target.value)}
            placeholder={`Enter ${attribute.name}`}
          />
        );
    }
  };

  return (
    <div className="filter-bar">
      <h3>Filters</h3>
      
      {/* Category selection */}
      <div className="filter-group">
        <label>Category</label>
        <select
          value={selectedCategory || ''}
          onChange={(e) => {
            setSelectedCategory(e.target.value || null);
            setSelectedSubcategory(null);
          }}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.category_id} value={category.category_id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Subcategory selection (if category is selected) */}
      {selectedCategory && subcategories.length > 0 && (
        <div className="filter-group">
          <label>Subcategory</label>
          <select
            value={selectedSubcategory || ''}
            onChange={(e) => setSelectedSubcategory(e.target.value || null)}
          >
            <option value="">All Subcategories</option>
            {subcategories.map(subcategory => (
              <option key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Dynamic category-specific filters */}
      {categoryAttributes.length > 0 && (
        <div className="category-filters">
          <h4>Additional Filters</h4>
          {categoryAttributes.map(attribute => (
            <div key={attribute.attribute_id} className="filter-group">
              <label>{attribute.name}</label>
              {renderFilterInput(attribute)}
            </div>
          ))}
        </div>
      )}
      
      {/* Action buttons */}
      <div className="filter-actions">
        <button onClick={applyFilters} className="apply-btn">
          Apply Filters
        </button>
        <button onClick={resetFilters} className="reset-btn">
          Reset All
        </button>
      </div>
    </div>
  );
};

export default FilterBar;