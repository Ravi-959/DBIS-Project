import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/config';
import '../css/postad.css';

const SellDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { categoryId: initialCategoryId, subcategoryId: initialSubcategoryId } = location.state || {};
  
  const [attributes, setAttributes] = useState([]);
  const [imageUrls, setImageUrls] = useState(['']);
  const [formData, setFormData] = useState({
    categoryId: initialCategoryId,
    subcategoryId: initialSubcategoryId,
    productName: '',
    description: '',
    price: '',
    contactInfo: ''
  });

  useEffect(() => {
      const CheckAuthentication = async () => {
        try {
          const authResponse = await fetch(`${apiUrl}/isLoggedIn`, {
                    credentials: "include",
                  });
          if (! authResponse.ok) {
            navigate(`/login`);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      };
      CheckAuthentication();
    }, []);

  // Memoized fetch function to prevent unnecessary recreations
  const fetchAttributes = useCallback(async (categoryId, subcategoryId) => {
    if (!categoryId) return;

    try {
          
      const endpoint = subcategoryId 
        ? `${apiUrl}/subcategories/${subcategoryId}/attributes`
        : `${apiUrl}/categories/${categoryId}/attributes`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setAttributes(data);
        
        // Initialize form data with attributes
        setFormData(prev => {
          const initialData = { ...prev };
          data.forEach(attr => {
            initialData[`attr_${attr.attribute_id}`] = attr.data_type === 'boolean' ? false : '';
          });
          return initialData;
        });
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  }, []);

  // Fetch attributes when category/subcategory changes
  useEffect(() => {
    fetchAttributes(formData.categoryId, formData.subcategoryId);
  }, [formData.categoryId, formData.subcategoryId, fetchAttributes]);

  const handleImageUrlChange = (index, value) => {
    setImageUrls(prev => {
      const newUrls = [...prev];
      newUrls[index] = value;
      return newUrls;
    });
  };

  const addImageUrlField = () => {
    if (imageUrls.length < 5) {
      setImageUrls(prev => [...prev, '']);
    }
  };

  const removeImageUrlField = (index) => {
    if (imageUrls.length > 1) {
      setImageUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validImageUrls = imageUrls.filter(url => url.trim() !== '');
    const attributeValues = {};
    let priceValue = '';
    
    // Prepare attribute values for submission
    attributes.forEach(attr => {
      const fieldName = `attr_${attr.attribute_id}`;
      const value = formData[fieldName];

      if (attr.name.toLowerCase() === 'price') {
        priceValue = value;
      }

      attributeValues[attr.attribute_id] = value;
      
    });

    try {
      const response = await fetch(`${apiUrl}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: priceValue,
          imageUrls: validImageUrls,
          attributes: attributeValues
        }),
        credentials: 'include'
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        console.error('Failed to create listing');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const renderAttributeInput = (attribute) => {
    const fieldName = `attr_${attribute.attribute_id}`;
    
    switch (attribute.data_type) {
      case 'number':
        return (
          <input
            type="number"
            name={fieldName}
            value={formData[fieldName] || ''}
            onChange={handleChange}
            min="0"
            step={attribute.name === 'Price' ? '0.01' : '1'}
          />
        );
      
      case 'enum':
        return (
          <select
            name={fieldName}
            value={formData[fieldName] || ''}
            onChange={handleChange}
          >
            <option value="">Select {attribute.name.toLowerCase()}</option>
            {attribute.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            name={fieldName}
            value={formData[fieldName] || ''}
            onChange={handleChange}
            placeholder={`Enter ${attribute.name.toLowerCase()}`}
          />
        );
    }
  };

  if (!formData.categoryId) {
    navigate('/sell');
    return null;
  }

  return (
    <div className="sell-container">
      <h1>List Your Item</h1>
      <form onSubmit={handleSubmit} className="sell-form">
        {/* Basic fields */}
        <div className="form-group">
          <label>Product Name*</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description*</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        {/* <div className="form-group">
          <label>Price*</label>
          <div className="price-input">
            <span>₹</span>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div> */}

        {/* Dynamic attribute fields */}
        {attributes.map(attribute => (
          <div key={attribute.attribute_id} className="form-group">
            <label>
              {attribute.name}
              {attribute.is_required && <span className="required">*</span>}
            </label>
            {renderAttributeInput(attribute)}
          </div>
        ))}

        {/* Image URLs */}
        <div className="form-group">
          <label>Image URLs (Max 5)</label>
          {imageUrls.map((url, index) => (
            <div key={index} className="image-url-input">
              <input
                type="text"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {imageUrls.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeImageUrlField(index)}
                  className="remove-url-btn"
                  aria-label="Remove image URL"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {imageUrls.length < 5 && (
            <button 
              type="button" 
              onClick={addImageUrlField}
              className="add-url-btn"
            >
              + Add Another Image URL
            </button>
          )}
        </div>

        <div className="form-group">
          <label>Contact Information*</label>
          <input
            type="text"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            placeholder="Phone number or email"
            required
          />
        </div>

        <button type="submit" className="submit-btn">Post Listing</button>
      </form>
    </div>
  );
};

export default SellDetails;