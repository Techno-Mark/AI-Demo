/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import Logo from "tsconfig.json/assets/icons/Logo`";
import FitCheckYou from "./FitCheckYou";
import FitCheckYourBody from "./FitCheckYourBody";
import FitCheckYourSize from "./FitCheckYourSize";
import FitCheckYourSize1 from "./FitCheckYourSize1";
import FitCheckYourSize2 from "./FitCheckYourSize2";
import FitCheckYourSize3 from "./FitCheckYourSize3";

const tabs = [
  { label: "You", value: 1 },
  { label: "Your Size", value: 2 },
  { label: "Camera", value: 3 },
];

const FindSize = ({
  login,
  setLogin,
  productPart,
  productName,
  measurementMatrix,
  getUserData,
  setIsLoginClicked,
  setIsRegister,
}: any) => {
  const [activeTab, setActiveTab] = useState(1);
  const [height, setHeight] = useState(0);
  const [heightErr, setHeightErr] = useState(false);
  const [weight, setWeight] = useState(0);
  const [weightErr, setWeightErr] = useState(false);
  const [sex, setSex] = useState(0);
  const [camera, setCamera] = useState(false);

  const handleClickOpen = () => {
    if (activeTab === 1) {
      setHeightErr(
        height.toString().trim().length < 2 ||
          height.toString().trim().length > 3
      );
      setWeightErr(
        weight === 0 ||
          weight.toString().trim().length < 1 ||
          weight.toString().trim().length > 3
      );

      if (
        height !== 0 &&
        height.toString().trim().length > 1 &&
        height.toString().trim().length < 4 &&
        !heightErr &&
        weight !== 0 &&
        weight.toString().trim().length > 0 &&
        weight.toString().trim().length < 4 &&
        !weightErr
      ) {
        setActiveTab(2);
      }
    } else {
      setActiveTab(3);
    }
  };

  const onClose = () => {
    setHeight(0);
    setHeightErr(false);
    setWeight(0);
    setWeightErr(false);
    setSex(0);
    setCamera(false);
  };

  return (
    <>
      {!login && (
        <div
          className="flex items-start justify-start ml-2 cursor-pointer px-2 my-2 bg-blue-600 text-white rounded-lg w-fit"
          onClick={() =>
            activeTab === 3
              ? setActiveTab(2)
              : activeTab === 2
              ? setActiveTab(1)
              : setIsLoginClicked(0)
          }
        >
          &lt;
        </div>
      )}
      {login && activeTab !== 1 && (
        <div
          className="flex items-start justify-start ml-2 cursor-pointer px-2 my-2 bg-blue-600 text-white rounded-lg w-fit"
          onClick={() =>
            activeTab === 3
              ? setActiveTab(2)
              : activeTab === 2 && setActiveTab(1)
          }
        >
          &lt;
        </div>
      )}
      <div className="flex flex-col items-center justify-center pt-5 md:gap-2">
        <div className="flex items-center justify-center pb-6">
          <div className="flex items-center gap-4 md:gap-10">
            {tabs.map((tab, index) => {
              const isCompleted = tab.value < activeTab;
              const isActive = tab.value === activeTab;

              return (
                <React.Fragment key={tab.value}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold 
                    ${
                      isCompleted
                        ? "bg-[#6B7CF6]"
                        : isActive
                        ? "bg-[#6B7CF6]"
                        : "bg-gray-300"
                    }
                    border-4 ${
                      isActive ? "border-[#6B7CF6]" : "border-gray-300"
                    }`}
                    >
                      {isCompleted ? "✔" : index + 1}
                    </div>
                    <span className="mt-2 text-sm text-gray-700">
                      {tab.label}
                    </span>
                  </div>
                  {index < tabs.length - 1 && (
                    <div
                      className={`h-1 w-10 md:w-20 ${
                        tab.value < activeTab ? "bg-[#6B7CF6]" : "bg-gray-300"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        {activeTab === 1 && (
          <FitCheckYou
            sex={sex}
            setSex={setSex}
            height={height}
            heightErr={heightErr}
            setHeight={setHeight}
            setHeightErr={setHeightErr}
            weight={weight}
            weightErr={weightErr}
            setWeight={setWeight}
            setWeightErr={setWeightErr}
          />
        )}
        {activeTab === 2 && (
          <>
            <p className="text-ml flex items-center justify-center text-center">
              We will use your camera to capture your measurements and find your
              perfect size.
            </p>
            {/* <p className="flex items-center justify-center text-center mt-2">
              This is how you get the best results
            </p> */}
          </>
        )}
        {activeTab === 3 && (
          <FitCheckYourSize3
            height={height}
            camera={camera}
            setCamera={setCamera}
            sex={sex}
            weight={weight}
            onClose={onClose}
            productName={productName}
            measurementMatrix={measurementMatrix}
            productPart={productPart}
            login={login}
            setLogin={setLogin}
            getUserData={getUserData}
            setActiveTab={setActiveTab}
            setIsRegister={setIsRegister}
            setIsLoginClicked={(val: number) => setIsLoginClicked(val)}
          />
        )}

        {activeTab !== 3 && (
          <Button
            variant="contained"
            onClick={handleClickOpen}
            className="mt-6 !bg-[#6B7CF6] !mb-10"
          >
            Continue
          </Button>
        )}
      </div>
    </>
  );
};

export default FindSize;
