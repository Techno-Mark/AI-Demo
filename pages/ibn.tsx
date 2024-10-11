import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "tsconfig.json/components/Header`";
import Image from "next/image";
import ReorderSection from "tsconfig.json/components/ReorderSection`";
import UploadSection from "tsconfig.json/components/UploadSection`";
import loader from "../public/loder.gif";

const toastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

interface BookmarkDetail {
  bookmark: string;
  pdf: string[];
}

interface ResponseData {
  bookmark_detail: BookmarkDetail[];
  preview_pdf: string;
  meta_folder: string;
  file_name: string;
  message: string;
}

const IndexBookMarking = () => {
  const [image, setImage] = useState<File | string>("");
  const [disabled, setDisabled] = useState(false);
  const [uploadBtn, setUploadBtn] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [fileErrMsg, setFileErrorMsg] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [data, setData] = useState<ResponseData | null>(null);

  const handleChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const i = e.target.files[0];
      setImage(i);
      setUploadBtn(true);
    }
    const maxsize = 200 * 1024 * 1024;
    if (e.target.files[0]?.size > maxsize) {
      setFileError(true);
      setFileErrorMsg("Please select file less than 200 mb");
      setUploadBtn(false);
    } else if (!e.target.files[0]?.name.endsWith(".zip")) {
      setFileError(true);
      setFileErrorMsg("Only zip file is valid");
      setUploadBtn(false);
    } else {
      setFileError(false);
      setUploadBtn(true);
    }
  };

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDisabled(true);
    const body = new FormData();
    body.append("file", image);
    try {
      let response = await axios.post(
        `https://pythonapi.pacificabs.com:5001/process_pdf`,
        body
      );
      if (response.status === 200) {
        toast.success(response.data.message, toastOptions);
        setUploadBtn(false);
        setFileUploaded(true);
        setFileName(response.data.file_name);
        setData(response.data);
      } else {
        toast.error(response.data.message, toastOptions);
        setData(null);
      }
    } catch (error: any) {
      toast.error(error.message, toastOptions);
      setData(null);
    }
    setDisabled(false);
  };

  return (
    <>
      <main className={`min-h-screen`}>
        <Header />
        {disabled ? (
          <div className="flex justify-center items-center min-h-[calc(100vh-70px)] bg-[#fcfcff]">
            <Image src={loader} alt="Loader" />
          </div>
        ) : fileUploaded ? (
          <ReorderSection
            data={data}
            setData={setData}
            fileName={fileName}
            setFileUploaded={setFileUploaded}
            download={false}
          />
        ) : (
          <UploadSection
            fileUploaded={fileUploaded}
            fileError={fileError}
            fileErrMsg={fileErrMsg}
            disabled={disabled}
            uploadBtn={uploadBtn}
            handleChange={handleChange}
            handleUpload={handleUpload}
          />
        )}
      </main>
      <ToastContainer {...toastOptions} />
    </>
  );
};

export default IndexBookMarking;
