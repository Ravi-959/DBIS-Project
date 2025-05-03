import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from "../config/config";
import "../css/filterbar.css";

const MAX_VISIBLE_ENUM_OPTIONS = 6;

const FilterBar = ({ categoryId, subcategoryId, allListings, setFilteredListings,  }) => {
  const [attributes, setAttributes] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [expandedEnums, setExpandedEnums] = useState({});
  // const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();


  const fetchAttributes = useCallback(async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      const endpoint = subcategoryId
        ? `${apiUrl}/subcategories/${subcategoryId}/attributes`
        : `${apiUrl}/categories/${categoryId}/attributes`;

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setAttributes(data);

        console.log("Attributes -", data);

        const initialFilters = {};
        data.forEach(attr => {
          if (attr.data_type === 'number') {
            initialFilters[`attr_${attr.attribute_id}_min`] = attr.range['min'] || 1;
            initialFilters[`attr_${attr.attribute_id}_max`] = attr.range['max'] || 1000;
          } else if (attr.data_type === 'enum') {
            initialFilters[`attr_${attr.attribute_id}`] = [];
          } else {
            initialFilters[`attr_${attr.attribute_id}`] = '';
          }
        });

        setFilterValues(initialFilters);
      } else {
        throw new Error("Failed to fetch attributes");
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, subcategoryId]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await fetch(`${apiUrl}/subcategories?categoryId=${categoryId}`);
        if (res.ok) {
          const data = await res.json();
          setSubcategories(data);
          console.log("Subcategory in url:", subcategoryId);
        } else {
          throw new Error("Failed to fetch subcategories");
        }
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };
  
    if (categoryId) fetchSubcategories();
  }, [categoryId]);
  
  const applyFilters = () => {
    const hasActiveFilter = attributes.some(attr => {
      const attrKey = `attr_${attr.attribute_id}`;
      if (attr.data_type === 'number') {
        const min = filterValues[`${attrKey}_min`];
        const max = filterValues[`${attrKey}_max`];
        return min !== (attr.range['min'] || 1) || max !== (attr.range['max'] || 1000);  // custom range set
      } else if (attr.data_type === 'enum') {
        return (filterValues[attrKey] || []).length > 0; // selected options
      } else if (attr.data_type === 'text') {
        return (filterValues[attrKey] || '').trim() !== ''; // non-empty text
      }
      return false;
    });
  
    if (!hasActiveFilter) {
      setFilteredListings(allListings); // no filters: return everything
      return;
    }

    // const newParams = {};

  
    const filtered = allListings.filter(listing => {
      const attrMap = {};
      listing.attributes?.forEach(attr => {
        attrMap[attr.attribute_id] = attr.value;
      });
    
      return attributes.every(attr => {
        const attrKey = `attr_${attr.attribute_id}`;
        const value = attrMap[attr.attribute_id];
    
        if (attr.data_type === 'number') {
          const min = filterValues[`${attrKey}_min`] ?? (attr.range['min'] || 1);
          const max = filterValues[`${attrKey}_max`] ?? (attr.range['max'] || 1000);
          const num = parseFloat(value);
          const result = !isNaN(num) && num >= min && num <= max;
          // newParams[`${attrKey}_min`] = min;
          // newParams[`${attrKey}_max`] = max;
          return result;
        }
    
        if (attr.data_type === 'enum') {
          const selectedOptions = filterValues[attrKey] || [];
          const result = selectedOptions.length === 0 || selectedOptions.includes(value);
          // if (selectedOptions.length > 0) {
          //   newParams[attrKey] = selectedOptions.join(',');
          // }
          return result;
        }
    
        if (attr.data_type === 'text') {
          const textValue = (filterValues[attrKey] || '').toLowerCase();
        // if (textValue) {
        //   newParams[attrKey] = textValue;
        // }
        return (value || '').toLowerCase().includes(textValue);
        }
    
        return true;
      });
    });   
    
  
    setFilteredListings(filtered);

    // setSearchParams(newParams);
  };
  
  
  
  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const toggleEnumValue = (attrId, value) => {
    setFilterValues(prev => {
      const key = `attr_${attrId}`;
      const currentValues = prev[key] || [];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        [key]: updatedValues
      };
    });
  };

  const toggleSeeMore = (attrId) => {
    setExpandedEnums(prev => ({
      ...prev,
      [attrId]: !prev[attrId]
    }));
  };

  if (loading) return <div className="filter-loading">Loading filters...</div>;

  return (
    <div className="filter-bar">

      {subcategories.length > 0 && (
        <div className="subcategory-filter">
          <h3 className="filter-header">Subcategories</h3>
          <div className="subcategory-list">
            {subcategories.map((subcat) => (
              <div
                key={subcat.subcategory_id}
                className={`subcategory-item-sidebar ${parseInt(subcategoryId) === subcat.subcategory_id ? 'selected' : ''}`}
                onClick={() => {
                  // Toggle selection: deselect if already selected
                  const isSelected = parseInt(subcategoryId) === subcat.subcategory_id;
                  const newPath = isSelected
                    ? `/category/${categoryId}/` // redirect to category only
                    : `/category/${categoryId}/${subcat.subcategory_id}`;
                  navigate(newPath);
                }}
              >
                {subcat.name}
              </div>
            ))}
          </div>
        </div>
      )}


    <h3 className="filter-header">Filters</h3>

      {attributes.length === 0 ? (
        <p className="no-filters">No filters available</p>
      ) : (
        <div className="filter-groups">
          {attributes.map(attr => (
            <div key={attr.attribute_id} className="filter-group">
              <label className="filter-label">
                {attr.name}
                {attr.is_required && <span className="required-star">*</span>}
              </label>

              {attr.data_type === 'number' && (
                <div className="dual-range-slider">
                  <div className="range-values">
                    <span>Min: {filterValues[`attr_${attr.attribute_id}_min`]}</span>
                    <span>Max: {filterValues[`attr_${attr.attribute_id}_max`]}</span>
                  </div>
                  <div className="slider-container">
                    <input
                      type="range"
                      min={attr.range['min'] || 1}
                      max={attr.range['max'] || 1000}
                      value={filterValues[`attr_${attr.attribute_id}_min`]}
                      onChange={(e) => {
                        const min = Math.min(parseInt(e.target.value), filterValues[`attr_${attr.attribute_id}_max`]);
                        setFilterValues(prev => ({
                          ...prev,
                          [`attr_${attr.attribute_id}_min`]: min
                        }));
                      }}
                    />
                    <input
                      type="range"
                      min={attr.range['min'] || 1}
                      max={attr.range['max'] || 1000}
                      value={filterValues[`attr_${attr.attribute_id}_max`]}
                      onChange={(e) => {
                        const max = Math.max(parseInt(e.target.value), filterValues[`attr_${attr.attribute_id}_min`]);
                        setFilterValues(prev => ({
                          ...prev,
                          [`attr_${attr.attribute_id}_max`]: max
                        }));
                      }}
                    />
                  </div>
                </div>
              )}

              {attr.data_type === 'enum' && attr.options && (
                <div className="enum-boxes">
                  {(expandedEnums[attr.attribute_id] ? attr.options : attr.options.slice(0, MAX_VISIBLE_ENUM_OPTIONS)).map(option => (
                    <div
                      key={option}
                      className={`enum-box ${filterValues[`attr_${attr.attribute_id}`].includes(option) ? 'selected' : ''}`}
                      onClick={() => toggleEnumValue(attr.attribute_id, option)}
                    >
                      {option}
                    </div>
                  ))}
                  {attr.options.length > MAX_VISIBLE_ENUM_OPTIONS && (
                    <button
                      className="see-more-btn"
                      onClick={() => toggleSeeMore(attr.attribute_id)}
                    >
                      {expandedEnums[attr.attribute_id] ? 'See less' : 'See more'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          <div className="apply-filters-container">
            <button className="apply-filters-btn" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
