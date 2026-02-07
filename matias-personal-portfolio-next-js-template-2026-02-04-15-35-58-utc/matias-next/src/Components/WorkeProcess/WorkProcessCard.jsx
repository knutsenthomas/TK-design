import React from "react";

const WorkProcessCard = ({ title, info, list }) => {
  return (
    <div
      data-aos="flip-up"
      data-aos-duration="500"
    >
      <div className="overflow-hidden duration-500 border border-clr_cusborder rounded-[10px] p-[30px] relative after:absolute after:w-[50px] after:h-[50px] after:bottom-0 after:right-0 after:content-[''] after:bg-[#121212] after:rounded-tl-[100px] after:rounded-tr-[20px] after:duration-500 hover:border-clr_base  hover:after:bg-clr_base">
        <h2 className="text-white lg:mb-6 mb-4 capitalize sm:text-[40px] text-3xl leading-[120%] font-semibold">
          {title}
        </h2>
        <p className="lg:mb-[30px] mb-5 text-clr_pra text-lg">{info}</p>
        <ul>
          {list.map((li, index) => (
            <li
              key={index}
              className="relative flex items-center gap-[10px] text-[#999999]  pl-5 mb-2 last:mb-0"
            >
              <span className="w-[9px] h-[9px] bg-clr_base rounded-full"></span>
              <p className="text-sm">{li}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WorkProcessCard;
