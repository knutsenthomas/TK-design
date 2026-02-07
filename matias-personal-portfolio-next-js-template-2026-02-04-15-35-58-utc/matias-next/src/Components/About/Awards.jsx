import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
import Link from "next/link";


const awardList = [
  {
    id: 1,
    awardName: "Site Of The Day",
    contest: "Css & Animation",
    year: "2018",
  },
  {
    id: 2,
    awardName: "Best Business Model",
    contest: "New Strategy",
    year: "2019",
  },
  {
    id: 3,
    awardName: "Motion Graphic	",
    contest: "3D & Visual Effect	",
    year: "2020",
  },
  {
    id: 4,
    awardName: "Video Design	",
    contest: "Css & Animation",
    year: "2022",
  },
];
const Awards = () => {

  return (
    <div className="bg-common_bg bg-center bg-no-repeat bg-cover rounded-[10px] overflow-hidden xxl:py-[120px] xl:py-[100px] py-[60px] ">
      <div className="container">
        <div
          data-aos="fade-up"
          data-aos-duration="2000"
        >
          <table className="w-full">
            <tbody>
              <tr>
                <td className="bg-transparent lg:text-xl md:text-lg text-base font-medium text-white py-[30px] border-b border-b-[#2c3030]">
                  <span className="md:text-[42px] sm:text-[28px] text-lg">Our Awards</span>
                </td>
                <td className="bg-transparent lg:text-xl md:text-lg text-base font-medium text-white py-[30px] border-b border-b-[#2c3030]"></td>
                <td className="text-end bg-transparent lg:text-xl md:text-lg text-base font-medium text-white py-[30px] border-b border-b-[#2c3030]">
                  <Link href={""}
                    className="md:text-lg sm:text-base text-sm  flex justify-end items-center text-clr_base gap-2"
                  >
                    <span className="whitespace-nowrap">View My Work</span>
                    <i>
                      <ArrowRight />
                    </i>
                  </Link>
                </td>
              </tr>
              {awardList.map(({ contest, id, year, awardName }) => {
                return (
                  <tr key={id}>
                    <td className="bg-transparent lg:text-xl md:text-lg sm:text-base text-sm font-medium text-white py-[30px] border-b border-b-[#2c3030]">{awardName}</td>
                    <td className="bg-transparent lg:text-xl md:text-lg sm:text-base text-sm font-medium text-white py-[30px] border-b border-b-[#2c3030]">{contest}</td>
                    <td className="text-end bg-transparent lg:text-xl md:text-lg sm:text-base text-sm font-medium text-white py-[30px] border-b border-b-[#2c3030]">{year}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Awards;
