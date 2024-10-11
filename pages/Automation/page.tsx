import axios from "axios";
import React, { useState } from "react";
import Spinner from "tsconfig.json/components/Spinner`";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import loader from "../../public/loder.gif";

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
const Automation = () => {
  const [image, setImage] = useState("");
  const [images, setImages] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [downloadBtn, setDownloadBtn] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [uploadBtn, setUploadBtn] = useState(false);
  const [createObjectURL, setCreateObjectURL] = useState("");
  const [fileError, setFileError] = useState(false);
  const [fileErrMsg, setFileErrorMsg] = useState("");

  const handleChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const i = e.target.files[0];
      setImage(i);
      const filename = e.target.files[0].name;
      setImages(filename);
      setCreateObjectURL(URL.createObjectURL(i));
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
    setDownloadBtn(false);
  };

  const handleUpload = async (e: any) => {
    e.preventDefault();
    setDisabled(true);
    const body = new FormData();
    body.append("file", image);
    try {
      let response = await axios.post(
        `https://apiuattaxworkpaper.pacificabs.com:5000/process_pdf`,
        body
      );
      if (response.status === 200) {
        toast.success(response.data.message, toastOptions);
        const fileName = images;
        const name = fileName.substring(0, fileName?.indexOf("."));
        setDownloadUrl(
          `https://apiuattaxworkpaper.pacificabs.com:5000/download_pdf?file_name=${name}`
        );
        setDownloadBtn(true);
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
                      Indexing & Bookmarking
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
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">
                          Upload your .zip file here.
                        </p>
                      )}
                    </td>
                    <td className="flex px-6 py-4 gap-[15px] justify-center">
                      <button
                        className={`flex gap-[15px] bg-[#1492c8] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                          disabled || fileError || !uploadBtn ? "cursor-not-allowed opacity-50" : ""
                        }`}
                        onClick={ disabled || !uploadBtn || fileError ? undefined : handleUpload} >
                        Upload
                        {disabled ? (
                          <>
                            <Spinner />
                          </>
                        ) : (
                          ""
                        )}
                      </button>
                      <a
                        id="downloadClick"
                        href={downloadBtn ? downloadUrl : "javascript:void(0);"}
                        className={`flex gap-[15px] bg-[#259916] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                          downloadBtn ? "" : "cursor-not-allowed opacity-50"
                        }`}
                      >
                        {/* onClick={
                      downloadBtn
                        ? () => handelDownload(images)
                        : undefined
                    } */}
                        Download 
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="bg-white py-3 px-5">
                      <p><strong>Important Notes:</strong></p>
                      <ol className="list-decimal ps-4 pt-2">
                        <li className="pb-1">To utilize the Indexing and Bookmarking Tool, users must upload a single .zip folder.</li>
                        <li className="pb-1">The .zip folder should consistently contain subfolders with the following names: 1040, Organizer, Emails, and Standard Documents.</li>
                        <li className="pb-1">Note that the page sequence for 1040, Organizer, and Emails will not function linearly; it will follow the order of 1040, Organizer, and Emails.</li>
                        <li className="pb-1">This specific sequence, however, applies only to standard documents.</li>
                        <li className="pb-1">In the case of standard documents, if two forms are identified under a single page, they will be bookmarked as &quot;Brokerage&quot;.</li>
                        <li className="pb-1">If the form name cannot be identified, it will be categorized under the bookmark name as &quot;Other.&quot; </li>
                        <li className="pb-1">Indexing and Bookmarking Tool exclusively works with PDF files and does not support other file formats such as Images, Word, Excel, PowerPoint, etc...</li>
                        <li className="pb-1">Before proceeding with further processing, it is essential for the user to re-validate the indexing and bookmarking file generated by the system.</li>
                      </ol>
                    </td>
                  </tr>
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
