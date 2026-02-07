import React from "react";
import BlogSidebar from "../../Components/Blogs/BlogSidebar";
import PageHeader from "../../Components/Shared/PageHeader";

import BlogCard from "../../Components/Blogs/BlogCard";
import { blogsList } from "../../Utlits/blogList";
import { ChevronRight } from "react-bootstrap-icons";
import Link from "next/link";

const AllBlogs = () => {

  return (
    <>
      <PageHeader heading={"Blog Standard"} page={"Blog Standard"} />
      <section className="pb_120">
        <div className="container">
          <div className="grid grid-cols-[66.66%_auto] gap-6">
            <div className="col-lg-8">
              <div className="pr-[26px]">
                {blogsList.map(({ id, heading, image, para, date }) => (
                  <BlogCard
                    key={id}
                    date={date}
                    heading={heading}
                    image={image}
                    para={para}
                  />
                ))}
                <div className="bg-common_bg rounded-lg xl:p-[30px] py-5 px-4">
                  <ul className="flex gap-[14px] items-center">
                    <li>
                      <Link href={""} className="w-[60px] h-[60px] flex items-center justify-center rounded-lg bg-clr_base text-clr_title duration-500 text-lg hover:bg-white hover:text-clr_title">1</Link>
                    </li>
                    <li>
                      <Link href={""} className="w-[60px] h-[60px] flex items-center justify-center rounded-lg bg-clr_base text-clr_title duration-500 text-lg hover:bg-white hover:text-clr_title">2</Link>
                    </li>
                    <li>
                      <Link href={""} className="w-[60px] h-[60px] flex items-center justify-center rounded-lg bg-clr_base text-clr_title duration-500 text-lg hover:bg-white hover:text-clr_title">3</Link>
                    </li>
                    <li>
                      <Link href={""} className="w-[60px] h-[60px] flex items-center justify-center rounded-lg bg-clr_base text-clr_title duration-500 text-lg hover:bg-white hover:text-clr_title">
                        <i >
                          <ChevronRight/>
                        </i>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AllBlogs;
