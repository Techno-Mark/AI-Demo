import { Button } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
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
      <main className="min-h-screen bg-white text-black !font-poppins">
        <div className="py-2.5 border-b">
          <div className="mx-auto px-8 lg:px-20 flex items-center justify-center">
            <Logo width={windowSize?.width < 1024 ? 100 : 200} />
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
            />
          )
        ) : (
          <></>
        )}
        {!login && isLoginClicked === 0 ? (
          <div className="flex flex-col items-center justify-center h-[94vh] px-5">
            <p className="text-lg">
              Welcome to your personal sizing assistant. Set it up once and have
              fun shopping!
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                color="primary"
                variant="contained"
                className="rounded-full !w-fit !font-semibold mt-[35px] bg-[#1565C0] cursor-pointer"
                onClick={() => setIsLoginClicked(1)}
              >
                Login
              </Button>
              <Button
                type="button"
                color="primary"
                variant="contained"
                className="rounded-full !w-fit !font-semibold mt-[35px] bg-[#1565C0] cursor-pointer"
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
            />
          )
        )}
      </main>
    </>
  );
};

export default Id;
