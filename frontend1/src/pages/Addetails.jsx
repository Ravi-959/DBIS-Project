import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/Addetails.css";
import LoginModal from "../pages/LoginModal.jsx";


const Addetails = () => {
  const { listing_id } = useParams();
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const checkAuthAndNavigate = async (onAuthenticatedAction) => {
    try {
      const response = await fetch(`${apiUrl}/isloggedin`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        onAuthenticatedAction();
      } else {
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setShowLoginModal(true);
    }
  };

  const handleSaveToWishlist = async () => {
    try {

      const {product} = listingData;

      const response = await fetch(`${apiUrl}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listing_id: product.listing_id }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Added to wishlist!");
      } else {
        alert(data.message || "Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error saving to wishlist:", error);
      alert("Something went wrong");
    }
  };


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

        setListingData(data);

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

  const handleContactSeller = async () => {

    const { product } = listingData;

    if (!product?.user_id) {
      alert("Seller information is missing.");
      return;
    }

  try {
    const response = await fetch(`${apiUrl}/check-or-create-conversation`, {
      method: "POST",
      credentials : "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seller_id: product.user_id,
        listing_id: product.listing_id,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      navigate(`/chat/${data.conversation_id}`);
    } else {
      alert(`Could not initiate chat: ${data.message || 'Unknown error'}`);
    }
  } catch (err) {
    console.error("Error contacting seller:", err);
  }
};


  const renderAttributeValue = (attr) => {
    if (attr.number_value) return attr.number_value;
    if (attr.option_value) return attr.option_value;
    return 'N/A';
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

  if (!listingData?.product) {
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

  const { product, attributes } = listingData;

  return (
    <>
      <Navbar />
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      <div className="product-details-container">
        <div className="product-image">
          <img 
            src={`${apiUrl}${product.primary_image_url}`} 
            alt={product.name} 
            onError={(e) => {
              e.target.src = `${apiUrl}/placeholder-image.jpg`;
            }}
          />
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          
          <div className="price-section">
            <span className="current-price">{formatPrice(product.price)}</span>
          </div>

          <div className="details-section">
            <div className="detail-row">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{product.category_name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Subcategory:</span>
              <span className="detail-value">{product.subcategory_name}</span>
            </div>
            
            {/* Display attributes */}
            {attributes
              ?.filter(attr => attr.attribute_name?.toLowerCase() !== 'price')
              .map(attr => (
                <div key={attr.attribute_id} className="detail-row">
                  <span className="detail-label">{attr.attribute_name}:</span>
                  <span className="detail-value">
                    {renderAttributeValue(attr)}
                  </span>
                </div>
            ))}
          </div>

          <div className="description-section">
            <h3>About this item</h3>
            <p>
              {product.description?.replace(/\\n/g, '\n') || "No description provided."}
            </p>
          </div>


          <div className="action-buttons">
            <button className="contact-button" onClick={() => checkAuthAndNavigate(handleContactSeller)} >Contact Seller</button>
            <button className="save-button-ad" onClick={() => checkAuthAndNavigate(handleSaveToWishlist)} >Save Listing</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Addetails;