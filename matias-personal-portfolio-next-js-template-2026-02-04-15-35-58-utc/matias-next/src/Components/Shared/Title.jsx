import React from "react";

const Title = ({ mainTitle, sortTitle }) => {
  return (
    <div className="text-center max-w-[920px] mx-auto md:mb-[60px] sm:mb-[50px] mb-[45px]">
      <p
        className="text-2xl font-caveat text-clr_base relative flex justify-center items-center sm:gap-6 gap-[14px] mx-auto mb-[30px]"
        data-aos="fade-down"
        data-aos-duration="1000"
      >
       <span className="sm:w-20 w-[50px] h-[1px] bg-clr_base"></span> {sortTitle} <span className="sm:w-20 w-[50px] h-[1px] bg-clr_base"></span>
      </p>
      <h2 className="font-medium lg:text-6xl md:text-5xl sm:text-4xl text-[29px] text-white lg:leading-[120%] md:leading-tight leading-9" data-aos="fade-up" data-aos-duration="1200">
        {mainTitle}
      </h2>
    </div>
  );
};

export default Title;
