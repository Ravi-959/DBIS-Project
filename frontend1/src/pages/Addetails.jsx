import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/Addetails.css";

const Addetails = () => {
  const { listing_id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListingDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/ad-details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing_id }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch listing");
        }

        setListing(data.product);

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [listing_id]);

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

  if (!listing) {
    return (
      <>
        <Navbar />
        <div className="not-found">
          <h2>Listing Not Found</h2>
          <p>The requested listing does not exist.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="product-details-container">
        <div className="product-image">
          <img 
            src={`${apiUrl}${listing.primary_image_url}`} 
            alt={listing.name} 
            onError={(e) => {
              e.target.src = `${apiUrl}$/placeholder-image.jpg`;
            }}
          />
        </div>

        <div className="product-info">
          <h1>{listing.name}</h1>
          
          <div className="price-section">
            <span className="current-price">{formatPrice(listing.price)}</span>
          </div>

          <div className="details-section">
            <div className="detail-row">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{listing.category_id}</span>
            </div>
            {/* <div className="detail-row">
              <span className="detail-label">Listed on:</span>
              <span className="detail-value">
                {new Date(listing.created_at).toLocaleDateString('en-IN')}
              </span>
            </div> */}
          </div>

          <div className="description-section">
            <h3>About this item</h3>
            <p>{listing.description || "No description provided."}</p>
          </div>

          <div className="action-buttons">
            <button className="contact-button">Contact Seller</button>
            <button className="save-button">Save Listing</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Addetails;