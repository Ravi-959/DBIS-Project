import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/config";
import "../css/signup.css"

const Signup = () => {
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // State for error messages
  const [error, setError] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include", // This ensures session cookies are sent
        });

        if (response.ok) {
          navigate("/dashboard"); // Redirect if already logged in
        }
      } catch (error) {
        console.error("Authentication check failed", error);
      }
    };
    checkStatus();
  }, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for session management
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      // console("hello");
      if (response.status === 200) {
        navigate("/dashboard"); // Redirect on successful signup
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Signup failed", error);
      setError("Error signing up");
    }
  };

  return (
<div className="signup-container">
  <h2>Create Your Account</h2>
  {error && <div className="error-message">{error}</div>}
  
  <form onSubmit={handleSubmit} className="signup-form">
    <input
      type="text"
      name="username"
      placeholder="Choose a username"
      value={formData.username}
      onChange={handleChange}
      required
    />
    
    <input
      type="email"
      name="email"
      placeholder="Your email address"
      value={formData.email}
      onChange={handleChange}
      required
    />
    
    <input
      type="password"
      name="password"
      placeholder="Create a password"
      value={formData.password}
      onChange={handleChange}
      required
    />
    
    {/* Optional: Add password strength meter */}
    <div className="password-strength">
      <div className="strength-bar" style={{ width: '0%', background: '#e74c3c' }} />
    </div>
    
    <button type="submit">Get Started</button>
  </form>
  
  <p className="auth-redirect">
    Already have an account? <a href="/login">Login here</a>
  </p>
</div>
  );
};

export default Signup;
