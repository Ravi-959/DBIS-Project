import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/Addetails.css";

const Addetails = () => {
  const { listing_id } = useParams();
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userId = 1; 

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

    
  // const handleContactSeller = async () => {

  //   if (!userId) {
  //     alert("You must be logged in to contact the seller.");
  //     navigate("/login");
  //     return;
  //   }
  
  //   if (!listingData) {
  //     alert("Listing is missing.");
  //     console.error("Listing is missing");
  //     return;
  //   }
    
  //   const {product, attributes } = listingData;

  //   // Ensure the seller_id is available
  //   if (!product?.user_id) {
  //     alert("Seller information is missing.");
  //     console.error("Seller ID is missing:", product);
  //     return;
  //   }
  
  //   try {
  //     const response = await fetch(`${apiUrl}/check-or-create-conversation`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         user_id_1: userId, // Buyer ID
  //         user_id_2: product.user_id, // Seller ID
  //       }),
  //     });
  
  //     const data = await response.json();
  
  //     if (response.ok) {
  //       // Navigate to the chat if the conversation exists or was created
  //       navigate("/chat", {
  //         state: {
  //           conversation_id: data.conversation_id,
  //           user_id: userId,
  //           other_user_id: data.other_user_id,
  //           other_username: data.other_username,
  //         },
  //       });
  //     } else {
  //       alert(`Could not initiate chat: ${data.message || 'Unknown error'}`);
  //       console.error("Error:", data.message);
  //     }
  //   } catch (err) {
  //     console.error("Error contacting seller:", err);
  //   }
  // };

  const handleContactSeller = async () => {
    if (!userId) {
      alert("You must be logged in to contact the seller.");
      navigate("/login");
      return;
    }

    if (!listingData) {
      alert("Listing is missing.");
      return;
    }

    const { product } = listingData;

    if (!product?.user_id) {
      alert("Seller information is missing.");
      return;
    }

    if (userId === product.user_id) {
      alert("You cannot contact yourself.");
      return;
    }


  try {
    const response = await fetch(`${apiUrl}/check-or-create-conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyer_id: userId,
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
            {attributes?.map(attr => (
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
            <button className="contact-button" onClick={handleContactSeller} >Contact Seller</button>
            <button className="save-button">Save Listing</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Addetails;