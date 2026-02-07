'use client'
import React, { useState } from 'react'
import Title from './Shared/Title';
import { projectList } from '@/Utlits/projectList';
import Lightbox from './Shared/LightBox';
import ProjectCard from './Shared/ProjectCard';

const RelatedProducts = () => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentId, setCurrentId] = useState(0);

    const openLightbox = (index) => {
        setCurrentId(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };
    return (
        <section className="pt_120 pb_120">
            <div className="container">
                <Title mainTitle={"Related Work"} sortTitle={"Protfolio"} />

                <div className="md:columns-2 col-span-1 xxl:gap-[58px] lg:gap-12 md:gap-[30px]">
                    {projectList
                        .slice(0, 2)
                        .map(({ heading, id, image, subHeading }, index) => (
                            <ProjectCard
                                key={id}
                                image={image}
                                heading={heading}
                                subHeading={subHeading}
                                openLightbox={openLightbox}
                                index={index}
                                navigate={"#"}
                            />
                        ))}
                </div>
            </div>
            {lightboxOpen && (
                <Lightbox
                    images={imagesList}
                    onClose={closeLightbox}
                    currentId={currentId}
                />
            )}
        </section>
    )
}

export default RelatedProducts