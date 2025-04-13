import { Routes, Route } from "react-router";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
import Addetails from "./pages/Addetails";
import Category from "./pages/Category";
import Subcategory from "./pages/Subcategory";
import Sell from "./pages/sell";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/listing/:listing_id" element={<Addetails />} />
        <Route path="/category/:category_id" element={<Category />} />
        <Route path="/category/:category_id/:subcategory_id" element={<Subcategory />} />       
        <Route path="*" element={<NotFound />} /> {/* 404 Page */}
      </Routes>
  );
}

export default App;
