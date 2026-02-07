import React from "react";
import Link from "next/link";
import { Envelope, GeoAlt } from "react-bootstrap-icons";
import TitleSecond from "./Shared/TitleSecond";

const Metting = () => {
  return (
    <section className="bg-common_bg bg-center bg-no-repeat bg-cover rounded-[10px] overflow-hidden  pt_120 pb_120">
      <div className="container">
        <div className="grid lg:grid-cols-[58%_auto] gap-20 items-center">
          <div>
            <div>
              <div className="border-b border-b-[rgb(39,38,38)] hover:border-b-clr_base duration-500 transition-all">
                <TitleSecond
                  mainTitle={"Let's work together. fixed a meeting"}
                  sortTitle={" Need a Project?"}
                />
              </div>
              <div
                className="hover:border-b hover:border-b-clr_base flex ga-5 items-center md:gap-5 gap-4 duration-500 transition-all border-b border-b-[rgb(38_37_37)] lg:pb-[30px] pb-5 lg:pt-[30px] pt-[20px]"
                data-aos="fade-up"
                data-aos-duration="1000"
              >
                <span className="w-[60px] h-[60px] rounded-full bg-clr_base flex justify-center items-center">
                  <Envelope className="text-[26px] text-clr_title" />
                </span>
                <span>
                  <span className="text-clr_pra md:text-lg text-base mb-1 block">
                    {" "}
                    Email{" "}
                  </span>
                  <Link
                    href={""}
                    className="text-white md:text-xl text-base font-medium"
                  >
                    {" "}
                    davidmatias333@gmail.com{" "}
                  </Link>
                </span>
              </div>
              <div
                className="hover:border-b hover:border-b-clr_base flex ga-5 items-center md:gap-5 gap-4 duration-500 border-b border-b-[rgb(38_37_37)] lg:pb-[30px] pb-5 lg:pt-[30px] pt-[20px]"
                data-aos="fade-up"
                data-aos-duration="1500"
              >
                <span className="w-[60px] h-[60px] rounded-full bg-clr_base flex justify-center items-center">
                  <GeoAlt className="text-[26px] text-clr_title" />
                </span>
                <span>
                  <span className="text-clr_pra md:text-lg text-base mb-1 block">
                    {" "}
                    Location{" "}
                  </span>
                  <Link
                    href={""}
                    className="text-white md:text-xl text-base font-medium"
                  >
                    {" "}
                    Victoria Street London, England{" "}
                  </Link>
                </span>
              </div>
            </div>
          </div>
          <div>
            <div
              data-aos="zoom-in"
              data-aos-duration="2000"
            >
              <img src={"/img/project/project-need.png"} alt="img" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Metting;
