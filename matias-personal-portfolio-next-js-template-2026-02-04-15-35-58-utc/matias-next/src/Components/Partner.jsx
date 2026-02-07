'use client'
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Pagination, Autoplay, Navigation } from "swiper/modules";

const partnerList = [
  {
    id: 1,
    image: "/img/testimonial/partner1.png",
  },
  {
    id: 2,
    image: "/img/testimonial/partner2.png",
  },
  {
    id: 3,
    image: "/img/testimonial/partner3.png",
  },
  {
    id: 4,
    image: "/img/testimonial/partner4.png",
  },
  {
    id: 5,
    image: "/img/testimonial/partner1.png",
  },
];
const Partner = () => {
  return (
    <>
      <div className="pt_120">
        <h4
          className="text-center mx-auto mb-[60px] text-white text-2xl font-semibold leading-[130%]"
          data-aos="fade-down"
          data-aos-duration="1000"
        >
          More than 100+ companies trusted us worldwide
        </h4>
        <div className="swiper justify-between">
          <Swiper
            spaceBetween={50}
            slidesPerView={5}
            loop={true}
            modules={[Pagination, Autoplay, Navigation]}
          >
            {partnerList.map(({ id, image }) => {
              return (
                <SwiperSlide key={id}>
                  <div
                    key={id}
                    className="swiper-slide text-center flex justify-center relative"
                  >
                    <img src={image} alt="img" />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default Partner;
