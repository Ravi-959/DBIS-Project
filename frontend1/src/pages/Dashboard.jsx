import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import '../css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check login status
        const authResponse = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });

        const authData = await authResponse.json();
        setUsername(authData.username || "User");

        const userId = authData.user_id;

        // Fetch listings with images
        const listingsResponse = await fetch(`${apiUrl}/listings-with-images`);
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          const filteredListings = listingsData.filter(listing => listing.user_id !== userId);
          setListings(filteredListings);  
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-content">
        <h1 className="welcome-message">Hi {username}!</h1>
        
        <div className="recommendations-section">
          <h2>Fresh recommendations</h2>
          
          {loading ? (
            <div className="loading-message">Loading listings...</div>
          ) : listings.length > 0 ? (
            <div className="listings-grid">
              {listings.map((listing) => (
                <div 
                  key={listing.listing_id} 
                  className="listing-card"
                  onClick={() => navigate(`/listing/${listing.listing_id}`)}
                >
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
                  <div className="listing-details">
                    <div className="listing-price">₹{formatPrice(listing.price)}</div>
                    <div className="listing-title">{listing.name}</div>
                    <div className="listing-attributes">
                    {listing.attributes && listing.attributes.length > 0 ? (
                      listing.attributes
                        .filter(attr => attr.name.toLowerCase() !== 'price') // exclude 'Price'
                        .slice(0, 3)
                        .map((attr, index) => (
                          <div key={index} className="attribute-line">
                            <strong>{attr.name}: </strong>
                            <span>{attr.value}</span>
                          </div>
                        ))
                    ) : (
                      <p className="no-attributes">No attributes available.</p>
                    )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-listings-message">
              <p>No listings found. Be the first to sell something!</p>
              <button 
                className="sell-now-btn"
                onClick={() => navigate("/postad")}
              >
                Start selling
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;