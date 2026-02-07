import React from "react";
import Title from "../Shared/Title";
import WorkProcessCard from "./WorkProcessCard";

const processList = [
  {
    id: 1,
    title: "Concept",
    info: "Nemo enim ipsam voluptatem voluptas sit aspernatur aut odit aut fugit",
    list: [
      "Reviewing any existing branding",
      "Target audience and competitors research",
      "Developing a strategy",
    ],
  },
  {
    id: 2,
    title: "Design",
    info: "Nemo enim ipsam voluptatem voluptas sit aspernatur aut odit aut fugit",
    list: [
      "Developing wireframes and mockup",
      "Choosing typography, color palettes,",
      "Refining the design",
    ],
  },
  {
    id: 3,
    title: "Webflow",
    info: "Nemo enim ipsam voluptatem voluptas sit aspernatur aut odit aut fugit",
    list: [
      "Testing the website thoroughly launch",
      "Choosing typography, color palettes,",
      "Refining the design",
    ],
  },
];
const WorkeProcess = () => {
  return (
    <section className="bg-common_bg bg-center bg-no-repeat bg-cover rounded-[10px] overflow-hidden sm:p-[60px] py-[30px] px-[10px] pt_120 pb_120">
      <div className="container">
        <Title
          mainTitle="Your Dream Website In Just Few Steps"
          sortTitle="Working Process"
        />
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-7">
          {processList.map(({ id, info, list, title }) => (
            <WorkProcessCard key={id} info={info} list={list} title={title} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkeProcess;
