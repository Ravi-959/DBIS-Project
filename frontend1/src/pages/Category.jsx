import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/category.css";

const Category = () => {
  const { category_id } = useParams();
  console.log("Category_ID in category :", category_id);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("Category_ID in category :", category_id);


  useEffect(() => {
    const fetchCategoryListings = async () => {
      try {
        const response = await fetch(`${apiUrl}/products_by_category`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category_id }),
        });

        const data = await response.json();
        console.log("I am in line 26", category_id);

        if (!response.ok) {
            console.log("I am in line 29:", category_id);
            throw new Error(data.message || "Failed to fetch category listings");
        }
        console.log("I am in line 32:", category_id);
        setListings(data.products || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryListings();
  }, [category_id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price).replace('₹', '₹ ');
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
          <h2>No Listings Found in This Category</h2>
          <p>There are currently no products listed in this category.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="category-container">
        <h1 className="category-title">Products in Category</h1>
        <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing.id} className="listing-card">
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
                </div>
                <div className="description">
                  <p>{listing.description?.substring(0, 100) || "No description provided."}...</p>
                </div>
                <button className="view-details-button">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Category;