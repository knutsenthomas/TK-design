'use client'
import React from "react";
import Marquee from "react-fast-marquee";


const MarqueeWapper = ({images, direction}) => {
  return (
    <div className="text-slider bg-clr_base py-3 h-[90px] flex items-center">
      <div>
        <Marquee direction={direction}>
          {
            images?.map(({id, image})=> <img key={id} src={image} alt=""/>)
          }
        </Marquee>
      </div>
    </div>
  );
};

export default MarqueeWapper;
