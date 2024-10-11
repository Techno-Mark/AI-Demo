import axios from "axios";
import React, { useState } from "react";
import Spinner from "tsconfig.json/components/Spinner`";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import loader from "../public/loder.gif";
import Header from "tsconfig.json/components/Header`";

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
const Schd = () => {
  const [image, setImage] = useState("");
  const [images, setImages] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [downloadBtn, setDownloadBtn] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [uploadBtn, setUploadBtn] = useState(false);
  const [createObjectURL, setCreateObjectURL] = useState("");
  const [fileError, setFileError] = useState(false);
  const [fileErrMsg, setFileErrorMsg] = useState("");
  const [isDepreciation, setIsDepreciation] = useState(false);
  const [selectedOption, setSelectedOption] = useState("none");
  const [selectedForm, setSelectedForm] = useState("none");
  const [selectedCategory, setSelectedCategory] = useState("none");
  const [showAdditionalDropdowns, setShowAdditionalDropdowns] = useState(false);

  const handleOptionChange = (event: any) => {
    const selectedOption = event.target.value;
    setSelectedOption(selectedOption);
    setShowAdditionalDropdowns(selectedOption === "Depreciation");
    setSelectedForm("none");
    setSelectedCategory("none");
  };

  const handleFormDropDownChange = (event: any) => {
    const selectedValue = event.target.value;
    setSelectedForm(selectedValue);
  };

  const handleCategoryDropDownChange = (event: any) => {
    const selectedValue = event.target.value;
    setSelectedCategory(selectedValue);
  };

  const handleChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const i = e.target.files[0];
      setImage(i);
      const filename = e.target.files[0].name;
      setImages(filename);
      setCreateObjectURL(URL.createObjectURL(i));
      setUploadBtn(true);
    }
    const maxsize = 100 * 1024 * 1024;
    if (e.target.files[0]?.size > maxsize) {
      setFileError(true);
      setFileErrorMsg("Please select file less than 100 mb");
      setUploadBtn(false);
    } else if (!e.target.files[0]?.name.endsWith(".pdf")) {
      setFileError(true);
      setFileErrorMsg("Only PDF file is valid");
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
    body.append("selected_form", selectedForm);
    body.append("selected_category", selectedCategory);

    try {
      let response = await axios.post(
        `https://apiuattaxworkpaper.pacificabs.com:5000/process_file`,
        body
      );
      if (response.status === 200) {
        toast.success(response.data.message, toastOptions);
        const fileName = images;
        const name = fileName.substring(0, fileName?.indexOf("."));
        setDownloadUrl(
          `https://apiuattaxworkpaper.pacificabs.com:5000/download_file?file_name=${name}`
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
      <main className={`min-h-screen`}>
        <Header />
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
                        Select the option
                      </th>
                      <th scope="col" className="px-4 py-3 text-start">
                        Depreciation and Sch D
                      </th>
                      <th className="px-6 py-3">
                        {showAdditionalDropdowns && "options"}
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-center">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-start">
                        <select
                          className="mb-[18px] w-[130px]"
                          value={selectedOption}
                          onChange={handleOptionChange}
                        >
                          <option value="none" selected disabled hidden>
                            Select an Option
                          </option>
                          <option value="Depreciation">Depreciation</option>
                          <option value="Sch D">Sch D</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-start">
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
                            Upload your PDF file here.
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {showAdditionalDropdowns && (
                          <div className="flex">
                            <select
                              className="m-3 mw-[180px] mt-0 mr-0"
                              value={selectedForm}
                              onChange={handleFormDropDownChange}
                            >
                              <option value="none" selected disabled hidden>
                                Select an Option
                              </option>
                              <option value="1">Schedule A (2%)</option>
                              <option value="2">Schedule C</option>
                              <option value="3">Schedule E (rental)</option>
                              <option value="4">Schedule F/Form 4835</option>
                              <option value="5">Form 2106</option>
                              <option value="6">Schedule A (other)</option>
                              <option value="7">Schedule A (points)</option>
                              <option value="8">
                                Schedule A (employee business expense)
                              </option>
                              <option value="9">Business Use of Home</option>
                              <option value="10">
                                Schedule E (vacation home)
                              </option>
                              <option value="11">
                                Schedule E (partnership)
                              </option>
                              <option value="12">
                                Schedule E (S corporation)
                              </option>
                              <option value="13">
                                Schedule E (estate or trust)
                              </option>
                              <option value="14">Oil & Gas Property</option>
                              <option value="15">Oil & Gas set</option>
                              <option value="16">Form 4562 only</option>
                            </select>

                            <select
                              className="m-3 mt-0"
                              value={selectedCategory}
                              onChange={handleCategoryDropDownChange}
                            >
                              <option value="none" selected disabled hidden>
                                Select an Option
                              </option>
                              <option value="1">Automobile / Transportation Equipment</option>
                              <option value="2">Furniture and Fixtures</option>
                              <option value="4">Machinery and Equipment</option>
                              <option value="5">Buildings</option>
                              <option value="6">Improvements</option>
                              <option value="7">Land</option>
                              <option value="8">Miscellaneous</option>
                              <option value="9">Amortization</option>
                            </select>
                          </div>
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
                        <a
                          id="downloadClick"
                          href={
                            downloadBtn ? downloadUrl : "javascript:void(0);"
                          }
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
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default Schd;
