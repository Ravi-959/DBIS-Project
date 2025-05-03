import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/EditListingItem.css';

const EditListingItem = () => {
  const { listingId } = useParams();            // ✅ get the correct param
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    subcategory_id: ''
  });

  const [isLoading, setIsLoading] = useState(true);  
  const [error, setError] = useState(null);

  // ✅ Fetch listing data when component mounts
  useEffect(() => {
    console.log('EditListingItem mounted with listingId =', listingId);
    axios.get(`http://localhost:4000/listings/${listingId}`, { withCredentials: true })
      .then(res => {
        console.log('Fetched listing data:', res.data);
        const p = res.data;
        setFormData({
          name: p.name || '',
          description: p.description || '',
          price: p.price || '',
          category_id: p.category_id || '',
          subcategory_id: p.subcategory_id || ''
        });
      })
      .catch(err => {
        console.error('Error fetching listing:', err);
        setError(err.response?.data?.message || 'Failed to load listing');
      })
      .finally(() => setIsLoading(false));
  }, [listingId]);

  // ✅ Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
  };

  // ✅ Handle form submit
  const handleSubmit = e => {
    e.preventDefault();
    console.log('Submitting update with body:', formData);
    axios.put(`http://localhost:4000/listings/${listingId}`, formData, { withCredentials: true })
      .then(() => {
        alert('Listing updated successfully');
        navigate('/profile');   // Redirect to profile after successful update
      })
      .catch(err => {
        console.error('Update error:', err.response?.data || err);
        alert('Update failed: ' + (err.response?.data?.message || err.message));
      });
  };

  if (isLoading) return <div className="loading">Loading listing…</div>;
  if (error)     return <div className="error">{error}</div>;

  return (
    <div className="edit-listing-container">
      <h2>Edit Listing</h2>
      <form className="edit-form" onSubmit={handleSubmit}>
        <label>Product Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <label>Price</label>
        <input
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
        />

        {/* <label>Category ID</label>
        <input
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
        />

        <label>Subcategory ID</label>
        <input
          name="subcategory_id"
          value={formData.subcategory_id}
          onChange={handleChange}
        /> */}

        <button type="submit">Update Listing</button>
      </form>
    </div>
  );
};

export default EditListingItem;
