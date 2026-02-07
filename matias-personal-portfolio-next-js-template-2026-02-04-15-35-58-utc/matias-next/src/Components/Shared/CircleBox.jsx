import Link from "next/link";
import React from "react";
import { ArrowRight } from "react-bootstrap-icons";

const CircleBox = () => {
  return (
    <div>
      <Link
        href={"/protfolio"}
        className="md:w-52 md:h-52 w-32 h-32 bg-clr_base rounded-full flex justify-center items-center text-center relative before:w-full before:h-full before:rounded-full before:border before:border-clr_base before:content-[''] before:absolute before:top-[10px] before:-left-[7px]  before:duration-500 hover:before:-top-[10px] "
        data-aos="zoom-out-down"
        data-aos-duration="2000"
      >
        <span className="relative z-10">
          <i className="mb-[1px] md:text-[28px] text-base text-center flex justify-center text-clr_title transition-all">
            <ArrowRight />
          </i>
          <span className="text-[#282828] md:text-lg text-sm font-medium leading-[30px] capitalize transition-all">
            {" "}
            Click More Work{" "}
          </span>
        </span>
      </Link>
    </div>
  );
};

export default CircleBox;
