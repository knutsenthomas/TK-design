import React from "react";
import { XLg } from "react-bootstrap-icons";

const VideoPlay = ({ setLightboxOpen, url }) => {
  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="text-center relative">
        <button className="absolute -top-4 -right-4 border-none cursor-pointer text-lg text-white" onClick={closeLightbox}>
          <i>
            <XLg />
          </i>
        </button>
        <iframe
          className="lg:w-[800px] lg:h-[500px] md:w-[600px] md:h-[400px] sm:w-[400px] sm:h-[300px]  w-80 h-52"
          src={url}
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlay;
