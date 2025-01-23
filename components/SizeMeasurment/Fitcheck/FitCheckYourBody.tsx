import React, { useState } from "react";
import Body1 from "tsconfig.json/assets/icons/Body1`";
import Body2 from "tsconfig.json/assets/icons/Body2`";
import Body3 from "tsconfig.json/assets/icons/Body3`";
import Body4 from "tsconfig.json/assets/icons/Body4`";

const FitCheckYourBody = ({ body, bodyErr, setBody, setBodyErr }: any) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const bodyMessages = [
    "Balanced hips and shoulders with a defined waist",
    "Hips are wider than shoulders, creating a curvier lower body.",
    "Broader shoulders compared to the hips, creating an inverted triangle look.",
    "Shoulders, waist, and hips align closely, creating a straight silhouette.",
  ];

  return (
    <>
      <p className="text-lg md:text-xl flex items-center justify-center">
        Select your body type
      </p>
      <div className="grid grid-cols-2 gap-5 py-2 sm:grid-cols-4 sm:gap-10 items-center justify-center">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`relative flex flex-col items-center justify-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg transition-all duration-200 border ${
              bodyErr ? "border-[#FF0000]" : ""
            } ${
              body === index + 1
                ? "border-[#6B7CF6]"
                : hoverIndex === index
                ? "bg-[#E5EBF8]"
                : ""
            }`}
            onClick={() => {
              setBody(index + 1);
              setBodyErr(false);
            }}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Hover Message */}
            {hoverIndex === index && (
              <div
                className={`absolute top-[-50px] flex flex-col items-center ${
                  index === 0
                    ? "left-0"
                    : index === 3
                    ? "right-0"
                    : "left-1/2 transform -translate-x-1/2"
                }`}
              >
                <div className="bg-[#E5EBF8] text-black text-xs px-4 py-2 rounded shadow-lg whitespace-nowrap">
                  {bodyMessages[index]}
                </div>
                <div
                  className={`w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#E5EBF8] ${
                    index === 0
                      ? "-translate-x-24"
                      : index === 3
                      ? "translate-x-40"
                      : ""
                  }`}
                />
              </div>
            )}

            {/* Body Icons */}
            {index === 0 ? (
              <Body1 />
            ) : index === 1 ? (
              <Body2 />
            ) : index === 2 ? (
              <Body3 />
            ) : (
              <Body4 />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default FitCheckYourBody;
