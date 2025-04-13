import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/subcategory.css";

const Subcategory = () => {
  const { category_id, subcategory_id } = useParams();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subcategoryName, setSubcategoryName] = useState("");

  console.log("I am in line 15", category_id, subcategory_id);
  useEffect(() => {
    const fetchSubcategoryListings = async () => {
      try {
        // First fetch subcategory name
        const nameResponse = await fetch(`${apiUrl}/subcategory_name`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category_id,subcategory_id}),
        });
        console.log("I am in line 24", category_id, subcategory_id);
        
        const nameData = await nameResponse.json();
        if (!nameResponse.ok) {
          throw new Error(nameData.message || "Failed to fetch subcategory name");
        }
        setSubcategoryName(nameData.name || "");

        // Then fetch products
        const response = await fetch(`${apiUrl}/products_by_subcategory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            category_id,
            subcategory_id 
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch subcategory listings");
        }
        
        setListings(data.products || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategoryListings();
  }, [category_id, subcategory_id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price).replace('₹', '₹ ');
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Navbar />
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </>
    );
  }

  if (listings.length === 0) {
    return (
      <>
        <Navbar />
        <div className="not-found">
          <h2>No Products Found in This Subcategory</h2>
          <p>There are currently no products listed in this subcategory.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="subcategory-container">
        <div className="breadcrumbs">
          <span onClick={() => navigate(`/category/${category_id}`)}>
            Category
          </span> 
          &nbsp; &gt; &nbsp;
          <span>{subcategoryName}</span>
        </div>
        
        <h1 className="subcategory-title">Products in {subcategoryName}</h1>
        
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.id} className="listing-card" onClick={() => handleProductClick(listing.id)}>
              <div className="listing-image-container">
                {listing.images && listing.images.length > 0 ? (
                    <img 
                    src={`${apiUrl}${listing.images[0].image_url}`}
                    alt={listing.product_name}
                    className="listing-image"
                    onError={(e) => {
                        console.error('Image failed to load:', e.target.src);
                        e.target.onerror = null;
                        e.target.src = `${apiUrl}/placeholder.jpg`;
                    }}
                    />
                    ) : (
                    <div className="listing-image-placeholder">
                        <span>No Image</span>
                    </div>
                    )}
                </div>
              <div className="listing-info">
                <h3>{listing.name}</h3>
                <div className="price-section">
                  <span className="current-price">{formatPrice(listing.price)}</span>
                  {listing.original_price && (
                    <span className="original-price">
                      {formatPrice(listing.original_price)}
                    </span>
                  )}
                </div>
                <div className="description">
                  <p>{listing.description?.substring(0, 100) || "No description provided."}...</p>
                </div>
                <button 
                  className="view-details-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(listing.id);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Subcategory;