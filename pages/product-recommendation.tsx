import Header from "tsconfig.json/components/Header`";
import ProductRecommendation from "./Automation/productRecommendation";
export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        <ProductRecommendation />
      </main>
    </>
  );
}
