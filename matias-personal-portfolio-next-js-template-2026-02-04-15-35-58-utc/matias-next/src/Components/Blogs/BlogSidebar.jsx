import React from "react";
import Link from "next/link";
import { ChevronRight, Clock, Search } from "react-bootstrap-icons";

const categoriesList = [
  {
    id: 1,
    category: "Creative",
  },
  {
    id: 2,
    category: "Business",
  },
  {
    id: 3,
    category: "Design",
  },
  {
    id: 4,
    category: "Marketing",
  },
  {
    id: 5,
    category: "Lifestyle",
  },
];

const recentList = [
  {
    id: 1,
    image: "/img/blog/bsmall1.png",
    date: "October 19, 2025",
    title: "The Main Thing For The Designer",
  },
  {
    id: 2,
    image: "/img/blog/bsmall2.png",
    date: "October 19, 2025",
    title: "he services provide for design",
  },
  {
    id: 3,
    image: "/img/blog/bsmall3.png",
    date: "October 19, 2025",
    title: "The Main Thing For The Designer",
  },
];

const tagsList = [ "Business", "Digital", "Audio Post", "Gallery Post", "Marketing", "Agency", "Graphic", "Web Development",];


const BlogSidebar = () => {
  return (
    <div className="border border-clr_cusborder xl:p-[30px] py-5 px-[18px] rounded-lg sticky top-[120px]">
      <div className="xl:mb-[60px] mb-10">
        <h4 className="text-white border-b border-b-clr_cusborder pb-[14px] mb-[30px] text-2xl font-semibold">
          Serach
        </h4>
        <form action="#0" className="flex content-center justify-between">
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent py-[10px] pr-[10px] pl-5 h-[60px] border border-clr_cusborder rounded-lg outline-none"
          />
          <button
            type="submit"
            className="min-w-[60px] h-[60px] flex items-center justify-center bg-clr_base rounded-tr-lg rounded-br-lg"
          >
            <i className="text-clr_title text-lg">
              <Search />
            </i>
          </button>
        </form>
      </div>
      <div className="xl:mb-[60px] mb-10 position-relative">
        <h4 className="text-white border-b border-b-clr_cusborder pb-[14px] mb-[30px] text-2xl font-semibold">
          Categories
        </h4>
        <ul className="category">
          {categoriesList.map(({ id, category }) => (
            <li key={id} className="duration-500 group mb-6 last:mb-0">
              <Link
                href="/"
                className="flex items-center justify-between duration-500"
              >
                <span className="text-clr_pra text-lg">{category}</span>
                <span className="duration-500 w-6 h-6 bg-clr_base group-hover:bg-white flex justify-center items-center rounded-[5px]">
                  <i className="text-[11px] group-hover:text-clr_title">
                    <ChevronRight />
                  </i>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="xl:mb-[60px] mb-10">
        <h4 className="text-white border-b border-b-clr_cusborder pb-[14px] mb-[30px] text-2xl font-semibold">
          Recent Post
        </h4>
        <ul>
          {recentList.map(({ id, title, image, date }) => (
            <li key={id} className="mb-[30px] last:mb-0">
              <Link
                href="/"
                className="flex items-center flex-wrap xl:flex-nowrap xl:gap-5 gap-[10px]"
              >
                <img src={image} alt="img" />
                <div>
                  <span className="text-white text-xl font-medium mb-[14px] block">
                    {title}
                  </span>
                  <span className="text-clr_base text-base flex items-center gap-2">
                    <i>
                      <Clock />
                    </i>
                    {date}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-white border-b border-b-clr_cusborder pb-[14px] mb-[30px] text-2xl font-semibold">
          Tag
        </h4>
        <ul className="flex flex-wrap gap-3">
          {tagsList.map((list, index) => (
            <li key={index}>
              <Link href={"/"} className="border border-clr_cusborder py-3 px-5 text-sm uppercase text-clr_pra inline-block duration-500 rounded-[10px] hover:bg-clr_base hover:text-clr_title">{list}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BlogSidebar;
