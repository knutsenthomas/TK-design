import Link from "next/link";
import React from "react";
import { ArrowUpRight } from "react-bootstrap-icons";

const ProjectCard = ({
  image,
  heading,
  subHeading,
  index,
  openLightbox,
  navigate,
}) => {
  return (
    <div
      className={`overflow-hidden group ${(index === 2 || index === 5) ? "md:mb-0 mb-[30px]":"xl:mb-[60px] lg:mb-[50px] mb-[30px]"}`}
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div onClick={() => openLightbox(index)} className="overflow-hidden lg:mb-[30px] mb-[20px] block w-full cursor-pointer">
        <img src={image} alt="img" className="w-full overflow-hidden duration-500 rounded-[10px] group-hover:scale-105" />
      </div>
      <div className="flex items-center justify-between gap-1">
        <Link href={navigate} className="left__cont">
          <span className="text-clr_base xl:mb-4 mb-2 block uppercase xl:text-lg text-base">
            {heading}
          </span>
          <h3 className="xl:text-[30px] sm:text-2xl text-xl font-semibold text-white">{subHeading}</h3>
        </Link>
        <div onClick={() => openLightbox(index)} className="h-[45px] w-[45px] sm:w-[60px] sm:h-[60px] rounded-md bg-[#1D1D1D] flex justify-center items-center duration-500 group-hover:bg-clr_base cursor-pointer">
          <ArrowUpRight className="duration-500 group-hover:text-clr_title text-lg sm:text-xl text-white " />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
