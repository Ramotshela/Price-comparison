import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GroceryListProvider } from "./context/GroceryListContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import GroceryListPage from "./pages/GroceryListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import "./styles/app.css";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <AuthProvider>
      <GroceryListProvider>
        <BrowserRouter>
          <Navbar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <Routes>
            <Route path="/" element={<HomePage searchTerm={searchTerm} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/list"
              element={
                <ProtectedRoute>
                  <GroceryListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </GroceryListProvider>
    </AuthProvider>
  );
}

export default App;
