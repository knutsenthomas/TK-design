import Link from "next/link";
import React from "react";

const PageHeader = ({heading, page}) => {
  return (
    <div className="container pt_120 pb_120">
      <div className="flex justify-center">
        <div>
          <div className="text-center">
            <h1 className="lg:text-6xl sm:text-4xl text-3xl text-white lg:mb-10 sm:mb-9 mb-6 font-bold">{heading}</h1>
            <ul className="flex items-center justify-center sm:flex-nowrap flex-wrap sm:gap-[10px] gap-y-1 gap-x-[14px]">
              <li className="text-2xl font-caveat">
                <Link href="/" className="text-white">Home</Link>
              </li>
              <li className="text-white text-2xl">/</li>
              <li className="text-clr_base font-caveat text-2xl">{page}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
