'use client'
import React, { useState } from "react";
import Link from "next/link";
import { Eye } from "react-bootstrap-icons";
import Lightbox from "../Shared/LightBox";

const Blog = ({ date, heading, image, index }) => {
  const [currentId, setCurrentId] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = (index) => {
    setCurrentId(index);
    setLightboxOpen(true);
  };
  return (
    <>
      <div
        className="flex sm:flex-row flex-col justify-between items-center gap-4 lg:pb-10 pb-[30px] lg:pt-10 pt-[30px] group duration-500 border-b border-b-[rgb(38_37_37)] hover:border-b-clr_base hover:first:border-t-clr_base first:border-t first:border-t-[rgb(38_37_37)]"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        <div className="shrink basis-4/5 flex md:flex-row flex-col justify-between md:items-center sm:items-start items-center gap-4 ">
          <div className="shrink basis-1/2 ">
            <div>
              <span className="text-clr_pra text-base border border-clr_cusborder rounded-[100px] py-[7px] px-[15px] sm:mb-6 mb-[18px] inline-block">
                {date}
              </span>
              <h3 className="xl:text-3xl sm:text-[22px] text-xl text-white sm:leading-[44px] leading-8 font-semibold capitalize">
                <Link
                  href={"/blog-details"}
                  className="text-white duration-500 group-hover:text-clr_base"
                >
                  {heading}
                </Link>
              </h3>
            </div>
          </div>
          <div className="duration-500 md:opacity-0 opacity-100 group-hover:opacity-100">
            <img
              src={image}
              alt="img-opa "
              onClick={() => openLightbox(index)}
              className="max-w-[290px] h-[157px] cursor-pointer"
            />
          </div>
        </div>
        <div className="w-[60px] h-[60px] flex justify-center items-center bg-none rounded-full border border-white duration-500 group-hover:border-clr_base">
          <Eye className="text-white duration-500 group-hover:text-clr_base" />
        </div>
      </div>
      {lightboxOpen && (
        <Lightbox
          images={["/img/blog/bblog1.png", "/img/blog/bblog2.png", "/img/blog/bblog3.png", "/img/blog/bblog4.png"]}
          setLightboxOpen={setLightboxOpen}
          currentId={currentId}
        />
      )}
    </>
  );
};

export default Blog;
