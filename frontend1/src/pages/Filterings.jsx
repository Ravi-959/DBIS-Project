import React, { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/filtering.css";

const Filterings = () => {
  const { category_id, subcategory_id } = useParams();
  const paramCount = [category_id, subcategory_id].filter(Boolean).length;
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [FilteringName, setFilteringName] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        let response;

        if (paramCount === 1) {
          // Only category_id
            console.log("Fetching by category:", category_id);
            const nameResponse = await fetch(`${apiUrl}/category_name`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category_id }),
            });

            const nameData = await nameResponse.json();
            if (!nameResponse.ok) {
                throw new Error(nameData.message || "Failed to fetch subcategory name");
            }

            setFilteringName(nameData.name || "");
            response = await fetch(`${apiUrl}/products_by_category`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category_id }),
            });
        } else if (paramCount === 2) {
          // Both category_id and subcategory_id
            console.log("Fetching by subcategory:", category_id, subcategory_id);
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

            setFilteringName(nameData.name || "");
            response = await fetch(`${apiUrl}/products_by_subcategory`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category_id, subcategory_id }),
            });
        } else {
          throw new Error("Invalid route parameters.");
        }

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch listings.");
        }


        setListings(data.products || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [category_id, subcategory_id, paramCount]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("₹", "₹ ");
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
          <h2>No Listings Found</h2>
          <p>No products found in this category.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="category-container">
        <h1 className="title">Products in {FilteringName}</h1>
        <div className="listings-grid">
          {listings.map((listing) => (
          <div 
          key={listing.listing_id} 
          className="listing-card"
          onClick={() => navigate(`/listing/${listing.listing_id}`)}
              >
              <div className="listing-image-container">
                {listing.images?.length > 0 ? (
                  <img
                    src={`${apiUrl}${listing.images[0].image_url}`}
                    alt={listing.product_name}
                    className="listing-image"
                    onError={(e) => {
                      console.error("Image failed to load:", e.target.src);
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
                  <span className="current-price">
                    {formatPrice(listing.price)}
                  </span>
                </div>
                <div className="description">
                  <p>
                    {listing.description?.substring(0, 100) ||
                      "No description provided."}
                    ...
                  </p>
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

export default Filterings;
