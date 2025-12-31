import React, { useEffect, useState } from "react";
import axios from "axios";
import "./frontpage.css";

function UserList() {
  const [userList, setUserList] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const savedList = JSON.parse(localStorage.getItem("userList")) || [];
    setUserList(savedList);
    calculateTotalPrice(savedList);
  }, []);

  function incrementQuantity(productId) {
    const updatedList = userList.map((item) => {
      if (item._id.$oid === productId) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    setUserList(updatedList);
    calculateTotalPrice(updatedList);
    localStorage.setItem("userList", JSON.stringify(updatedList));
  }

  function decrementQuantity(productId) {
    const updatedList = userList.map((item) => {
      if (item._id.$oid === productId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    setUserList(updatedList);
    calculateTotalPrice(updatedList);
    localStorage.setItem("userList", JSON.stringify(updatedList));
  }

  function calculateTotalPrice(list) {
    const total = list.reduce((sum, item) => {
      const price = parseFloat(item.Price.replace("R", "").replace(",", ""));
      return sum + price * item.quantity;
    }, 0);
    setTotalPrice(total.toFixed(2)); // Format to two decimal places
  }

  function removeFromUserList(productId) {
    const updatedList = userList.filter((product) => product._id.$oid !== productId);
    setUserList(updatedList);
    calculateTotalPrice(updatedList);
    localStorage.setItem("userList", JSON.stringify(updatedList));
  }

  return (
    <div>
      <h4>Your Grocery List</h4>
      <div className="user-product-list">
        {userList.length > 0 ? (
          userList.map((item) => (
            <div key={item._id.$oid} className="user-product-card">
              <img
                src={item["Image URL"]}
                alt={item["Product Name"]}
                className="product-image"
              />
              <div className="product-details">
                <p>{item["Product Name"]}</p>
                <p>{item.Price}</p>
                <p>Quantity: {item.quantity}</p>
                <button
                  onClick={() => incrementQuantity(item._id.$oid)}
                  className="increment-button"
                >
                  +
                </button>
                <button
                  onClick={() => decrementQuantity(item._id.$oid)}
                  className="decrement-button"
                >
                  -
                </button>
                <button
                  onClick={() => removeFromUserList(item._id.$oid)}
                  className="remove-from-list-button"
                >
                  x
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Your grocery list is empty.</p>
        )}
         </div>
      <h4>Total Price: R{totalPrice}</h4>
    </div>
  );
}

export default UserList;