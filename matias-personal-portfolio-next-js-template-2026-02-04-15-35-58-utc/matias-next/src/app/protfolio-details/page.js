import Link from "next/link";
import RelatedProducts from "@/Components/RelatedProducts";
import PageHeader from "@/Components/Shared/PageHeader";
import { socialIcons } from "@/Utlits/socilIcons";

const ProtfolioDetails = () => {

  return (
    <>
      <PageHeader
        heading={"Brand Identity & Motion Design"}
        page="Brand Identity & Motion Design"
      />
      <section className="pb_120">
        <div className="container">
          <div
            className="lg:mb-[60px] mb-[50px] w-full relative"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <img src={"/img/protfolio/prot-detailsbig.png"} alt="img" className="w-full" />
            <div className="bg-[rgb(18_18_18)] rounded-tr-[30px] xl:p-[45px] lg:p-6 py-5 px-[12px] lg:absolute static bottom-0 left-0 w-full lg:w-auto">
              <h3 className="text-white xl:mb-8 mb-6 capitalize sm:text-[32px] text-[26px] leading-[120%] font-semibold">
                Project Info
              </h3>
              <div className="flex lg:gap-[100px] gap-5 xl:mb-9 mb-[22px]">
                <div>
                  <div className="xl:mb-[30px] mb-[14px] ">
                    <h5 className="font-medium text-white xl:mb-[10px] lg:mb-[5px] mb-[10px] capitalize text-xl leading-[130%]">
                      Clients
                    </h5>
                    <p className="text-clr_pra lg:text-base text-sm">
                      Nicolas Marko
                    </p>
                  </div>
                  <div className="xl:mb-[30px] mb-[14px]">
                    <h5 className="font-medium text-white xl:mb-[10px] lg:mb-[5px] mb-[10px] capitalize text-xl leading-[130%]">
                      Date
                    </h5>
                    <p className="text-clr_pra lg:text-base text-sm">
                      Sept 19, 2025
                    </p>
                  </div>
                </div>
                <div className="prot__left">
                  <div className="xl:mb-[30px] mb-[14px] ">
                    <h5 className="font-medium text-white xl:mb-[10px] lg:mb-[5px] mb-[10px] capitalize text-xl leading-[130%]">
                      Category
                    </h5>
                    <p className="text-clr_pra lg:text-base text-sm">
                      Branding Design
                    </p>
                  </div>
                  <div className="xl:mb-[30px] mb-[14px]">
                    <h5 className="font-medium text-white xl:mb-[10px] lg:mb-[5px] mb-[10px] capitalize text-xl leading-[130%]">
                      Location
                    </h5>
                    <p className="text-clr_pra lg:text-base text-sm">
                      24 Fifth st.,Los Angeles, USA
                    </p>
                  </div>
                </div>
              </div>
              <ul className="flex gap-4">
                {socialIcons.map(({ icon, id }) => (
                  <li key={id}>
                    <Link
                      href={"#"}
                      className="w-[46px] h-[46px] bg-white rounded-full flex justify-center items-center hover:bg-clr_base duration-500"
                    >
                      <i className="text-clr_title ">{icon}</i>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <div
              className="xl:mb-[60px] mb-10"
              data-aos="fade-up"
              data-aos-duration="1400"
            >
              <p className="xl:mb-7 mb-[15px] text-clr_pra">
                There are many variations of passages of Lorem Ipsum available,
                but the majority have suffered alteration in some form, by
                injected humour, or randomised words which don't look even
                slightly believable. If you are going to use a passage of Lorem
                Ipsum, you need to be sure there isn't anything embarrassing
                hidden in the middle of text. All the Lorem Ipsum generators on
                the Internet tend to repeat predefined chunks as necessary,
                making this the first true generator on the Internet. It uses a
                dictionary of over combined with a handful of model sentence
                structures, to generate Lorem Ipsum which looks reasonable.
              </p>
              <p className="text-clr_pra">
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt. Neque quisquam est, qui dolorem ipsum
                quia dolor sit amet, consectetur, adipisci velit, sed quia non
                numquam eius modi tempora incidunt ut labore et dolore magnam
                aliquam voluptatem. Ut enim ad minima veniam, quis nostrum
                exercitationem ullam corporis suscipit laboriosam,
              </p>
            </div>
            <div
              className="xl:mb-[60px] mb-10"
              data-aos="fade-up"
              data-aos-duration="1600"
            >
              <h3 className="xl:text-[32px] xl:mb-[30px] mb-5 text-[26px] text-white capitalize font-semibold">
                Challenge
              </h3>
              <p className="xl:mb-7 mb-[15px] text-clr_pra">
                There are many variations of passages of Lorem Ipsum available,
                but the majority have suffered alteration in some form, by
                injected humour, or randomised words which don't look even
                slightly believable. If you are going to use a passage of Lorem
                Ipsum, you need to be sure there isn't anything embarrassing
                hidden in the middle of text. All the Lorem Ipsum generators on
                the Internet tend to repeat predefined chunks as necessary,
                making this the first true generator on the Internet.
              </p>
              <ul>
                <li className="flex items-center gap-[10px] relative text-base text-clr_pra sm:pl-4 xl:mb-5 mb-[10px]">
                  <span className="min-w-[6px] h-[6px] rounded-full bg-clr_base"></span>
                  <span>
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur.
                  </span>
                </li>
                <li className="flex items-center gap-[10px] relative text-base text-clr_pra sm:pl-4 xl:mb-5 mb-[10px]">
                  <span className="min-w-[6px] h-[6px] rounded-full bg-clr_base"></span>
                  <span>
                    Nor again is there anyone who loves or pursues or desires to
                    obtain pain of itself, because it is pain, but because
                    occasionally
                  </span>
                </li>
                <li className="flex items-center gap-[10px] relative text-base text-clr_pra sm:pl-4 ">
                  <span className="min-w-[6px] h-[6px] rounded-full bg-clr_base"></span>
                  <span>
                    On the other hand, we denounce with righteous indignation
                    and dislike
                  </span>
                </li>
              </ul>
            </div>
            <div
              className="xl:mb-[60px] mb-10"
              data-aos="fade-up"
              data-aos-duration="1800"
            >
              <h3 className="xl:text-[32px] xl:mb-[30px] mb-5 text-[26px] text-white capitalize font-semibold">
                Solution & Result
              </h3>
              <p className="text-clr_pra">
                There are many variations of passages of Lorem Ipsum available,
                but the majority have suffered alteration in some form, by
                injected humour, or randomised words which don't look even
                slightly believable. If you are going to use a passage of Lorem
                Ipsum, you need to be sure there isn't anything embarrassing
                hidden in the middle of text. All the Lorem Ipsum generators on
                the Internet tend to repeat predefined chunks as necessary,
                making this the first true generator on the Internet. It uses a
                dictionary of over Latin words, combined with a handful of model
                sentence structures, to generate Lorem Ipsum which looks
                reasonable. The generated Lorem Ipsum is therefore always free
                from repetition, injected humour, or non-characteristic words
                etc.
              </p>
            </div>
            <div
              className="flex items-center xl:gap-[30px] sm:gap-5 gap-[14px] flex-wrap sm:flex-nowrap"
              data-aos="fade-up"
              data-aos-duration="2000"
            >
              <div className="w-full">
                <img src={"/img/protfolio/prot-detials1.png"} alt="img" className="rounded-lg w-full" />
              </div>
              <div className="w-full">
                <img src={"/img/protfolio/prot-detials2.png"} alt="img" className="rounded-lg w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <RelatedProducts />
    </>
  );
};

export default ProtfolioDetails;
