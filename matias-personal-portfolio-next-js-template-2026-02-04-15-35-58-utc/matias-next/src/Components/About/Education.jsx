import React from "react";
import AboutCard from "./AboutCard";

const Education = ({ isTabActive }) => {
  return (
    <div className={`w-full duration-700 ${isTabActive === "education" ? "z-10 opacity-100 translate-y-0" : "translate-y-20 -z-10 opacity-0 absolute  top-0 "} `}>
      <AboutCard
        title={"My Education"}
        para={
          "Neque porro quisquam est, qui dolorem ipsum quia dolor sit consectetur, aliquam quaerats voluptatem. Ut enim ad minima veniam, exercitationem laboriosam, nisi ut aliquid ex ea autem velit esse quam nihil"
        }
        info={[
          {
            date: "2011-2013",
            position: "Programming Course",
            instition: " New York University",
          },
          {
            date: "2013-2016",
            position: "Kingston, United States",
            instition: "University Of Design",
          },
          {
            date: "2016-2019",
            position: "New York University",
            instition: "Web Design Course",
          },
        ]}
      />
    </div>
  );
};

export default Education;
