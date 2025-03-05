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
  const [measurementMatrix, setMeasurementsMatrix] = useState(null);
  const [productPart, setProductPart] = useState("top");
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setLogin(token);
    }
  }, []);

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
      <main className="min-h-screen bg-[#FAF9F6] text-black">
        <div className="py-2.5 border-b">
          <div className="mx-auto px-8 lg:px-20">
            <Logo />
          </div>
        </div>

        {/* Show a loading state before switching components */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[80vh]">
            <p><Spinner /></p>
          </div>
        ) : login ? (
          userData ? (
            <UserData
              userData={userData}
              setUserData={setUserData}
              productName={productName}
              productPart={productPart}
              measurementMatrix={measurementMatrix}
            />
          ) : (
            <FindSize
              setLogin={setLogin}
              productName={productName}
              productPart={productPart}
              measurementMatrix={measurementMatrix}
              setProductName={setProductName}
              setMeasurementsMatrix={setMeasurementsMatrix}
              getUserData={getUserData}
            />
          )
        ) : (
          <Login setLogin={setLogin} setIsLoading={setIsLoading} />
        )}
      </main>
    </>
  );
};

export default Id;
