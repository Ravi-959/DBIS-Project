import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // use 'react-router-dom' for web apps

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return <div>Loading...</div>; // Temporary placeholder while redirecting
};

export default Home;
