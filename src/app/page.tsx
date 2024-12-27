import SizeCapture from "@/components/SizeCapture";
import Image from "next/image";
import React from "react";

const page = () => {
  return (
    <main className={`min-h-screen`}>
      <div className="py-2.5 border-b">
        <div className="mx-auto px-20">
          <Image src="https://technomark.io/images/logo.svg" width={150} height={150} alt="Logo" />
        </div>
      </div>
      <SizeCapture />
    </main>
  );
};

export default page;
