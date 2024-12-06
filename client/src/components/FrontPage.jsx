import React, { useEffect, useState } from "react";
import axios from "axios";

function FrontPage() {
  const [getVeg, setGetVeg] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/fruits&veg").then((res) => {
      setGetVeg(res.data);
      console.log(getVeg);
    });
  }, []);

  return (
    <>
      <div className="fruitsveg-product-card">
        <div className="fruitveg-product-name">
          <h4>Fruits & Veg</h4>
        </div>
        <div className="fruitveg-product">
          <div className="fruitveg-img"></div>
        </div>
      </div>
    </>
  );
}

export default FrontPage;
