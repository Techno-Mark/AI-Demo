/* eslint-disable react-hooks/rules-of-hooks */
import { Button } from "@mui/material";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import SizeCapture1 from "tsconfig.json/components/SizeMeasurment/SizeCapture1`";

const id = () => {
  const params = usePathname();
  const router = useRouter();

  return (
    <main className={`min-h-screen`}>
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
      {params === "/size-measurement-capture/v1" && <SizeCapture1 />}
      {params === "/size-measurement-capture/v2" && <SizeCapture1 />}

      <Button
        variant="contained"
        className="my-4 !bg-[#1565c0] ml-5"
        onClick={() => router.push("/size-measurement-capture")}
      >
        Back
      </Button>
    </main>
  );
};

export default id;
