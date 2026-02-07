import Link from "next/link";
import React from "react";
import { ArrowRight } from "react-bootstrap-icons";

const Price = ({ image, planName, price, time, fetcher, id }) => {
  return (
    <div data-aos="fade-up" data-aos-duration="1000">
      <div
        className={`before:hidden border border-clr_cusborder py-5 px-[18px] rounded-[10px] duration-500 hover:border-clr_base ${
          id === 2 && "bg-clr_base"
        } `}
      >
        <div
          className={`w-[90px] h-[90px] flex items-center justify-center rounded-lg  ${
            id === 2 ? "bg-clr_title" : "bg-clr_base"
          }  mb-10`}
        >
          <img src={image} alt="img" />
        </div>
        <h4 className="text-white lg:mb-6 mb-4 text-2xl font-semibold">
          {planName}
        </h4>
        <h2 className="lg:mb-10 lg:pb-10 mb-7 pb-7 flex text-6xl border-b border-b-clr_cusborder  text-white font-bold">
          {price}
          <span className="text-xl self-end leading-[2.2] font-medium">
            /{time}
          </span>
        </h2>
        <ul className="mb-10">
          {fetcher?.map((fet, index) => (
            <li key={index} className="flex items-center gap-3 mb-2">
              <span
                className={`w-[9px] h-[9px]  ${
                  id === 2 ? "bg-clr_mtitle" : "bg-clr_base"
                } rounded-full`}
              ></span>
              <span
                className={`  ${
                  id === 2 ? "text-clr_mtitle" : "text-clr_pra"
                } text-[15px]`}
              >
                {fet}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href={""}
          className={`flex items-center justify-center gap-2 w-full  ${
            id === 2 ? "bg-clr_mtitle" : " bg-clr_base"
          } py-[30px] pt-5 pb-[21px] font-medium text-lg leading-[120%] overflow-hidden capitalize relative rounded-[5px] duration-500  before:absolute before:content-[''] before:bottom-full before:bg-[#aad302] before:left-0 before:w-full before:h-full before:duration-500 before:bg-opacity-80 hover:before:bottom-0`}
        >
          <span
            className={` ${
              id === 2 ? "text-white" : "text-black"
            } relative z-10 duration-500`}
          >
            Start My Project Now
          </span>
          <span>
            <i
              className={` ${
                id === 2 ? "text-white" : "text-black"
              } text-xl relative z-10 duration-500`}
            >
              <ArrowRight />
            </i>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Price;
