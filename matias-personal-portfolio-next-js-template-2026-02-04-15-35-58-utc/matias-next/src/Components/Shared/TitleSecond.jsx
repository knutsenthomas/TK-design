import React from "react";

const TitleSecond = ({ mainTitle, sortTitle }) => {
  return (
    <div className="pb-[50px] ">
      <span
        className="text-2xl font-caveat text-clr_base relative flex  items-center sm:gap-6 gap-[14px] mx-auto mb-[30px]"
        data-aos="fade-down"
        data-aos-duration="1000"
      >
        <span className="sm:w-20 w-[50px] h-[1px] bg-clr_base"></span>
        {sortTitle}
      </span>
      <h2
        className="font-medium lg:text-6xl md:text-5xl sm:text-4xl text-[29px] text-white max-w-[620px]"
        data-aos="fade-down"
        data-aos-duration="1600"
      >
        {mainTitle}
      </h2>
    </div>
  );
};

export default TitleSecond;
