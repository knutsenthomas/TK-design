import Link from "next/link";
import React from "react";
import { ArrowRight } from "react-bootstrap-icons";

const Form = ({ isColTwo }) => {
  return (
    <div className="bg-common_bg p-[30px] rounded-lg">
      <h3 className="mb-5 text-white capitalize sm:text-[32px] text-[26px] font-semibold">
        Leave a Reply
      </h3>
      <p className="text-clr_pra mb-[30px]">
        Your email address will not be published. Required fields are marked *
      </p>
      <form action="#" className={`flex flex-col gap-6`}>
        <div className={`gap-6 flex ${isColTwo ? " sm:flex-row flex-col " : "flex-col"}`}>
          <div className={`w-full`}>
            <input
              type="text"
              placeholder="Name"
              className="w-full py-[18px] px-5 rounded-[10px] bg-[rgb(29_29_29)] border border-clr_cusborder text-white outline-none"
            />
          </div>
          <div className={`w-full`}>
            <input
              type="email"
              placeholder="Eamil"
              className="w-full py-[18px] px-5 rounded-[10px] bg-[rgb(29_29_29)] border border-clr_cusborder text-white outline-none"
            />
          </div>
        </div>
        <div>
          <textarea
            name="comment"
            rows="5"
            placeholder="Write Comments"
            className="w-full py-[18px] px-5 rounded-[10px] bg-[rgb(29_29_29)] border border-clr_cusborder text-white outline-none"
          ></textarea>
        </div>
        <Link
          href={""}
          className="w-[250px] flex justify-center items-center gap-2 font-medium px-[30px] pt-5 pb-[21px] text-lg leading-[120%]  capitalize relative bg-clr_base overflow-hidden rounded-[5px] duration-500 text-clr_subtitle before:absolute before:content-[''] before:bottom-full before:bg-[#aad302] before:left-0 before:w-full before:h-full before:duration-500 before:bg-opacity-80 hover:before:bottom-0"
        >
          <span className="z-10 relative duration-500">Submit Comment</span>

          <i className="z-10 relative duration-500 text-xl">
            <ArrowRight />{" "}
          </i>
        </Link>
      </form>
    </div>
  );
};

export default Form;
