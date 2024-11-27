import Header from "tsconfig.json/components/Header`";
import SnapSizeMeasur from "tsconfig.json/components/SizeMeasurment/SnapSizeMeasur`";
export default function Home() {
  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        <SnapSizeMeasur />
      </main>
    </>
  );
}
