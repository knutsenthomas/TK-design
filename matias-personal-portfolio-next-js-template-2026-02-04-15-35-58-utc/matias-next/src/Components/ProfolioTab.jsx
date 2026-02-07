'use client'
import React, { useState } from "react";
import ProjectCard from "./Shared/ProjectCard";
import Lightbox from "./Shared/LightBox";
import { imagesList, projectList } from "@/Utlits/projectList";

const categoryList = [
    {
        id: 1,
        categoryName: "All",
        value: "all",
    },
    {
        id: 2,
        categoryName: "Branding-app",
        value: "branding_app",
    },
    {
        id: 3,
        categoryName: "Los-App",
        value: "los_app",
    },
    {
        id: 4,
        categoryName: "Landing Page",
        value: "landing_page",
    },
    {
        id: 5,
        categoryName: "Website",
        value: "website",
    },
];
const ProfolioTab = () => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentId, setCurrentId] = useState(0);
    const [currentCategory, setCurrentCategory] = useState("all");

    // ---------- Filer project by category
    let filterProject = [];

    for (const iterator of projectList) {
        for (const cet of iterator.category) {
            if (cet === currentCategory) {
                filterProject.push(iterator);
            }
        }
    }

    const openLightbox = (index) => {
        setCurrentId(index);
        setLightboxOpen(true);
    };
    return (
        <section className="pb-120">
            <div className="container">
                <div>
                    <ul
                        className="border border-clr_cusborder p-[10px] rounded-lg max-w-[683px] mx-auto md:mb-[60px] mb-10 flex items-center md:flex-nowrap flex-wrap md:justify-normal justify-center md:gap-0 gap-[5px] "
                        data-aos="fade-down"
                        data-aos-duration="2000"
                    >
                        {categoryList.map(({ id, categoryName, value }) => (
                            <li
                                key={id}
                                className={`md:border-t-0 md:border-b-0 md:border-l-0 border border-clr_cusborder md:border-r md:border-r-clr_cusborder md:last:border-r-0 `}
                            >
                                <button
                                    className={`border-none text-center md:inline-block block text-lg  md:py-4 md:px-6 py-[11px] px-5 rounded-[5px] ${currentCategory === value ? "bg-clr_base text-clr_title rounded-[5px]" : "text-clr_pra bg-transparent"}`}
                                    onClick={() => setCurrentCategory(value)}
                                >
                                    {categoryName}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="md:columns-2 col-span-1 xxl:gap-[58px] lg:gap-12 md:gap-[30px]">
                        {filterProject.map(
                            ({ heading, id, image, subHeading }, index) => (
                                <ProjectCard
                                    key={id}
                                    image={image}
                                    heading={heading}
                                    subHeading={subHeading}
                                    openLightbox={openLightbox}
                                    index={index}
                                    navigate="/protfolio-details"
                                />
                            )
                        )}
                    </div>
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
    )
}

export default ProfolioTab