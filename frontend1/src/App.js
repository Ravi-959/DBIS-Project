import { Routes, Route } from "react-router";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
import Addetails from "./pages/Addetails";
import Filterings from "./pages/Filterings";
import Wishlist from "./pages/wishlist";
import CategorySelection from "./pages/Categoryselection";
import Chatbox from "./pages/Chatbox"; // Import Chatbox
import SellDetails from "./pages/PostAd";


function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/postad" element={<CategorySelection />} />
        <Route path="/postad/details" element={<SellDetails />} />
        <Route path="/listing/:listing_id" element={<Addetails />} />
        <Route path="/chat/:conversation_id?" element={<Chatbox />} /> {/* Updated to accept conversation_id */}
        <Route path="/category/:category_id" element={<Filterings />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/category/:category_id/:subcategory_id" element={<Filterings />} /> 
        <Route path="*" element={<NotFound />} /> {/* 404 Page */}
      </Routes>
  );
}

export default App;
