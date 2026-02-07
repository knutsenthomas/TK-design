'use client'
import React, { useState } from "react";
import Title from "./Shared/Title";
import Lightbox from "./Shared/LightBox";
import ProjectCard from "./Shared/ProjectCard";
import { imagesList, projectList } from "../Utlits/projectList";
import CircleBox from "./Shared/CircleBox";

const Projects = () => {
  const [currentId, setCurrentId] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = (index) => {
    setCurrentId(index);
    setLightboxOpen(true);
  };

  return (
    <section className="pt_120 pb_120" id="projects">
      <div className="container">
        <Title
          mainTitle={"Look at my portfolio and give me your feedback"}
          sortTitle={"Complete Project"}
        />

        <div
          className={`md:columns-2 col-span-1 xxl:gap-[58px] lg:gap-12 md:gap-[30px] `}
        >
          {projectList.map(({ heading, id, image, subHeading }, index) => (
            <ProjectCard
              key={id}
              image={image}
              heading={heading}
              subHeading={subHeading}
              openLightbox={openLightbox}
              index={index}
              navigate="/protfolio"
            />
          ))}
        </div>

        <div className="mt-[100px] flex justify-center">
          <CircleBox />
        </div>
      </div>
      {lightboxOpen && (
        <Lightbox
          images={imagesList}
          setLightboxOpen={setLightboxOpen}
          currentId={currentId}
        />
      )}
    </section>
  );
};

export default Projects;
