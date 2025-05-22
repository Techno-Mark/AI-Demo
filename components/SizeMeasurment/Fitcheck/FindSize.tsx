/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@mui/material";
import React, { useState } from "react";
import FitCheckYou from "./FitCheckYou";
import FitCheckYourSize3 from "./FitCheckYourSize3";
import Image from "next/image";

const tabs = [
  { label: "You", value: 1 },
  { label: "Your Size", value: 2 },
  { label: "Camera", value: 3 },
];

interface FindSizeProps {
  login: string | null;
  setLogin: (value: string | null) => void;
  productPart: string;
  productName: string;
  measurementMatrix: any;
  getUserData: () => void;
  setIsLoginClicked: (value: number) => void;
  setIsRegister: (value: boolean) => void;
  activeTab: number;
  setActiveTab: (value: number) => void;
  camera: boolean;
  setCamera: (value: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const FindSize: React.FC<FindSizeProps> = ({
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
}) => {
  const [height, setHeight] = useState<number>(0);
  const [isHeightInInch, setIsHeightInInch] = useState<boolean>(false);
  const [heightErr, setHeightErr] = useState<boolean>(false);
  const [weight, setWeight] = useState<number>(0);
  const [weightErr, setWeightErr] = useState<boolean>(false);
  const [sex, setSex] = useState<number>(0);

  const handleClickOpen = () => {
    if (activeTab === 1) {
      const heightRegex = isHeightInInch
        ? /^\d{0,2}(\.\d{0,2})?$/
        : /^\d{0,3}(\.\d{0,2})?$/;
      const weightRegex = /^\d{0,3}(\.\d{0,2})?$/;

      const isHeightValid = height !== 0 && heightRegex.test(height.toString());
      const isWeightValid = weight !== 0 && weightRegex.test(weight.toString());

      setHeightErr(!isHeightValid);
      setWeightErr(!isWeightValid);

      if (isHeightValid && isWeightValid) {
        setActiveTab(2);
      }
    } else {
      setActiveTab(3);
    }
  };

  const handleClose = () => {
    setHeight(0);
    setHeightErr(false);
    setWeight(0);
    setWeightErr(false);
    setSex(0);
    setCamera(false);
  };

  const renderTabNavigation = () => (
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
              </div>
              {index < tabs.length - 1 && (
                <div
                  className={`h-1 w-10 md:w-20 ${
                    isCompleted ? "bg-[#6B7CF6]" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col items-center justify-start pt-5 md:gap-2 min-h-[88vh] h-full">
        {!camera && renderTabNavigation()}

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
          <div className="flex flex-col items-center justify-between py-1 gap-2 min-h-[50vh]">
            <p className="text-ml flex items-center justify-center text-center py-3 max-w-[70%]">
              For the optimal scan, wear tight clothing, choose a clear
              background, and make sure the lighting is bright and even.
            </p>
            <Image
              src={sex === 0 ? "/men.png" : "/women.png"}
              alt="img"
              width={250}
              height={250}
              className="my-4"
            />
          </div>
        )}

        {activeTab === 3 && (
          <FitCheckYourSize3
            login={login}
            setLogin={setLogin}
            camera={camera}
            setCamera={setCamera}
            videoRef={videoRef}
            height={height}
            weight={weight}
            sex={sex}
            onClose={handleClose}
            productName={productName}
            measurementMatrix={measurementMatrix}
            productPart={productPart}
            getUserData={getUserData}
            setActiveTab={setActiveTab}
            setIsRegister={setIsRegister}
            setIsLoginClicked={setIsLoginClicked}
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
