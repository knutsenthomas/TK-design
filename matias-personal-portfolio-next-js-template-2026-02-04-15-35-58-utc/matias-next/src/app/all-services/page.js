import React from "react";

import Services from "../../Components/Services/Services";
import Metting from "../../Components/Metting";
import WorkeProcess from "../../Components/WorkeProcess/WorkeProcess";
import Pricing from "../../Components/Pricing/Pricing";
import PageHeader from "../../Components/Shared/PageHeader";

const AllServices = () => {
  return (
    <>
      <PageHeader heading={"Services All"} page={"Services All"} />
      <Services isHeading={false} />
      <Metting />
      <Pricing />
      <WorkeProcess />
    </>
  );
};

export default AllServices;
