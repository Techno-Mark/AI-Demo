import Header from "tsconfig.json/components/Header`";
import StyledGenieProductRecommendation from "./Automation/styledGenieProductRecommendation";
export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        <StyledGenieProductRecommendation />
      </main>
    </>
  );
}