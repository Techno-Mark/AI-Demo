import Header from "tsconfig.json/components/Header`";
import SizeCapture from "tsconfig.json/components/SizeMeasurment/SizeCapture`";
export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        <SizeCapture />
      </main>
    </>
  );
}
