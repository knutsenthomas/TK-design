import React from "react";
import AboutCard from "./AboutCard";

const Experience = ({ isTabActive }) => {
  return (
    <div
      className={`w-full duration-700 ${isTabActive === "experience" ? "z-10 opacity-100 translate-y-0" : "translate-y-20 -z-10 opacity-0 absolute  top-0 "} `}
    >
      <AboutCard
        title={"My Experience"}
        para={
          "Neque porro quisquam est, qui dolorem ipsum quia dolor sit consectetur, aliquam quaerats voluptatem. Ut enim ad minima veniam, exercitationem laboriosam, nisi ut aliquid ex ea autem velit esse quam nihil"
        }
        info={[
          {
            date: "In 2013",
            position: "UI Head & Manager",
            instition: "Software Engineer",
          },
          {
            date: "In 2016",
            position: " Head of Department",
            instition: "Product Designer",
          },
          {
            date: "In 2019",
            position: "Fiverr.com",
            instition: "Senior UI Designer",
          },
        ]}
      />
    </div>
  );
};

export default Experience;
