import React,{useState} from "react";
import { BrowserRouter, Route, Link, Routes } from "react-router-dom";
import "../src/App.css";
import FrontPage from "./components/FrontPage";
import UserList from "./components/UserList";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <>
    <BrowserRouter>
      <div className="nav-bar">
        <Link to="/" className="nav-bar-link">Home</Link>
        <Link to="/list" className="nav-bar-link">My Grocery List</Link>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <Routes>
        <Route path="/" element={<FrontPage searchTerm={searchTerm} />} />
        <Route path="/list" element={<UserList />} />
      </Routes>
    </BrowserRouter>
      {/* <BrowserRouter>
        <div className="nav-bar">
          <Link className="nav-bar-link">User</Link>
          <Link className="nav-bar-link">My Grocery</Link>
          <Link className="nav-bar-link">Add To List</Link>
        </div>
        <Routes>
          <Route path="/" element={<FrontPage />} />
        </Routes>
      </BrowserRouter> */}
    </>
  );
}

export default App;
