import React, { useState, useEffect, useCallback } from 'react';
import { apiUrl } from "../config/config";
import "../css/filterbar.css";

const MAX_VISIBLE_ENUM_OPTIONS = 6;

const FilterBar = ({ categoryId, subcategoryId }) => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState({});
  const [expandedEnums, setExpandedEnums] = useState({});

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

        const initialFilters = {};
        data.forEach(attr => {
          if (attr.data_type === 'number') {
            initialFilters[`attr_${attr.attribute_id}_min`] = 1;
            initialFilters[`attr_${attr.attribute_id}_max`] = attr.max_value || 1000;
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
                      min="1"
                      max={attr.max_value || 1000}
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
                      min="1"
                      max={attr.max_value || 1000}
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
        </div>
      )}
    </div>
  );
};

export default FilterBar;
