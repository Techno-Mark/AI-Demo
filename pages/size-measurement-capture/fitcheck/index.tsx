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
  const [isLoginClicked, setIsLoginClicked] = useState<any>(0);
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
        setIsLoginClicked(3);
        if (response.data.data?.measurement) {
          parent.postMessage(
            {
              type: "fitcheckUserSize",
              chest: response.data.data?.measurement?.chestSize,
              waist: response.data.data?.measurement?.waistSize,
            },
            "*"
          );
        }
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
    console.log(error);
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
    } else if (login) {
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
    } else if (login && activeTab === 1) {
      setIsLoginClicked(3);
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
        <div className="py-1.5 border-b flex items-center justify-between px-6">
          {(!login && isLoginClicked !== 0) ||
          (login && isLoginClicked !== 3) ? (
            <div
              className="flex items-center justify-center gap-2 cursor-pointer"
              onClick={handleBackButton}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M14.3682 15.9996L18.418 11.9498C18.637 11.7332 18.7465 11.4623 18.7465 11.1372C18.7465 10.8123 18.637 10.5321 18.418 10.2964C18.1823 10.051 17.9001 9.93081 17.5713 9.93582C17.2425 9.94084 16.9604 10.061 16.725 10.2964L12.0237 14.9977C11.7374 15.2841 11.5942 15.618 11.5942 15.9996C11.5942 16.3812 11.7374 16.7151 12.0237 17.0014L16.7491 21.7269C16.9848 21.9623 17.2629 22.0785 17.5836 22.0756C17.9042 22.0725 18.1823 21.9482 18.418 21.7028C18.637 21.4671 18.7481 21.189 18.7513 20.8683C18.7542 20.5477 18.6379 20.2696 18.4025 20.0339L14.3682 15.9996ZM15.9975 0.957925C18.078 0.957925 20.0335 1.3527 21.8641 2.14226C23.6947 2.93181 25.287 4.00333 26.641 5.35682C27.995 6.71031 29.0671 8.30195 29.8572 10.1318C30.647 11.9616 31.0419 13.9166 31.0419 15.9968C31.0419 18.0773 30.6471 20.0329 29.8576 21.8635C29.068 23.6941 27.9965 25.2864 26.643 26.6404C25.2895 27.9944 23.6979 29.0664 21.8681 29.8565C20.0383 30.6464 18.0832 31.0413 16.003 31.0413C13.9225 31.0413 11.967 30.6465 10.1364 29.8569C8.30576 29.0674 6.71345 27.9959 5.35944 26.6424C4.00542 25.2889 2.93338 23.6972 2.14329 21.8674C1.35347 20.0376 0.958564 18.0826 0.958563 16.0024C0.958563 13.9219 1.35334 11.9663 2.14289 10.1357C2.93245 8.30512 4.00397 6.71281 5.35746 5.3588C6.71094 4.00479 8.30259 2.93274 10.1324 2.14265C11.9622 1.35283 13.9172 0.957925 15.9975 0.957925ZM16.0002 3.33293C12.4641 3.33293 9.46898 4.56001 7.01481 7.01418C4.56065 9.46834 3.33356 12.4635 3.33356 15.9996C3.33356 19.5357 4.56065 22.5308 7.01481 24.985C9.46898 27.4392 12.4641 28.6663 16.0002 28.6663C19.5363 28.6663 22.5315 27.4392 24.9856 24.985C27.4398 22.5308 28.6669 19.5357 28.6669 15.9996C28.6669 12.4635 27.4398 9.46834 24.9856 7.01417C22.5315 4.56001 19.5363 3.33292 16.0002 3.33293Z"
                  fill="#1C1B1F"
                />
              </svg>
              <p>Back</p>
            </div>
          ) : (
            <div>&nbsp;</div>
          )}
          <div className="mx-auto px-8 md:px-20">
            <Logo width={windowSize.width < 1024 ? 100 : 200} />
          </div>
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 38 38"
              fill="none"
              className="cursor-pointer"
              onClick={() => {
                stopCamera();
                parent.postMessage({ type: "closeIframeWindow" }, "*");
              }}
            >
              <mask
                id="mask0_15_140"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="38"
                height="38"
              >
                <rect width="38" height="38" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_15_140)">
                <path
                  d="M19 20.2668L24.2433 25.51C24.4198 25.6866 24.6284 25.7775 24.8691 25.7828C25.1095 25.7878 25.3231 25.6969 25.5099 25.51C25.6968 25.3232 25.7902 25.1121 25.7902 24.8767C25.7902 24.6413 25.6968 24.4302 25.5099 24.2434L20.2667 19.0002L25.5099 13.757C25.6865 13.5804 25.7774 13.3718 25.7827 13.1311C25.7877 12.8907 25.6968 12.6771 25.5099 12.4903C25.3231 12.3035 25.112 12.21 24.8766 12.21C24.6412 12.21 24.4301 12.3035 24.2433 12.4903L19 17.7335L13.7568 12.4903C13.5803 12.3137 13.3717 12.2228 13.131 12.2176C12.8906 12.2125 12.677 12.3035 12.4902 12.4903C12.3033 12.6771 12.2099 12.8882 12.2099 13.1236C12.2099 13.359 12.3033 13.5701 12.4902 13.757L17.7334 19.0002L12.4902 24.2434C12.3136 24.4199 12.2227 24.6285 12.2174 24.8692C12.2124 25.1096 12.3033 25.3232 12.4902 25.51C12.677 25.6969 12.8881 25.7903 13.1235 25.7903C13.3589 25.7903 13.57 25.6969 13.7568 25.51L19 20.2668ZM19.0028 34.0418C16.9387 34.0418 14.9938 33.6471 13.1682 32.8575C11.3427 32.0679 9.74626 30.9898 8.37905 29.6231C7.01184 28.2565 5.93319 26.6607 5.14311 24.8359C4.35329 23.0114 3.95838 21.0671 3.95838 19.0029C3.95838 16.9224 4.35316 14.9669 5.14272 13.1363C5.93227 11.3057 7.01039 9.71339 8.37707 8.35937C9.74375 7.00536 11.3395 5.93331 13.1643 5.14323C14.9888 4.35341 16.9331 3.9585 18.9973 3.9585C21.0778 3.9585 23.0333 4.35327 24.8639 5.14283C26.6945 5.93238 28.2868 7.00391 29.6408 8.35739C30.9949 9.71088 32.0669 11.3025 32.857 13.1323C33.6468 14.9621 34.0417 16.9172 34.0417 18.9974C34.0417 21.0615 33.6469 23.0064 32.8574 24.832C32.0678 26.6576 30.9963 28.254 29.6428 29.6212C28.2893 30.9884 26.6977 32.067 24.8679 32.8571C23.0381 33.6469 21.0831 34.0418 19.0028 34.0418ZM19 32.2451C22.6863 32.2451 25.8154 30.9553 28.3872 28.3755C30.9591 25.7954 32.245 22.6703 32.245 19.0002C32.245 15.3139 30.9591 12.1848 28.3872 9.61298C25.8154 7.04111 22.6863 5.75518 19 5.75518C15.3299 5.75518 12.2048 7.04111 9.62474 9.61298C7.04496 12.1848 5.75507 15.3139 5.75507 19.0002C5.75507 22.6703 7.04496 25.7954 9.62474 28.3755C12.2048 30.9553 15.3299 32.2451 19 32.2451Z"
                  fill="#1C1B1F"
                />
              </g>
            </svg>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[80vh] h-full">
            <Spinner />
          </div>
        ) : login ? (
          userData && isLoginClicked === 3 ? (
            <UserData
              userData={userData}
              productName={productName}
              productPart={productPart}
              measurementMatrix={measurementMatrix}
              setLogin={setLogin}
              getUserData={getUserData}
              setIsLoginClicked={setIsLoginClicked}
              setActiveTab={setActiveTab}
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
          <Login
            setLogin={setLogin}
            setIsLoading={setIsLoading}
            isRegister={isRegister}
            setIsRegister={setIsRegister}
            setIsLoginClicked={setIsLoginClicked}
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
