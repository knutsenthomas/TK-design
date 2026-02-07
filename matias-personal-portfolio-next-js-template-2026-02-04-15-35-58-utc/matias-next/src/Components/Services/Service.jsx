import Link from "next/link";
import React from "react";
import { ArrowUpRight } from "react-bootstrap-icons";

const Service = ({ heading, subHeading, para, id }) => {
  return (
    <div
      className="lg:pb-10 pb-[30px] lg:pt-10 pt-[30px] flex justify-between items-center sm:gap-[14px] gap-5 sm:flex-nowrap flex-wrap border-b duration-500 border-b-[rgb(38_37_37)] first:border-t first:border-t-[rgb(38_37_37)] hover:border-b-clr_base hover:first:border-t-clr_base group"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className="w-[1062px] flex items-center justify-between md:flex-nowrap flex-wrap md:gap-[14px] gap-2 ">
        <div className="flex lg:gap-[60px] gap-[16px]">
          <span className="text-xl text-white"> {id} </span>
          <div>
            <h5 className="text-base lg:text-xl font-semibold text-white mb-2">{subHeading}</h5>
            <h2 className="text-[26px] xl:text-[40px] lg:text-3xl font-semibold lg:leading-[120%]">
              <Link href={"/service-details"} className="text-white duration-500">
                {" "}
                {heading}{" "}
              </Link>
            </h2>
          </div>
        </div>
        <p className="text-clr_pra text-base lg:w-[400px] w-[300px]">{para}</p>
      </div>

      <Link
        href={"/service-details"}
        className="h-[45px] w-[45px] sm:w-[60px] sm:h-[60px] rounded-md bg-[#1D1D1D] flex justify-center items-center duration-500 group-hover:bg-clr_base cursor-pointer"
      >
        <ArrowUpRight className="duration-500 group-hover:text-clr_title text-lg sm:text-xl text-white " />
      </Link>
    </div>
  );
};

export default Service;
