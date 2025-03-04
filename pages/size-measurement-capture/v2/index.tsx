/* eslint-disable react-hooks/rules-of-hooks */
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import SizeCapture4 from "tsconfig.json/components/SizeMeasurment/SizeCapture4`";

const id = () => {
  const router = useRouter();

  return (
    <main className={`min-h-screen bg-white text-black`}>
      <div className="py-2.5 border-b">
        <div className="mx-auto px-8 lg:px-20">
          <Image
            src="https://technomark.io/images/logo.svg"
            width={150}
            height={150}
            alt="Logo"
          />
        </div>
      </div>
      <p
        className="my-4 ml-5 cursor-pointer"
        onClick={() => router.push("/size-measurement-capture")}
      >
        &lt; Back
      </p>
      <SizeCapture4 />
    </main>
  );
};

export default id;
