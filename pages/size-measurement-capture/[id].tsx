/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "@mui/material";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import SizeCapture1 from "tsconfig.json/components/SizeMeasurment/SizeCapture1`";
import SizeCapture2 from "tsconfig.json/components/SizeMeasurment/SizeCapture2`";
import SizeCapture4 from "tsconfig.json/components/SizeMeasurment/SizeCapture4`";

const id = () => {
  const params = usePathname();
  const router = useRouter();

  return (
    <main className={`min-h-screen bg-white text-black`}>
      <div className="py-2.5 border-b">
        <div className="mx-auto px-20">
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
      {params === "/size-measurement-capture/v1" && <SizeCapture1 />}
      {params === "/size-measurement-capture/v2" && <SizeCapture4 />}
    </main>
  );
};

export default id;
