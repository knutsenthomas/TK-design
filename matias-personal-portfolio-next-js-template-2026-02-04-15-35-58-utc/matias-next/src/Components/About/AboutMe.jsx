import React from "react";
import { Facebook, Twitter, Linkedin, Globe, Instagram } from "react-bootstrap-icons";
import Link from "next/link";

const contactInfo = [
  {
    id: 1,
    system: "Email",
    contact: "Matias999@Gmail.Com",
  },
  {
    id: 2,
    system: "Phone",
    contact: "+(2) 871 382 023",
  },
  {
    id: 3,
    system: "Phone",
    contact: "Victoria Street London,",
  },
  {
    id: 4,
    system: "Follow",
    socalContact: [
      <Facebook />,
      <Twitter />,
      <Linkedin />,
      <Globe />,
      <Instagram />,
    ],
  },
];
const AboutMe = ({ isTabActive }) => {

  return (
    <div className={`w-full duration-700 ${isTabActive === "about" ? "z-10 opacity-100 translate-y-0" : "translate-y-20 -z-10 opacity-0 absolute  top-0 "} `}>
      <div className="bg-common_bg bg-center bg-no-repeat bg-cover rounded-[10px] overflow-hidden sm:p-[60px] py-[30px] px-[10px]">
        <div className="grid lg:grid-cols-[41%_auto] gap-6 lg:items-start align-items-center">
          <div>
            <div
              className="w-full"
              data-aos="zoom-in"
              data-aos-duration="500"
            >
              <img src={"/img/about/personal-infothumb.png"} alt="img" className="w-full" />
            </div>
          </div>
          <div>
            <div className="lg:pl-10 pl-0">
              <h2
                className="text-[42px] font-semibold text-clr_white mb-5"
                data-aos="fade-up"
                data-aos-duration="500"
              >
                Personal Info
              </h2>
              <p
                className="text-lg text-clr_pra mb-0"
                data-aos="fade-up"
                data-aos-duration="500"
              >
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit
                consectetur, aliquam quaerats voluptatem. Ut enim ad minima
                veniam, exercitationem laboriosam, nisi ut aliquid ex ea autem
                velit esse quam nihil
              </p>
              <div className="mt-10">
                <div className="grid xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 grid-cols-1 justify-between  gap-6">
                  {contactInfo.map(({ id, contact, socalContact, system }) => {
                    return (
                      <div
                        key={id}
                        className=""
                        data-aos="zoom-in"
                      >
                        <div className="rounded-[10px] bg-[#1D1D1D] p-[35px] border border-[#1D1D1D] duration-500 hover:border-clr_base">
                          <div>
                            <span className="text-clr_pra fz-18 md:text-lg text-base mb-5 block">
                              {system}
                            </span>
                            <Link href={""} className="text-xl text-clr_white">{contact}</Link>
                            {socalContact && (
                              <ul className="flex items-center xl:gap-4 gap-2 ">
                                {socalContact.map((info, index) => (
                                  <li key={index}>
                                    <Link href={""} className="text-clr_white text-xl">{info} </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
