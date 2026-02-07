import React from "react";
import Price from "./Price";
import Title from "../Shared/Title";

const planData = [
  {
    id: 1,
    planName: "Basic Plan",
    price: "$35",
    time: "per month",
    fetcher: [
      " Web Development",
      " Mobile Development",
      "Advetising",
      "Graphic design",
      "Project management",
    ],
    image: "/img/project/basic.png",
  },
  {
    id: 2,
    planName: "Ultra Plan",
    price: "$65",
    time: "per month",
    fetcher: [
      " Web Development",
      " Mobile Development",
      "Advetising",
      "Graphic design",
      "Project management",
    ],
    image: "/img/project/warranty.png",
  },
  {
    id: 3,
    planName: "Gold Plan",
    price: "$95",
    time: "per month",
    fetcher: [
      " Web Development",
      " Mobile Development",
      "Advetising",
      "Graphic design",
      "Project management",
    ],
    image: "/img/project/premium-quality.png",
  },
];

const Pricing = () => {
  return (
    <section className="pt_120 pb_120">
      <div className="container">
        <Title
          mainTitle={"The best pricing plans to get your best"}
          sortTitle={"Choose Your Plan"}
        />
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-5 justify-center">
          {planData.map(({ id, image, planName, fetcher, price, time }) => (
            <Price
              key={id}
              image={image}
              planName={planName}
              price={price}
              time={time}
              fetcher={fetcher}
              id={id}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
