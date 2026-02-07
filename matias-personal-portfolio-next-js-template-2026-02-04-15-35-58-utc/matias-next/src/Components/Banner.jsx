'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Globe, Instagram, PlayFill, ArrowUpRight } from "react-bootstrap-icons";
import VideoPlay from "./Shared/VideoPlay";

const socalIcon = [
  {
    id: 1,
    link:"#",
    icon: <Facebook />,
  },
  {
    id: 2,
    link:"#",
    icon: <Twitter />,
  },
  {
    id: 3,
    link:"#",
    icon: <Linkedin />,
  },
  {
    id: 4,
    link:"#",
    icon: <Globe />,
  },
  {
    id: 5,
    link:"#",
    icon: <Instagram />,
  },
];
const Banner = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [position, setPosition] = useState(false);

  useEffect(() => {
    if (!position) {
      setPosition(true)
    }
  }, []);

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  return (
    <section id="home">
      <div className="container">
        <div className="grid md:grid-cols-[70%_auto] gap-5">
          <div>
            <div className="xl:pt-[145px] xl:pb-[180px] lg:pt-[120px] lg:pb-[150px] md:pt-[90px] md:pb-[100px] sm:pt-[80px] sm:pb-[85px] py-[60px] xl:pl-10 pl-0">
              <Link href={"#"} className="md:text-[24px] text-base leading-[140%] md:mb-[50px] mb-6  border-b border-b-clr_white text-clr_white inline-block pb-4 hover:text-clr_base hover:border-b-clr_base capitalize">
                <span className="block">
                  Currently available for freelance
                </span>
                <span className="flex gap-4 items-center">
                  worldwide
                  <i className="">
                    <ArrowUpRight />
                  </i>
                </span>
              </Link>
              <h1 className="lg:text-[116px] md:text-[68px] sm:text-[48px] text-[34px] font-semibold sm:mb-[50px] mb-[30px] leading-[120%]">
                <span className="text-clr_white"> Creative Visual</span>
                <span className="block designers" data-text="Designer">
                  Designer
                </span>
              </h1>
              <div className="flex items-center gap-6">
                <img src={"/img/banner/bn-arrow.png"} alt="img" />
                <div onClick={openLightbox} className="cursor-pointer relative xl:w-20 xl:h-20 sm:w-[60px] sm:h-[60px] w-[50px] h-[50px] flex justify-center items-center rounded-full border border-clr_white before:absolute before:border-2 before:border-clr_white before:w-full before:h-full before:content:[''] before:rounded-full before:animate-scales  ">
                  <i className="text-clr_white sm:text-[42px] text-[30px]">
                    <PlayFill />
                  </i>
                </div>
                <span className="sm:text-xl text-base text-clr_white w-[67px]">Work Process</span>
              </div>
            </div>
          </div>
          <div>
            <div
              className={`absolute xxl:left-[calc(50%--120px)] left-[calc(50%--80px)] bottom-0 ${position ? "right_up_animat" : "right_up"
                }`}

            >
              <img src={"/img/banner/banner-man.png"} alt="man-img" className="w-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="hidden absolute -left-[40px] top-1/2 -translate-y-1/2 xl:grid gap-[220px] ">
        <div className="rotate-90 flex items-center justify-center gap-[16px] ">
          <Link href={"#"}>
            <img src={"/img/banner/dial.png"} alt="img" className="-rotate-90 w-4" />
          </Link>
          <Link href={"#"} className="text-clr_white">(+02)-574-328-301</Link>
        </div>
        <div className="flex items-center justify-center gap-[50px] rotate-90 mb-[0px]">
          <Link href={"#"} className="scroll text-clr_pra uppercase text-[15px]">
            scroll down
          </Link>
          <Link href={"#"} className="-rotate-90">
            <img src={"/img/banner/scroll-down.png"} alt="img" className="w-5" />
          </Link>
        </div>
      </div>
      <div className="hidden absolute right-0 top-[55%] -translate-y-1/2 xl:grid gap-[150px]  ">
        <div className="flex items-center justify-center gap-[50px] rotate-90">
          <Link href={"#"} className="scroll text-clr_pra uppercase text-[15px]">
            Follow Me
          </Link>
          <Link href={"#"} className="-rotate-90">
            <img src={"/img/banner/scroll-down.png"} alt="img" className="w-5" />
          </Link>
        </div>
        <div>
          <ul className="grid justify-center lg:gap-[14px] gap-[10px]">
            {socalIcon.map(({ icon, id, link }) => {
              return (
                <li key={id} >
                  <Link href={link} className="lg:w-[46px] lg:h-[46px] h-[38px] w-[38xp] rounded-full bg-[rgb(18_18_18)] flex justify-center items-center" >
                    <i className="text-white">{icon}</i>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {lightboxOpen && (
        <VideoPlay
          setLightboxOpen={setLightboxOpen}
          url="https://www.youtube.com/embed/tgbNymZ7vqY"
        />
      )}
    </section>
  );
};

export default Banner;
