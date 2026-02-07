import React from "react";
import Link from "next/link";

import PageHeader from "../../Components/Shared/PageHeader";
import BlogSidebar from "../../Components/Blogs/BlogSidebar";

import Form from "../../Components/Shared/Form";
import { socialIcons } from "../../Utlits/socilIcons";

const BlogDetails = () => {
  return (
    <>
      <PageHeader
        heading={"Brand design that helps the company grow"}
        page={"Brand design that helps the company grow"}
      />
      <section className="pb_120">
        <div className="container">
          <div className="grid lg:grid-cols-[66.66%_auto] gap-6">
            <div>
              <div>
                <div
                  data-aos="fade-up"
                  data-aos-duration="1000"
                >
                  <Link href="#" className="overflow-hidden block w-full">
                    <img
                      src={"/img/blog/bblog1.png"}
                      alt="img"
                      className="w-full overflow-hidden duration-500"
                    />
                  </Link>
                  <div className="py-[30px]">
                    <div
                      className="lg:mb-[30px] mb-5 "
                      data-aos="fade-up"
                      data-aos-duration="1400"
                    >
                      <span className="text-lg font-medium text-white border-b border-b-clr_cusborder xl:pb-[30px] pb-5 xl:mb-7 mb-[19px] block">
                        By: admin / Lifestyle / Posted on September 19, 2025 /
                        Comments: 0
                      </span>
                      <p className="text-clr_pra text-base">
                        There are many variations of passages of Lorem Ipsum
                        available, but the majority have suffered alteration in
                        some form, by injected humour, or randomised words which
                        don't look even slightly believable. If you are going to
                        use a Lorem Ipsum, you need to be sure there isn't
                        anything embarrassing hidden in the middle of text. All
                        the Lorem Ipsum the Internet tend to repeat predefined
                        chunks as necessary,
                      </p>
                      <p className="text-clr_pra text-base">
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur
                        aut odit aut fugit, sed quia consequuntur magni neque
                        porro quisquam est, qui dolorem ipsum quia dolor sit
                        amet, adipisci velit, sed quia non numquam eius modi
                        tempora incidunts ut labore et dolore magnam aliquam
                        quaerat voluptatem. Ut enim ad minima veniam, quis
                        nostrum exercitationem the corporis suscipit laboriosam,
                        nisi ut aliquid
                      </p>
                    </div>
                    <div className="lg:mb-[30px] mb-5 bg-clr_base rounded-lg lg:p-[30px] p-5">
                      <img
                        src={"/img/blog/straight-quotes.png"}
                        alt="img"
                        className="mb-[30px]"
                      />
                      <p className="text-xl text-clr_title mb-9">
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur
                        aut odit aut fugit, sed quia consequuntur magni dolores
                        eos qui ratione voluptatem sequi nesciunt. Neque porro
                        quisquam est, adipisci velit, sed quia non numquam
                      </p>
                      <Link
                        href=""
                        className="font-medium text-xl underline text-clr_title"
                      >
                        David Kingston
                      </Link>
                    </div>
                    <p className="text-clr_pra text-base xl:mb-[60px] mb-10">
                      Nemo enim ipsam voluptatem quia voluptas sit aspernatur
                      aut odit aut fugit, sed quia consequuntur magni dolores
                      eos qui ratione voluptatem sequi nesciunt. Neque porro
                      quisquam est, qui dolorem ipsum quia dolor sit amet,
                      consectetur, adipisci velit, sed quia non numquam eius
                      modi tempora incidunt ut labore et dolore magnam aliquam
                      minima veniam, quis nostrum exercitationem ullam corporis
                      suscipit laboriosam,
                    </p>
                    <h3 className="text-white capitalize sm:text-[32px] text-[26px] leading-[120%] font-semibold lg:mb-[30px] mb-5">
                      Matias is the only theme you will ever need
                    </h3>
                    <div className="lg:mb-[30px] mb-5">
                      <img src={"/img/blog/blog-detailsb2.png"} alt="img" />
                    </div>
                    <p className="text-clr_pra text-base lg:mb-[30px] mb-5">
                      On the other hand, we denounce with righteous indignation
                      and dislike men who are so beguiled and demoralized by the
                      charms of pleasure of the moment, so blinded by desire,
                      that they cannot foresee the pain and trouble that are
                      bound to ensue; and equal blame belongs to those who fail
                      in their duty through weakness of will, which is the same
                      as from these cases are perfectly simple and easy to
                      distinguish. In a free hour,
                    </p>
                    <div
                      className="lg:mb-[30px] mb-5"
                      data-aos="fade-up"
                      data-aos-duration="1600"
                    >
                      <ul>
                        <li className="flex items-center gap-[10px] relative text-base text-clr_pra sm:pl-4 pl-0 xl:mb-5 mb-[10px]">
                          <span className="min-w-[6px] h-[6px] rounded-full bg-clr_base"></span>
                          <span >
                            Duis aute irure dolor in reprehenderit in voluptate
                            velit esse cillum dolore eu fugiat nulla pariatur.
                          </span>
                        </li>
                        <li className="flex items-center gap-[10px] relative text-base text-clr_pra sm:pl-4 pl-0 xl:mb-5 mb-[10px]">
                          <span className="min-w-[6px] h-[6px] rounded-full bg-clr_base"></span>
                          <span >
                            Nor again is there anyone who loves or pursues or
                            desires to obtain pain of itself, because it is
                            pain, but because occasionally
                          </span>
                        </li>
                        <li className="flex items-center gap-[10px] relative text-base text-clr_pra sm:pl-4 pl-0 ">
                          <span className="min-w-[6px] h-[6px] rounded-full bg-clr_base"></span>
                          <span >
                            On the other hand, we denounce with righteous
                            indignation and dislike
                          </span>
                        </li>
                      </ul>
                    </div>
                    <p className="text-clr_pra text-base lg:mb-[30px] mb-5">
                      Nemo enim ipsam voluptatem quia voluptas sit aspernatur
                      aut odit aut fugit, sed quia consequuntur magni dolores
                      eos qui ratione voluptatem sequi nesciunt. Neque porro
                      quisquam est, qui dolorem
                    </p>
                  </div>
                  <div className="bg-common_bg xl:mb-[60px] mb-10 rounded-lg xl:p-[30px] sm:p-5 py-5 px-[14px] flex items-center xl:justify-between justify-center xl:flex-nowrap flex-wrap gap-5">
                    <div className="flex items-center sm:gap-5 gap-[10px]">
                      <span className="text-xl font-medium text-white">
                        Posted in :
                      </span>
                      <Link
                        href=""
                        className="rounded-[10px] bg-[rgb(29_29_29_)] sm:py-[12px] py-2 sm:px-5 px-[10px] sm:text-base text-[12px] uppercase text-clr_pra"
                      >
                        Business
                      </Link>
                      <Link
                        href=""
                        className="rounded-[10px] bg-[rgb(29_29_29_)] sm:py-[12px] py-2 sm:px-5 px-[10px] sm:text-base text-[12px] uppercase text-clr_pra"
                      >
                        Digital
                      </Link>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-xl font-medium text-white">
                        Share :
                      </span>
                      <ul className="social-cus flex items-center rounded-[10px] bg-[rgb(29_29_29_)] py-[10px] px-5 gap-5 ">
                        {socialIcons.map(({ id, icon }) => (
                          <li key={id}>
                            <Link href="">
                              <i className="text-white duration-500 hover:text-clr_base">
                                {icon}
                              </i>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Form isColTwo={true} />
                </div>
              </div>
            </div>
            <div>
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetails;
