import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import { useNavigate } from "react-router";
import "../css/Dashboard.css"; // ✅ Using same CSS as Dashboard

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // console.log("Fetching wishljhiist items...");
        const authResponse = await fetch(`${apiUrl}/isLoggedIn`, {
                  credentials: "include",
                });
        if (! authResponse.ok) {
          navigate(`/login`);
        }
        const response = await fetch(`${apiUrl}/wishlist-items`, {
          credentials: "include",
        });
        if (response.ok) {
        //   console.log("Fetching wishlist items...");
          const data = await response.json();
          setWishlistItems(data);
          console.log("Fetched wishlist items:", data);
        } else {
          console.error("Failed to fetch wishlist");
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);



  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <h1 className="welcome-message">My Wishlist</h1>

        <div className="recommendations-section">
          <h2>Saved Listings</h2>

           {loading ? (
             <div className="loading-message">Loading listings...</div>
           ) : wishlistItems.length > 0 ? (
             <div className="listings-grid">
               {wishlistItems.map((listing) => (
                 <div 
                   key={listing.listing_id} 
                   className="listing-card"
                   onClick={() => navigate(`/listing/${listing.listing_id}`)}
                 >
                   <div className="listing-image-container">
                   {listing.image_url ? (
                     <img 
                       src={`${apiUrl}${listing.image_url}`}
                       alt={listing.name}
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
                     <div className="listing-description">
                       {listing.description.length > 50 
                         ? `${listing.description.substring(0, 50)}...` 
                         : listing.description}
                     </div>
                     <div className="listing-location">MUMBAI</div>
                   </div>
                 </div>
               ))}
             </div>
           )  : (
            <div className="no-listings-message">
              <p>No items in your wishlist yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
