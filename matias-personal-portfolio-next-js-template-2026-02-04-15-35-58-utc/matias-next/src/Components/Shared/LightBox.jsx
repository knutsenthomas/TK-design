import React, { useState } from "react";
import { XLg, ChevronRight, ChevronLeft } from "react-bootstrap-icons";
const Lightbox = ({ images, setLightboxOpen, currentId }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentId);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="max-w-[80%] text-center relative">
        <button className="absolute -top-4 -right-4 border-none cursor-pointer text-lg text-white" onClick={closeLightbox}>
          <i>
            <XLg />
          </i>
        </button>
        <div>
          <img
            src={images[currentImageIndex]}
            alt={`Image ${currentImageIndex + 1}`}
          />
        </div>
        <div className="text-sm text-clr_pra absolute right-4 -bottom-5">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>
      <div className="w-full flex justify-between absolute bg-transparent text-white border-none py-[10px] px-5 cursor-pointer">
        <button className="text-2xl" onClick={prevImage}>
          <ChevronLeft/>
        </button>
        <button className="text-2xl" onClick={nextImage}>
          <i>
            <ChevronRight />
          </i>
        </button>
      </div>
    </div>
  );
};

export default Lightbox;
