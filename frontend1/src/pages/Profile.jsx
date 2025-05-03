import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "" });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/profile`, {
          credentials: "include",
        });

        // only redirect to login on 401
        if (res.status === 401) {
          navigate("/login");
          return;
        }

        if (!res.ok) {
          console.error("Unexpected response fetching profile:", res.status);
          setLoading(false);
          return;
        }

        const { user, listings } = await res.json();
        setUser(user);
        console.log(listings);
        setListings(listings);
      } catch (err) {
        console.error("Error fetching profile:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleEditListing = (id) => {
    navigate(`/edit-listing/${id}`);
  };

  const handleRemoveListing = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/listings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.listing_id !== id));
      } else {
        console.error("Delete failed:", await res.text());
      }
    } catch (err) {
      console.error("Error deleting listing:", err);
    }
  };

  const handleStartSelling = () => {
    navigate("/postad");
  };

  const fmt = (x) => new Intl.NumberFormat("en-IN").format(x);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-container">
          <p className="loading-message">Loading your profile…</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h2>Welcome, {user.username}!</h2>
          <button className="edit-profile-btn" onClick={handleEditProfile}>
            Edit Profile
          </button>
        </div>

        <h3 className="listings-heading">Your Listings</h3>

        {listings.length === 0 ? (
          <div className="no-listings">
            <p>You haven’t posted any listings yet.</p>
            <button className="start-selling-btn" onClick={handleStartSelling}>
              Start Selling Now
            </button>
          </div>
        ) : (
          <div className="listing-grid">
            {listings.map((l) => (
              <div key={l.listing_id} className="listing-card">
                <img
                  src={
                    l.images && l.images.length > 0
                      ? `${apiUrl}${l.images[0].image_url}`
                      : `${apiUrl}/placeholder.jpg`
                  }
                  alt={l.name}
                  className="listing-image"
                />
                <div className="listing-details">
                    <div className="listing-price">₹{fmt(l.price)}</div>
                    <div className="listing-title">{l.name}</div>
                    <div className="listing-attributes">
                    {l.attributes && l.attributes.length > 0 ? (
                      l.attributes
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
                <div className="listing-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditListing(l.listing_id)}
                  >
                    Edit
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveListing(l.listing_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
