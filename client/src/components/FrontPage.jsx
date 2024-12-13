// FrontPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../components/frontpage.css";

function FrontPage({ searchTerm }) {
  const [getVeg, setGetVeg] = useState([]);
  const [filteredVeg, setFilteredVeg] = useState([]);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    getVegetables();
  }, []);

  useEffect(() => {
    const filtered = getVeg.filter((veg) =>
      veg["Product Name"].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVeg(filtered);
  }, [searchTerm, getVeg]);

  async function getVegetables() {
    try {
      const res = await axios.get("http://localhost:3000/products/vegetables");
      setGetVeg(res.data);
      setFilteredVeg(res.data);
    } catch (err) {
      console.error("Error fetching vegetables:", err);
    }
  }

  function addToUserList(product) {
    const savedList = JSON.parse(localStorage.getItem("userList")) || [];
    const existingProductIndex = savedList.findIndex(
      (item) => item._id.$oid === product._id.$oid
    );

    if (existingProductIndex > -1) {
      // If product exists, update its quantity
      savedList[existingProductIndex].quantity += 1;
    } else {
      // If product does not exist, add it with an initial quantity of 1
      const updatedProduct = { ...product, quantity: 1 };
      savedList.push(updatedProduct);
    }

    setUserList(savedList);
    localStorage.setItem("userList", JSON.stringify(savedList));
  }

  return (
    <div className="horizontal-scroll-container">
      {filteredVeg.map((veg) => (
        <div key={veg._id.$oid} className="fruitsveg-product-card">
          <img
            src={veg["Image URL"]}
            alt={veg["Product Name"]}
            className="fruitveg-img"
          />
          <div className="fruitveg-product-name">
            <p>{veg["Product Name"]}</p>
            <p>{veg.Price}</p>
            <button
              onClick={() => addToUserList(veg)}
              className="add-to-list-button"
            >
              Add to List
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FrontPage;

