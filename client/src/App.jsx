import React from "react";
import { BrowserRouter, Route, Link, Routes } from "react-router-dom";
import "../src/App.css";
import FrontPage from "./components/FrontPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="nav-bar">
          <Link className="nav-bar-link">User</Link>
          <Link className="nav-bar-link">My Grocery</Link>
          <Link className="nav-bar-link">Add To List</Link>
        </div>
        <Routes>
          <Route path="/" element={<FrontPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
