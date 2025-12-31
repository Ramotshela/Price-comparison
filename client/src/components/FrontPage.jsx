// FrontPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./frontpage.css";
import UserList from "./UserList";

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
  setUserList((prevList) => {
    const checkProductId=prevList.includes(product._id)
           
        if (checkProductId) {
          return prevList.map((item)=>
[
 
//0+  l...item, quantity: item.quantity + 1 ]
          )
        }else{
            [...prevList, { ...product, quantity: 1 }];
        }
            
   
})
 }
useEffect(() => {
  console.log(userList);
}, [userList]);

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
