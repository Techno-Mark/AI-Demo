import { Button } from "@mui/material";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer, ToastOptions } from "react-toastify";
import Logo from "tsconfig.json/assets/icons/Logo`";
import FindSize from "tsconfig.json/components/SizeMeasurment/Fitcheck/FindSize`";
import Login from "tsconfig.json/components/SizeMeasurment/Fitcheck/Login`";
import UserData from "tsconfig.json/components/SizeMeasurment/Fitcheck/UserData`";
import Spinner from "tsconfig.json/components/Spinner`";

const toastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

const Id = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [login, setLogin] = useState<string | null>(null);
  const [userData, setUserData] = useState<Record<string, number> | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [measurementMatrix, setMeasurementsMatrix] = useState<any>(null);
  const [productPart, setProductPart] = useState<string>("top");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoginClicked, setIsLoginClicked] = useState<number>(0);
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [activeTab, setActiveTab] = useState<number>(1);
  const [camera, setCamera] = useState<boolean>(false);

  // Handle window resize
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle incoming messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, productName, measurements, apparelType } = event.data;
      if (type === "PRODUCT_DETAILS_AND_MEASUREMENTS") {
        setProductName(productName);
        setMeasurementsMatrix(measurements);
        setProductPart(apparelType);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Fetch user data
  const getUserData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_SIZE_MEASUREMENT;

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables.");
      }

      const response = await axios.get(`${apiUrl}/userMeasurement`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (response.data.status === "success") {
        setUserData(response.data.data?.measurement || null);
      } else {
        setUserData(null);
      }
    } catch (error) {
      handleApiError(error);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle API errors
  const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        toast.error("Unauthorized! Please log in again.", toastOptions);
        localStorage.removeItem("token");
        setLogin(null);
      } else {
        toast.error(
          `Error: ${error.response.data.message || "Something went wrong!"}`,
          toastOptions
        );
      }
    } else {
      toast.error("There is some error. Please try again later.", toastOptions);
    }
  };

  // Fetch user data when login state changes
  useEffect(() => {
    if (login) {
      getUserData();
    }
  }, [login]);

  // Handle back button logic
  const handleBackButton = () => {
    if (isLoginClicked === 1) {
      setIsLoginClicked(0);
    } else if (login && activeTab !== 1) {
      handleTabNavigation();
    } else if (!login) {
      handleTabNavigation();
    }
  };

  const handleTabNavigation = () => {
    if (activeTab === 3) {
      setActiveTab(2);
      stopCamera();
    } else if (activeTab === 2) {
      setActiveTab(1);
    } else {
      setIsLoginClicked(0);
    }
  };

  const stopCamera = () => {
    setCamera(false);
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <>
      <ToastContainer />
      <main className="min-h-[95vh] h-[100%] bg-white text-black !font-poppins">
        <div className="py-2.5 border-b flex items-center justify-between px-6">
          {isLoginClicked !== 0 || (login && activeTab !== 1) ? (
            <svg
              stroke="gray"
              fill="gray"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="16"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
              className="cursor-pointer"
              onClick={handleBackButton}
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M11.67 3.87 9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z"></path>
            </svg>
          ) : (
            <div>&nbsp;</div>
          )}
          <div className="mx-auto px-8 md:px-20">
            <Logo width={windowSize.width < 1024 ? 100 : 200} />
          </div>
          <div>
            <svg
              stroke="gray"
              fill="none"
              strokeWidth="0"
              viewBox="0 0 15 15"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
              className="cursor-pointer"
              onClick={() => {
                stopCamera();
                parent.postMessage({ type: "closeIframeWindow" }, "*");
              }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="gray"
              ></path>
            </svg>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[80vh] h-full">
            <Spinner />
          </div>
        ) : login ? (
          userData ? (
            <UserData
              userData={userData}
              setUserData={setUserData}
              productName={productName}
              productPart={productPart}
              measurementMatrix={measurementMatrix}
              setLogin={setLogin}
              getUserData={getUserData}
            />
          ) : (
            <FindSize
              login={login}
              setLogin={setLogin}
              productName={productName}
              productPart={productPart}
              measurementMatrix={measurementMatrix}
              getUserData={getUserData}
              setIsRegister={setIsRegister}
              setIsLoginClicked={setIsLoginClicked}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              camera={camera}
              setCamera={setCamera}
              videoRef={videoRef}
            />
          )
        ) : isLoginClicked === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[88vh] h-full px-5 gap-8 md:gap-12">
            <p className="text-md md:text-[2.5rem] text-center flex flex-col gap-4 md:gap-10 items-center justify-center">
              <span>Welcome to your personal sizing assistant.</span>
              <span>Scan your body and have fun shopping!</span>
            </p>
            <div className="flex items-center justify-center gap-4 mt-8 md:mt-0">
              <Button
                type="button"
                color="primary"
                variant="contained"
                className="!w-fit !font-semibold mt-4 md:mt-20 md:text-2xl md:py-4 md:px-8 md:mx-4 bg-[#6B7CF6] hover:bg-[#6B7CF6] cursor-pointer"
                onClick={() => setIsLoginClicked(1)}
              >
                Login
              </Button>
              <Button
                type="button"
                color="primary"
                variant="contained"
                className="!w-fit !font-semibold mt-4 md:mt-20 md:text-2xl md:py-4 md:px-8 md:mx-4 bg-[#6B7CF6] hover:bg-[#6B7CF6] cursor-pointer"
                onClick={() => {
                  setIsLoginClicked(2);
                  setLogin(null);
                }}
              >
                Get started
              </Button>
            </div>
          </div>
        ) : isLoginClicked === 1 ? (
          <Login
            setLogin={setLogin}
            setIsLoading={setIsLoading}
            isRegister={isRegister}
            setIsRegister={setIsRegister}
          />
        ) : (
          <FindSize
            login={login}
            setLogin={setLogin}
            productName={productName}
            productPart={productPart}
            measurementMatrix={measurementMatrix}
            getUserData={getUserData}
            setIsLoginClicked={setIsLoginClicked}
            setIsRegister={setIsRegister}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            camera={camera}
            setCamera={setCamera}
            videoRef={videoRef}
          />
        )}
      </main>
    </>
  );
};

export default Id;
