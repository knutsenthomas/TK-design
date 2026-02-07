import React from "react";
import { StarFill, StarHalf, Star } from "react-bootstrap-icons";

const Rating = ({ star }) => {
  const starRating = Array.from({ length: 5 }, (elem, index) => {
    let number = index + 0.5;
    return (
      <li key={index}>
        {star >= index + 1 ? (
          <StarFill className="text-clr_ratting text-xl" />
        ) : star >= number ? (
          <StarHalf className="text-clr_ratting text-xl" />
        ) : (
          <Star className="text-clr_ratting text-xl" />
        )}
      </li>
    );
  });
  return (
    <ul className="flex lg:mb-10 mb-8 items-center gap-2">{starRating}</ul>
  );
};

export default Rating;
