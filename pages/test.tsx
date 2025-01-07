import Image from "next/image";
import Header from "tsconfig.json/components/Header`";
import SizeCapture1 from "tsconfig.json/components/SizeMeasurment/SizeCapture1`";
import SizeCapture2 from "tsconfig.json/components/SizeMeasurment/SizeCapture2`";
import SizeCapture3 from "tsconfig.json/components/SizeMeasurment/SizeCapture3`";
import SizeCapture from "tsconfig.json/components/SizeMeasurment/SizeCapture`";
export default function Home() {
  return (
    <>
      <main className={`min-h-screen bg-white`}>
      <div className="py-2.5 border-b">
        <div className="mx-auto px-20">
          <Image src="https://technomark.io/images/logo.svg" width={150} height={150} alt="Logo" />
        </div>
      </div>
        <SizeCapture3 />
      </main>
    </>
  );
}
