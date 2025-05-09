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
import Image from "next/image";

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
  activeTab,
  setActiveTab,
  camera,
  setCamera,
  videoRef,
}: any) => {
  const [height, setHeight] = useState(0);
  const [isHeightInInch, setIsHeightInInch] = useState(false);
  const [heightErr, setHeightErr] = useState(false);
  const [weight, setWeight] = useState(0);
  const [weightErr, setWeightErr] = useState(false);
  const [sex, setSex] = useState(0);

  const handleClickOpen = () => {
    if (activeTab === 1) {
      const regex = isHeightInInch
        ? /^\d{0,2}(\.\d{0,2})?$/
        : /^\d{0,3}(\.\d{0,2})?$/;
      setHeightErr(height === 0 || !regex.test(height.toString()));
      const regexWeight = /^\d{0,3}(\.\d{0,2})?$/;
      setWeightErr(weight === 0 || !regexWeight.test(weight.toString()));

      if (
        height !== 0 &&
        regex.test(height.toString()) &&
        !heightErr &&
        weight !== 0 &&
        regexWeight.test(weight.toString()) &&
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
      {/* {!login && (
        <div
          className="flex items-start justify-start ml-2 cursor-pointer px-2 my-2 bg-[#6B7CF6] text-white rounded-lg w-fit"
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
          className="flex items-start justify-start ml-2 cursor-pointer px-2 my-2 bg-[#6B7CF6] text-white rounded-lg w-fit"
          onClick={() =>
            activeTab === 3
              ? setActiveTab(2)
              : activeTab === 2 && setActiveTab(1)
          }
        >
          &lt;
        </div>
      )} */}
      <div className="flex flex-col items-center justify-start pt-5 md:gap-2 min-h-[88vh] h-full">
        {!camera && (
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
                        {index + 1}
                      </div>
                      {/* <span className="mt-2 text-sm text-gray-700">
                      {tab.label}
                    </span> */}
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
        )}
        {activeTab === 1 && (
          <FitCheckYou
            sex={sex}
            setSex={setSex}
            height={height}
            heightErr={heightErr}
            setHeight={setHeight}
            setHeightErr={setHeightErr}
            isHeightInInch={isHeightInInch}
            setIsHeightInInch={setIsHeightInInch}
            weight={weight}
            weightErr={weightErr}
            setWeight={setWeight}
            setWeightErr={setWeightErr}
          />
        )}
        {activeTab === 2 && (
          <>
            <p className="text-ml flex items-center justify-center text-center py-4 max-w-[70%]">
              For the optimal scan, wear tight clothing, choose a clear
              background, and make sure the lighting is bright and even.
            </p>
            <Image
              src={`${sex === 0 ? "/men.png" : "/women.png"}`}
              alt="img"
              width={250}
              height={250}
              className="my-4"
            />
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
            videoRef={videoRef}
          />
        )}

        {activeTab !== 3 && (
          <Button
            variant="contained"
            onClick={handleClickOpen}
            className="mt-6 !bg-[#6B7CF6] hover:!bg-[#4e5ab6] !mb-10 !shadow-none"
          >
            Continue
          </Button>
        )}
      </div>
    </>
  );
};

export default FindSize;
