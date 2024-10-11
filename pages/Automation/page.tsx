import axios from "axios";
import React, { useState } from "react";
import Spinner from "tsconfig.json/components/Spinner`";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import loader from "../../public/loder.gif";

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

const Automation = () => {
  const [image, setImage] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [uploadBtn, setUploadBtn] = useState(false);
  const [response, setResponse] = useState("");
  const [fileError, setFileError] = useState(false);
  const [fileErrMsg, setFileErrorMsg] = useState("");

  const handleChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const filename = file.name;
      setUploadBtn(true);

      // Check file size and type
      const maxSize = 10 * 1024 * 1024; // 10 MB
      const fileTypes = [".jpg", ".jpeg", ".png"];
      const fileExtension = filename
        .slice(filename.lastIndexOf("."))
        .toLowerCase();

      if (file.size > maxSize) {
        setFileError(true);
        setFileErrorMsg("Please select a file less than 10 MB.");
        setUploadBtn(false);
      } else if (!fileTypes.includes(fileExtension)) {
        setFileError(true);
        setFileErrorMsg("Only .jpg, .jpeg, and .png files are valid.");
        setUploadBtn(false);
      } else {
        setFileError(false);
        setUploadBtn(true);
      }
    }
  };

  const handleUpload = async (e: any) => {
    e.preventDefault();
    setDisabled(true);
    const body = new FormData();
    body.append("report", image);
    try {
      let response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/process_report`,
        body
      );
      if (response.status === 200) {
        toast.success(response.data.message, toastOptions);
        setResponse(response?.data?.response)

        setUploadBtn(false);
      } else {
        toast.error(response.data.message, toastOptions);
      }
    } catch (error: any) {
      toast.error(error.message, toastOptions);
    }
    setDisabled(false);
  };

  return (
    <>
      {disabled ? (
        <>
          <div className="flex justify-center items-center min-h-[calc(100vh-70px)] bg-[#fcfcff]">
            <Image src={loader} alt="Loader" />
          </div>
        </>
      ) : (
        <section className="automationSection px-5 py-9">
          <div className="container mx-auto px-20">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr className="text-center">
                    <th scope="col" className="px-6 py-3 text-start">
                      Medical History
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-center">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-start">
                      <input
                        className="w-full text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        aria-describedby="file_input_help"
                        id="file_input"
                        type="file"
                        onChange={handleChange}
                      />
                      {fileError && (
                        <p
                          className="mt-1 text-sm text-red-500 dark:text-red-300"
                          id="file_input_help"
                        >
                          {fileErrMsg}
                        </p>
                      )}
                      {!fileError && (
                        <p
                          className="mt-1 text-sm text-gray-500 dark:text-gray-300"
                          id="file_input_help"
                        >
                          Upload your medical report in image format.
                        </p>
                      )}
                    </td>
                    <td className="flex px-6 py-4 gap-[15px] justify-center">
                      <button
                        className={`flex gap-[15px] bg-[#1492c8] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                          disabled || fileError || !uploadBtn
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        onClick={
                          disabled || !uploadBtn || fileError
                            ? undefined
                            : handleUpload
                        }
                      >
                        Upload
                        {disabled ? (
                          <>
                            <Spinner />
                          </>
                        ) : (
                          ""
                        )}
                      </button>
                      {/* <a
                        id="downloadClick"
                        href={downloadBtn ? downloadUrl : "javascript:void(0);"}
                        className={`flex gap-[15px] bg-[#259916] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                          downloadBtn ? "" : "cursor-not-allowed opacity-50"
                        }`}
                      >
                        Download 
                      </a> */}
                    </td>
                  </tr>
                  {response && response.length > 0 && (
                    <tr>
                      <td colSpan={2} className="bg-white py-3 px-5">
                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                          <p className="text-base font-semibold text-gray-700">
                            <strong>Result:</strong>

                          </p>
                          <p className="text-sm text-gray-800 mt-2 whitespace-pre-line">
                            {response}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Automation;
