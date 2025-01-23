import React from "react";
import Body1 from "tsconfig.json/assets/icons/Body1`";
import Body2 from "tsconfig.json/assets/icons/Body2`";
import Body3 from "tsconfig.json/assets/icons/Body3`";
import Body4 from "tsconfig.json/assets/icons/Body4`";

const FitCheckYourBody = ({ body, bodyErr, setBody, setBodyErr }: any) => {
  return (
    <>
      <p className="text-2xl flex items-center justify-center">
        Select your body type
      </p>
      <div className="flex items-center justify-center gap-10 py-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center gap-5 text-2xl px-4 py-2 bg-white rounded-xl shadow-lg ${
              bodyErr ? "border-[#FF0000] border" : ""
            } ${body === index + 1 ? "border-[#6B7CF6] border-2" : ""}`}
            onClick={() => {
              setBody(index + 1);
              setBodyErr(false);
            }}
          >
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
