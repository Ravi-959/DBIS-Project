import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/config';
import '../css/Sell.css';

const Sell = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [imageUrls, setImageUrls] = useState(['']); // Start with one empty URL field
  const [formData, setFormData] = useState({
    categoryId: '',
    subcategoryId: '',
    productName: '',
    productBrand: '',
    description: '',
    price: '',
    contactInfo: ''
  });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
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

  // Fetch subcategories when category is selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (formData.categoryId) {
        try {
          const response = await fetch(`${apiUrl}/subcategories?categoryId=${formData.categoryId}`);
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
  }, [formData.categoryId]);

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const addImageUrlField = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, '']);
    }
  };

  const removeImageUrlField = (index) => {
    if (imageUrls.length > 1) {
      const newUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newUrls);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty URLs
    const validImageUrls = imageUrls.filter(url => url.trim() !== '');
    
    try {
      const response = await fetch(`${apiUrl}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrls: validImageUrls
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

  return (
    <div className="sell-container">
      <h1>Sell Your Product</h1>
      <form onSubmit={handleSubmit} className="sell-form">
        <div className="form-group">
          <label>Category*</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
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
          <label>Subcategory*</label>
          <select
            name="subcategoryId"
            value={formData.subcategoryId}
            onChange={handleChange}
            required
            disabled={!formData.categoryId}
          >
            <option value="">Select a subcategory</option>
            {subcategories.map(subcategory => (
              <option key={subcategory.subcategory_id} value={subcategory.subcategory_id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

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
          <label>Brand</label>
          <input
            type="text"
            name="productBrand"
            value={formData.productBrand}
            onChange={handleChange}
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

        <div className="form-group">
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
        </div>

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

export default Sell;