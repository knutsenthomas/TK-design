import React from "react";
import { XLg, ChevronRight } from "react-bootstrap-icons";
import { socialIcons } from "../../../Utlits/socilIcons";
import Link from "next/link";

const Drawer = ({ isSidebarActive, setIsSidebarActive }) => {
  return (
    <div
      className={`w-80 h-full fixed z-50  top-0 duration-500 overflow-y-scroll bg-black ${
        isSidebarActive ? "right-0" : "-right-80"
      }`}
    >
      <div
        onClick={() => setIsSidebarActive(false)}
        className="flex justify-center items-center w-10 h-10 m-[10px] bg-clr_base ml-auto p-[5px] rounded-md hover:cursor-pointer"
      >
        <i className="text-[22px] text-clr_mtitle">
          <XLg />
        </i>
      </div>
      <div className="grid py-10 px-5">
        <Link href={""} className="mb-5">
          <img src={"/img/logo/logo.png"} alt="img" />
        </Link>
        <p className="text-sm mb-10 text-clr_pra break-words leading-normal">
          Neque porro quisquam est, qui dolorem ipsum quia dolor sit
          consectetur, aliquam quaerats voluptatem. Ut enim ad minima veniam,
          exercitationem laboriosam, nisi ut aliquid ex ea autem velit esse quam
          nihil
        </p>
        <div className="grid gap-6 mb-10">
          <div>
            <div>
              <span className="block mb-2 uppercase text-clr_pra font-bold text-sm"> address </span>
              <span className="textp capitalize text-white font-medium leading-[120%]"> Victoria Street London, </span>
            </div>
          </div>
          <div>
            <div>
              <span className="block mb-2 uppercase text-clr_pra font-bold text-sm"> email </span>
              <Link href={"#"} className="textp capitalize text-white font-medium leading-[120%]"> matias999@.com </Link>
            </div>
          </div>
          <div>
            <div>
              <span className="block mb-2 uppercase text-clr_pra font-bold text-sm"> call now </span>
              <Link href={"#"} className="textp capitalize text-white font-medium leading-[120%]"> +98 4758 2154 021 </Link>
            </div>
          </div>
        </div>
        <div className="lg:mb-20 mb-14 relative">
          <ul className="flex gap-[14px]">
            {socialIcons.map(({ icon, id }) => (
              <li key={id}>
                <Link
                  href={"#"}
                  className="w-[45px] h-[45px] rounded-full bg-clr_base border border-clr_base  flex justify-center items-center "
                >
                  <i className="text-clr_title">{icon}</i>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link
          href={"#"}
          className="flex justify-center items-center gap-2 font-medium px-[30px] pt-5 pb-[21px] text-lg leading-[120%]  capitalize relative bg-clr_base overflow-hidden rounded-[5px] duration-500 text-clr_subtitle before:absolute before:content-[''] before:bottom-full before:bg-[#aad302] before:left-0 before:w-full before:h-full before:duration-500 before:bg-opacity-80 hover:before:bottom-0"
        >
          <span className="z-10 relative duration-500">
            <i>
              <ChevronRight />
            </i>
          </span>
          <span className="z-10 relative duration-500"> Let's Talk </span>
        </Link>
      </div>
    </div>
  );
};

export default Drawer;
