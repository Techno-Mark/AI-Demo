/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import Logo from "tsconfig.json/assets/icons/Logo`";
import FitCheckYou from "./FitCheckYou";
import FitCheckYourBody from "./FitCheckYourBody";
import FitCheckYourSize from "./FitCheckYourSize";
import FitCheckYourSize1 from "./FitCheckYourSize1";

const tabs = [
  { label: "You", value: 1 },
  // { label: "Your body", value: 2 },
  { label: "Your Size", value: 3 },
];

const FindSize = ({
  setLogin,
  productPart,
  productName,
  measurementMatrix,
  setProductName,
  setMeasurementsMatrix,
  getUserData,
}: any) => {
  const [activeTab, setActiveTab] = useState(1);
  const [height, setHeight] = useState(0);
  const [heightErr, setHeightErr] = useState(false);
  const [weight, setWeight] = useState(0);
  const [weightErr, setWeightErr] = useState(false);
  // const [dob, setDOB] = useState(0);
  // const [dobErr, setDOBErr] = useState(false);
  const [sex, setSex] = useState(0);
  // const [body, setBody] = useState(0);
  // const [bodyErr, setBodyErr] = useState(false);
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
      // setDOBErr(
      //   dob === 0 ||
      //     dob.toString().trim().length < 4 ||
      //     dob.toString().trim().length > 4
      // );

      if (
        height !== 0 &&
        height.toString().trim().length > 1 &&
        height.toString().trim().length < 4 &&
        !heightErr &&
        weight !== 0 &&
        weight.toString().trim().length > 0 &&
        weight.toString().trim().length < 4 &&
        !weightErr
        // &&
        // dob !== 0 &&
        // dob.toString().trim().length > 3 &&
        // dob.toString().trim().length < 5 &&
        // !dobErr
      ) {
        // setActiveTab(2);
        setActiveTab(3);
      }
    }
    // else if (activeTab === 2) {
    //   setBodyErr(body === 0);

    //   if (body > 0 && !bodyErr) {
    //     setActiveTab(3);
    //   }
    // } else if (activeTab === 3) {
    // }
  };

  const onClose = () => {
    setActiveTab(1);
    setHeight(0);
    setHeightErr(false);
    setWeight(0);
    setWeightErr(false);
    // setDOB(0);
    // setDOBErr(false);
    setSex(0);
    // setBody(0);
    // setBodyErr(false);
    setCamera(false);
    // setProductName("");
    // setMeasurementsMatrix(null);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center pt-5 md:gap-2">
        {/* <Logo /> */}
        <p className="text-2xl">Find Your Best Size</p>
        <div className="flex items-center justify-center gap-8 md:gap-16 lg:gap-20 py-4 lg:py-4">
          {tabs.map((tab) => (
            <p
              className={`border-b-4 text-2xl md:text-3xl pb-2 ${
                tab.value === activeTab
                  ? "border-[#6B7CF6]"
                  : "border-[#D9D9D9]"
              }`}
              key={tab.value}
            >
              {tab.label}
            </p>
          ))}
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
            // dob={dob}
            // dobErr={dobErr}
            // setDOB={setDOB}
            // setDOBErr={setDOBErr}
          />
        )}
        {/* {activeTab === 2 && (
          <FitCheckYourBody
            body={body}
            bodyErr={bodyErr}
            setBody={setBody}
            setBodyErr={setBodyErr}
          />
        )} */}
        {activeTab === 3 && (
          <FitCheckYourSize1
            height={height}
            camera={camera}
            setCamera={setCamera}
            sex={sex}
            weight={weight}
            // dob={dob}
            // body={body}
            onClose={onClose}
            productName={productName}
            measurementMatrix={measurementMatrix}
            productPart={productPart}
            setLogin={setLogin}
            getUserData={getUserData}
          />
        )}

        {activeTab !== 3 && (
          <Button
            variant="contained"
            onClick={handleClickOpen}
            className="mt-6 !bg-[#6B7CF6]"
          >
            Continue
          </Button>
        )}
      </div>
    </>
  );
};

export default FindSize;
