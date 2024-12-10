import Header from "tsconfig.json/components/Header`";
import SizeMeasurCheck from "tsconfig.json/components/SizeMeasurment/SizeDetection`";
export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        <SizeMeasurCheck />
      </main>
    </>
  );
}
