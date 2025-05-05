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
  const [productName, setProductName] = useState("");
  const [measurementMatrix, setMeasurementsMatrix] = useState();
  const [productPart, setProductPart] = useState("top");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginClicked, setIsLoginClicked] = useState(0);
  const [isRegister, setIsRegister] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [activeTab, setActiveTab] = useState(1);
  const [camera, setCamera] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const token = localStorage.getItem("token");
  //     setLogin(token);
  //   }
  // }, []);

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

  const getUserData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SIZE_MEASUREMENT}/userMeasurement`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );

      if (response.data.status === "success") {
        setUserData(response.data.data?.measurement || null);
      } else {
        setUserData(null);
      }
    } catch (error) {
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
        toast.error(
          "There is some error. Please try again later.",
          toastOptions
        );
      }
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (login) {
      getUserData();
    }
  }, [login]);

  return (
    <>
      <ToastContainer />
      <main className="min-h-[95vh] h-[100vh] bg-white text-black !font-poppins">
        <div className="py-2.5 border-b flex items-center justify-between px-6">
          {isLoginClicked === 1 ||
          (login && activeTab !== 1 && isLoginClicked === 2) ||
          (!login && isLoginClicked === 2) ? (
            <svg
              stroke="gray"
              fill="gray"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="16"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
              className="cursor-pointer"
              onClick={() => {
                if (isLoginClicked === 1) {
                  setIsLoginClicked(0);
                }
                if (login && activeTab !== 1) {
                  activeTab === 3
                    ? (() => {
                        setActiveTab(2);
                        setCamera(false);
                        if (videoRef.current) {
                          const stream = videoRef.current
                            .srcObject as MediaStream | null;
                          const tracks = stream?.getTracks();
                          tracks?.forEach((track) => track.stop());
                        }
                      })()
                    : activeTab === 2 && setActiveTab(1);
                }
                if (!login) {
                  activeTab === 3
                    ? (() => {
                        setActiveTab(2);
                        setCamera(false);
                        if (videoRef.current) {
                          const stream = videoRef.current
                            .srcObject as MediaStream | null;
                          const tracks = stream?.getTracks();
                          tracks?.forEach((track) => track.stop());
                        }
                      })()
                    : activeTab === 2
                    ? setActiveTab(1)
                    : setIsLoginClicked(0);
                }
              }}
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M11.67 3.87 9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12z"></path>
            </svg>
          ) : (
            <div>&nbsp;</div>
          )}
          <div className="mx-auto px-8 lg:px-20">
            <Logo width={windowSize?.width < 1024 ? 100 : 200} />
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
                if (videoRef.current) {
                  const stream = videoRef.current
                    .srcObject as MediaStream | null;
                  const tracks = stream?.getTracks();
                  tracks?.forEach((track) => track.stop());
                }
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
          <div className="flex justify-center items-center min-h-[80vh]">
            <p>
              <Spinner />
            </p>
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
              setIsLoginClicked={(val: number) => setIsLoginClicked(val)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              camera={camera}
              setCamera={setCamera}
              videoRef={videoRef}
            />
          )
        ) : (
          <></>
        )}
        {!login && isLoginClicked === 0 ? (
          <div className="flex flex-col items-center justify-center h-[88vh] px-5">
            <p className="text-2xl text-center">
              Welcome to your personal sizing assistant. Scan yourself once and
              have fun shopping!
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                color="primary"
                variant="contained"
                className="rounded-full !w-fit !font-semibold mt-[35px] bg-[#6B7CF6] hover:bg-[#6B7CF6] cursor-pointer"
                onClick={() => setIsLoginClicked(1)}
              >
                Login
              </Button>
              <Button
                type="button"
                color="primary"
                variant="contained"
                className="rounded-full !w-fit !font-semibold mt-[35px] bg-[#6B7CF6] hover:bg-[#6B7CF6] cursor-pointer"
                onClick={() => {
                  setIsLoginClicked(2);
                  setLogin(null);
                }}
              >
                Get started
              </Button>
            </div>
          </div>
        ) : !login && isLoginClicked === 1 ? (
          <Login
            setLogin={setLogin}
            setIsLoading={setIsLoading}
            setIsLoginClicked={(val: number) => setIsLoginClicked(val)}
            isRegister={isRegister}
            setIsRegister={setIsRegister}
          />
        ) : (
          !login &&
          isLoginClicked === 2 && (
            <FindSize
              login={login}
              setLogin={setLogin}
              productName={productName}
              productPart={productPart}
              measurementMatrix={measurementMatrix}
              getUserData={getUserData}
              setIsLoginClicked={(val: number) => setIsLoginClicked(val)}
              setIsRegister={setIsRegister}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              camera={camera}
              setCamera={setCamera}
              videoRef={videoRef}
            />
          )
        )}
      </main>
    </>
  );
};

export default Id;
