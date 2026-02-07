'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { List, ArrowRight, X } from "react-bootstrap-icons";
import Drawer from "./Drawer";
import { menuList } from "@/Utlits/menuList";


const RanderHeader = () => {
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [dropDownId, setDropDownId] = useState(null);
  const [fixdHeader, setFixedHeader] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", isSticky);
    return () => {
      window.removeEventListener("scroll", isSticky);
    };
  }, []);

  const isSticky = (e) => {
    const scrollTop = window.scrollY;

    scrollTop >= 35 ? setFixedHeader(true) : setFixedHeader(false);
  };

  const handleHeaderToggle = () => {
    setMenuActive(!menuActive);
  };

  const handleSubMenu = (id) => {
    setDropDownId(id);
  };

  return (
    <header
      className={` ${fixdHeader ? "fixed top-0 left-0 z-50 bg-black" : "relative"
        } w-full border-b border-b-clr_cusborder z-10  xxl:after:block after:hidden after:absolute after:right-[calc(20%-30px)] after:top-0 after:w-[1px] after:h-full after:content:[''] after:bg-clr_cusborder  xxl:before:block before:hidden before:absolute before:left-[calc(15%-40px)] before:top-0 before:w-[1px] before:h-full before:content:[''] before:bg-clr_cusborder`}
    >
      <div className="xxl:max-w-[1805px] container mx-auto px-3">
        <div className="flex justify-between items-center w-full relative py-5">
          <div className="main__logo">
            <Link href={"/"} className="block xl:w-[150px] w-[100px]">
              <img
                src={"/img/logo/logo.png"}
                alt="logo"
                className="w-full h-full object-contain"
              />
            </Link>
          </div>
          <ul
            className={`flex lg:flex-row flex-col lg:items-center lg:gap-[14px] gap-0 fixed lg:static top-20 left-0 w-full lg:w-auto bg-clr_subtitle max-h-[calc(100vh-130px)]  lg:h-full  lg:bg-transparent  duration-500 origin-top px-3 ${menuActive
              ? "opacity-100 visible"
              : "opacity-0 invisible lg:opacity-100 lg:visible"
              }`}
          >
            {menuList.map(({ id, name, path, dropDown, section }) => {
              return (
                <li
                  className="relative transition-all border-b-2 border-b-clr_cusborder lg:border-none last:border-none lg:py-0 py-4 group/dropdown"
                  key={id}
                  onClick={() => handleSubMenu(id)}
                >
                  <Link
                    href={`${path}${section ? section : ""}`}
                    className="text-clr_white font-500 xxl:text-base text-sm uppercase lg:py-[10px] py-0 xxl:px-[16px] xl:px-[10px] px-1 hover:text-clr_base "
                  >
                    {name}
                  </Link>
                  {dropDown?.length && (
                    <ul
                      className={`lg:absolute static top-16 left-0  w-[250px] px-5 py-2 leading-9 z-50 transition-all bg-clr_white shadow-mainShadow justify-center  block gap-[5px] before:absolute before:content-[''] before:-top-[18px] before:left-[26px] before:w-0 before:h-0  before:border-l-[13px] before:border-l-transparent before:border-r-[13px] before:border-r-transparent lg:before:border-b-[18px] lg:before:border-b-white lg:opacity-0 lg:invisible lg:translate-y-11 duration-500 group-hover/dropdown:opacity-100 group-hover/dropdown:visible group-hover/dropdown:translate-y-0 ${dropDownId === id ? "" : ""
                        }`}
                    >
                      {dropDown.map(({ id, name, path }) => {
                        return (
                          <li key={id}>
                            <Link
                              href={path}
                              className="text-clr_body duration-500 hover:text-clr_base hover:pl-3 block"
                            >
                              {name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="flex items-center gap-2 xxl:px-[26px] xxl:py-[19px] lg:px-[16px] lg:py-[9px] px-[11px] py-[7px] font-medium text-lg  capitalize relative bg-clr_base overflow-hidden rounded-[5px] transition-all text-clr_subtitle max-h-[58px]  before:absolute before:content-[''] before:bottom-full before:bg-[#aad302] before:left-0 before:w-full before:h-full before:duration-500 before:bg-opacity-80 hover:before:bottom-0"
            >
              <span className="text-sm xl:text-lg z-10 relative duration-500">
                Let's Talk
              </span>
              <span>
                <ArrowRight className="text-xl z-10 relative duration-500" />
              </span>
            </Link>
            <div
              onClick={handleHeaderToggle}
              className={`lg:hidden ${menuActive ? "active" : ""}`}
            >
              {menuActive ? (
                <X className="text-[32px]  text-clr_white cursor-pointer" />
              ) : (
                <List className="text-[32px]  text-clr_white cursor-pointer" />
              )}
            </div>
            <div
              onClick={() => setIsSidebarActive(true)}
              className="xl:w-[58px] xl:h-[58px]  w-[39px] h-[39px] rounded-md flex items-center justify-center bg-clr_white cursor-pointer"
            >
              <List className="lg:text-[32px] text-[22px] text-clr_title" />
            </div>
          </div>
        </div>
      </div>
      <Drawer
        isSidebarActive={isSidebarActive}
        setIsSidebarActive={setIsSidebarActive}
      />
    </header>
  );
};

export default RanderHeader;
