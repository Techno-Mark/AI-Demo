import React from "react";
import Logo from "tsconfig.json/assets/icons/Logo`";
import FindSize from "tsconfig.json/components/SizeMeasurment/Fitcheck/FindSize`";

const id = () => {
  return (
    <main className={`min-h-screen bg-[#FAF9F6] text-black`}>
      <div className="py-2.5 border-b">
        <div className="mx-auto px-8 lg:px-20">
          <Logo />
        </div>
      </div>
      <FindSize />
    </main>
  );
};

export default id;
