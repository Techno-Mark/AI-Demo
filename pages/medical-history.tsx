import Header from "tsconfig.json/components/Header`";
import Automation from "./Automation/page";
export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        <Automation />
      </main>
    </>
  );
}
