/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "@mui/material";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import Logo from "tsconfig.json/assets/icons/Logo`";
import FindSize from "tsconfig.json/components/SizeMeasurment/Fitcheck/FindSize`";
import SizeCapture1 from "tsconfig.json/components/SizeMeasurment/SizeCapture1`";
import SizeCapture2 from "tsconfig.json/components/SizeMeasurment/SizeCapture2`";
import SizeCapture4 from "tsconfig.json/components/SizeMeasurment/SizeCapture4`";
import SizeCapture5 from "tsconfig.json/components/SizeMeasurment/SizeCapture5`";

const id = () => {
  const params = usePathname();
  const router = useRouter();

  return (
    <main
      className={`min-h-screen ${
        params === "/size-measurement-capture/fitcheck"
          ? "bg-[#FAF9F6]"
          : "bg-white"
      } text-black`}
    >
      <div className="py-2.5 border-b">
        <div className="mx-auto px-8 lg:px-20">
          {params === "/size-measurement-capture/fitcheck" ? (
            <Logo />
          ) : (
            <Image
              src="https://technomark.io/images/logo.svg"
              width={150}
              height={150}
              alt="Logo"
            />
          )}
        </div>
      </div>
      {params !== "/size-measurement-capture/fitcheck" && (
        <p
          className="my-4 ml-5 cursor-pointer"
          onClick={() => router.push("/size-measurement-capture")}
        >
          &lt; Back
        </p>
      )}
      {params === "/size-measurement-capture/v1" && <SizeCapture1 />}
      {params === "/size-measurement-capture/v2" && <SizeCapture4 />}
      {params === "/size-measurement-capture/fitcheck" && <FindSize />}
      {params === "/size-measurement-capture/test" && <SizeCapture5 />}
    </main>
  );
};

export default id;
