'use client'
import React, { useState } from "react";
import Experience from "./Experience";
import Education from "./Education";
import Skills from "./Skills";
import AboutMe from "./AboutMe";

const tabList = [
  {
    id: 1,
    name: "About",
    value: "about",
  },
  {
    id: 2,
    name: "Experience",
    value: "experience",
  },
  {
    id: 3,
    name: "Education",
    value: "education",
  },
  {
    id: 4,
    name: "Skills",
    value: "skills",
  },
];

const About = () => {
  const [isTabActive, setIsTabAative] = useState("about");

  const handleTabClick = (e) => {
    setIsTabAative(e);
  };

  return (
    <>
      <section className="pt_120 pb_120" id="about">
        <div className="container">
          <div className="text-center mx-auto xl:mb-[60px] md:mb-[50px] mb-[30px]">
            <img
              src={"/img/about/section-star.png"}
              className="mb-[30px] animate-spin mx-auto"
              alt="star"
              data-aos="fade-up"
              data-aos-duration="1000"
            />
            <p
              className="lg:text-[42px] md:text-[28px] sm:text-xl text-base font-medium text-clr_white lg:leading-[66px]"
              data-aos="fade-up"
              data-aos-duration="1500"
            >
              I'm David Matias, I'm a Brand & Webflow Designer, Currently
              residing in the lush Victoria Street London, Matias operates
              globally and is ready to take on any design challenge.
            </p>
          </div>
          <div>
            <ul className="flex items-center justify-center flex-wrap gap-5 mb-[100px]">
              {tabList.map(({ id, name, value }) => (
                <li key={id} className={`nav-links  `}>
                  <button
                    onClick={() => handleTabClick(value)}
                    className={`tablink ${
                      isTabActive === value
                        ? "bg-clr_base text-clr_title"
                        : "bg-[#1D1D1D] text-clr_white"
                    } rounded-[10px]  lg:text-lg text-sm uppercase font-medium border-none lg:py-4 lg:px-[30px] py-[10px] px-5 text-center `}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="relative">
              <AboutMe isTabActive={isTabActive} />
              <Experience isTabActive={isTabActive} />
              <Education isTabActive={isTabActive} />
              <Skills isTabActive={isTabActive} />
            </div>
          </div>
        </div>
      </section>
      {/* <Awards /> */}
    </>
  );
};

export default About;
