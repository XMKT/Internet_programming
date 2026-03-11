// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CatalogPage from "./components/catalog/CatalogPage";
import Cart from "./components/cart/Cart";
import Profile from "./components/profile/Profile";
import "./styles/global.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
