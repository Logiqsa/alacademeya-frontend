import React, { useState, useEffect } from "react";
import img1 from "../../assets/image1.png";
import img2 from "../../assets/image2.png";
import img3 from "../../assets/image3.png";

const AuthLayout = ({ children }) => {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const images = [img1, img2, img3];

  useEffect(() => {
    let interval;

    if (isHovered) {
      interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, 800);
    } else {
      setIndex(0);
    }

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  return (
//     <div
//       className="w-full min-h-screen flex items-center justify-center bg-white px-4 py-8"
//       dir="rtl"
//     >
//       <div
//         className="
//           w-full max-w-6xl
//           flex flex-col lg:flex-row-reverse
//           items-center justify-center
//           gap-10 lg:gap-16
//         "
//       >
//         {/* IMAGE SECTION */}
//       {/* IMAGE SECTION */}
// <div
//   onMouseEnter={() => setIsHovered(true)}
//   onMouseLeave={() => setIsHovered(false)}
//   className="
//     w-full
//     lg:flex-1
//     hidden lg:flex
//     items-center justify-center
//   "
// >
//   <div
//     className="
//       w-full
//       max-w-md sm:max-w-lg lg:max-w-xl
//       aspect-square sm:aspect-[4/3]
//       lg:h-[595px]
//       rounded-3xl
//       overflow-hidden
//       flex items-center justify-center
//     "
//   >
//     <img
//       src={images[index]}
//       alt="Auth Animation"
//       className="w-full h-full object-contain transition-all duration-500"
//     />
//   </div>
// </div>

//         {/* FORM SECTION */}
//         <div
//           className="
//             w-full
//             lg:flex-1
//             flex flex-col
//             justify-center
//             px-2 sm:px-6 lg:px-10
//           "
//         >
//           {children}
//         </div>
//       </div>
//     </div>

<></>
  );
};

export default AuthLayout;