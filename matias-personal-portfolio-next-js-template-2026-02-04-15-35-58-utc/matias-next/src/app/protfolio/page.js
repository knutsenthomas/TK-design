import PageHeader from "../../Components/Shared/PageHeader";
import WorkeProcess from "../../Components/WorkeProcess/WorkeProcess";
import ProfolioTab from "@/Components/ProfolioTab";


const Protfolio = () => {

  return (
    <>
      <PageHeader heading={"My Work & Portfolio"} page="Work" />
      <ProfolioTab/>
      <WorkeProcess />
    </>
  );
};

export default Protfolio;
