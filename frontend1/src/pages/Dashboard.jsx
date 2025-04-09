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

        // if (authResponse.status !== 200) {
        //   navigate("/login");
        //   return;
        // }

        const authData = await authResponse.json();
        setUsername(authData.username || "User");

        // Fetch listings
        const listingsResponse = await fetch(`${apiUrl}/listings`);
        if (listingsResponse.ok) {
          const listingsData = await listingsResponse.json();
          setListings(listingsData);
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
                  {/* {listing.is_featured && (
                    <div className="featured-badge">FEATURED</div>
                  )} */}
                  <div className="listing-image-placeholder">
                    {/* Replace with actual image when available */}
                    <span>Image</span>
                  </div>
                  <div className="listing-details">
                    <div className="listing-price">₹{formatPrice(listing.price)}</div>
                    <div className="listing-title">{listing.name}</div>
                    <div className="listing-description">
                      {listing.description.length > 50 
                        ? `${listing.description.substring(0, 50)}...` 
                        : listing.description}
                    </div>
                    <div className="listing-location">MUMBAI</div>
                    {/* <div className="listing-time">{getTimeAgo(listing.created_at)}</div> */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-listings-message">
              <p>No listings found. Be the first to sell something!</p>
              <button 
                className="sell-now-btn"
                onClick={() => navigate("/sell")}
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
