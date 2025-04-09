import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method : "GET",
          credentials: "include", // Ensures cookies are sent with the request
        });

        const data = await response.json();

        if (response.status === 200) {
          navigate("/dashboard"); // Redirect to dashboard if logged in
        } else {
          navigate("/login"); // Redirect to login if not logged in
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login"); // Default to login if an error occurs
      }
    };

    checkLoginStatus();
  }, [navigate]);

  return <div>Loading...</div>; // Temporary placeholder while redirecting
};

export default Home;
