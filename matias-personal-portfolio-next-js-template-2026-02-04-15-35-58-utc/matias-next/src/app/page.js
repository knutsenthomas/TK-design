import React from "react";
import { images, images2 } from "../Utlits/marqueeItems";
import About from "../Components/About/About";
import Projects from "../Components/Projects";
import Metting from "../Components/Metting";
import Services from "../Components/Services/Services";
import WorkeProcess from "../Components/WorkeProcess/WorkeProcess";
import Testimonial from "../Components/Testimonial";
import Blogs from "../Components/Blogs/Blogs";
import MarqueeWapper from "../Components/Shared/MarqueeWapper";
import Awards from "../Components/About/Awards";


const Home = () => {
  return (
    <>
      <MarqueeWapper direction="left" images={images} />
      <About />
      <MarqueeWapper direction="right" images={images2} />
      <Awards />
      <Projects />
      <Metting />
      <Services isHeading={true} />
      <WorkeProcess />
      <Testimonial />
      <Blogs />
    </>
  );
};

export default Home;
