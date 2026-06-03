import React, { useState, useEffect } from "react";
import img1 from "../../assets/image1.png";
import img2 from "../../assets/image2.png";
import img3 from "../../assets/image3.png";

const AuthLayout = ({ children }) => {
  const [index, setIndex] = useState(0);
  const images = [img1, img2, img3];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* LEFT SIDE → FORM (زي الصورة) */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6">
        {children}
      </div>

      {/* RIGHT SIDE → IMAGE */}
      {/* <div className="hidden md:flex w-1/2 relative items-center justify-center bg-[#e9eef6] overflow-hidden">
        <img
          src={images[index]}
          alt="slide"
          className="w-[80%] h-auto object-contain transition-all duration-700"
        />
      </div> */}

    </div>
  );
};

export default AuthLayout;