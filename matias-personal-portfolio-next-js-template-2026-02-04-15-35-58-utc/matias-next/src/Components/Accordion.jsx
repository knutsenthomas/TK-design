'use client'
import React, { useState } from "react";
import { ArrowDown } from "react-bootstrap-icons";

const Accordion = ({ id, heading, para }) => {
  const [activeAccordion, setActiveAccordion] = useState(false)
  return (
    <div className="accordion-item relative rounded-lg bg-[rgb(23_23_23)] border-none mb-[22px] last:mb-0">
      <h2 className="accordion-header" onClick={()=> setActiveAccordion(!activeAccordion)}>
        <button
          className="accordion-button collapsed rounded-lg text-xl leading-[150%] bg-[rgb(23_23_23)] font-normal text-white border-none flex items-center justify-between pt-5 px-6 pb-6 w-full"
          type="button"
        >
          <span>{heading}</span>
          <i>
            <ArrowDown />
          </i>
        </button>
      </h2>
      <div className={`accordion-body   ${activeAccordion  ? "relative  visible":"absolute invisible"} border-none pt-[10px] px-6 pb-[14px]`}>
        <p className="text-[#999999] text-lg font-normal leading-[30px] capitalize">
          {para}
        </p>
      </div>
    </div>
  );
};

export default Accordion;
