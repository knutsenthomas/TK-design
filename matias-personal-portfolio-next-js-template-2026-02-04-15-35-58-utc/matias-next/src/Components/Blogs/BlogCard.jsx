import Link from "next/link";
import React from "react";
import { ArrowRight } from "react-bootstrap-icons";

const BlogCard = ({ heading, para, image, date }) => {
  return (
    <div
      className="xl:mb-[50px] mb-[30px] group "
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <Link href={"/blog-details"} className="overflow-hidden block">
        <img src={image} alt="img" className="w-full overflow-hidden duration-500 group-hover:scale-105" />
      </Link>
      <div className="w-[90%] bg-clr_body rounded-tr-lg py-[30px] pr-[14px] pl-5 -translate-y-[70px] -mb-[70px]">
        <span className="flex items-center gap-1 text-clr_pra text-base mb-[30px]">
          <span className="uppercase text-white">NEWS</span>. {date}
        </span>
        <h3 className="border-b border-b-clr_cusborder pb-[30px] mb-[30px] text-4xl font-semibold capitalize ">
          <Link href={"/blog-details"} className="text-white duration-500 group-hover:text-clr_base">{heading}</Link>
        </h3>
        <p className="text-clr_pra text-base mb-[30px]">{para}</p>
        <Link
          href={"/blog-details"}
          className="max-w-[200px] flex justify-center items-center gap-2 font-medium px-[30px] pt-5 pb-[21px] text-lg leading-[120%]  capitalize relative bg-clr_base overflow-hidden rounded-[5px] duration-500 text-clr_subtitle before:absolute before:content-[''] before:bottom-full before:bg-[#aad302] before:left-0 before:w-full before:h-full before:duration-500 before:bg-opacity-80 hover:before:bottom-0"
        >
          <span className="z-10 relative duration-500">Read More</span>
          <span>
            <i className="z-10 relative duration-500">
              <ArrowRight/>
            </i>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
