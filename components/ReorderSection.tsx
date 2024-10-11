/* eslint-disable react-hooks/rules-of-hooks */
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { toast, ToastOptions } from "react-toastify";
import Draganddrop from "tsconfig.json/components/OldComponents/Draganddrop`";
import DraganddropNew from "./OldComponents/DraganddropNew";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import DraganddropMove from "./DraganddropMove";
import DisplayImages from "./DisplayImages";
import Image from "next/image";
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

interface ReorderSectionProps {
  data: ResponseData | null;
  setData: any;
  fileName: string | null;
  setFileUploaded: any;
  download: boolean;
}

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

const ReorderSection: React.FC<ReorderSectionProps> = ({
  data,
  setData,
  fileName,
  setFileUploaded,
  download,
}) => {
  const warnedRef = useRef(false);
  const [disabled, setDisabled] = useState(true);
  const [changesMade, setChangesMade] = useState(false);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [previewButtonDisabled, setPreviewButtonDisabled] = useState(false);
  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState(false);
  const [fileData, setFileData] = useState<BookmarkDetail[]>([]);
  const [previewFile, setPreviewFile] = useState("");
  const [downloadFile, setDownloadFile] = useState("");
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadType, setDownloadType] = useState(0);
  const [downloadLoader, setDownloadLoader] = useState(false);

  useEffect(() => {
    if (data !== null && data.bookmark_detail?.length > 0) {
      setFileData(data.bookmark_detail);
      setPreviewFile(data.preview_pdf);
      setDownloadFile(data.meta_folder);
      // setSaveButtonDisabled(false);
    } else {
      setFileData([]);
      if (
        !warnedRef.current &&
        (data === null ||
          !data.bookmark_detail ||
          data.bookmark_detail.length === 0)
      ) {
        toast.warning("No data found Please provide valid file.");
        setFileUploaded(false);
        warnedRef.current = true;
      }
    }
  }, [data]);

  useEffect(() => {
    setSaveButtonDisabled(true);
    downloadType === 0 && setDisabled(false);
    downloadType > 0 && handleSave(false);
  }, [downloadType]);

  const handleSave = async (save: boolean) => {
    setDisabled(true);
    try {
      let response = await axios.post(
        `${
          download
            ? "https://pythonapi.pacificabs.com:5000"
            : "https://pythonapi.pacificabs.com:5001"
        }/re_arrange_pdf`,
        {
          bookmark_detail: fileData,
          meta_folder: data?.meta_folder,
          preview_pdf: data?.preview_pdf,
          file_name: data?.file_name,
          message: data?.message,
          dtype: downloadType,
          is_save: save,
        }
      );
      if (response.status === 200) {
        toast.success(response.data.message, toastOptions);
        setChangesMade(false);
        setSaveButtonDisabled(true);
        setPreviewButtonDisabled(false);
        setDownloadButtonDisabled(false);
        setData(response.data);
        setFileData(response.data.bookmark_detail);
        setPreviewFile(response.data.preview_pdf);
        setDownloadFile(response.data.meta_folder);
        setDisabled(false);
      } else {
        toast.error(response.data.message, toastOptions);
        setPreviewFile("");
        setDownloadFile("");
        setDisabled(false);
      }
    } catch (error: any) {
      toast.error(error.message, toastOptions);
      setDisabled(false);
      // setChangesMade(false);
      // setSaveButtonDisabled(true);
      // setPreviewButtonDisabled(false);
    }
  };

  const handlePreviewClick = () => {
    const link = document.createElement("a");
    link.href = previewFile;
    link.download = !!fileName ? fileName : "marge_pdf.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // setPreviewButtonDisabled(true);
  };

  const handleDownloadClick = async () => {
    setDownloadLoader(true);
    try {
      const response = await axios.get(
        `${
          download
            ? "https://pythonapi.pacificabs.com:5000"
            : "https://pythonapi.pacificabs.com:5001"
        }/download_pdf`,
        {
          params: {
            meta_fol: downloadFile,
            ufilename: !!fileName ? fileName : "marge_pdf.pdf",
            downloadType: downloadType,
          },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        if (response.data.ResponseStatus === "Failure") {
          toast.error("Please try again later.");
          setDownloadLoader(false);
        } else {
          const blob = new Blob([response.data], {
            type: "application/zip",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = !!fileName
            ? `${fileName.split(".pdf")[0]}.zip`
            : "marge_pdf.zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success("Data exported successfully.");
          setDownloadLoader(false);
          setDownloadDialogOpen(false);
          setFileUploaded(false);
        }
      } else {
        toast.error("Please try again later.");
        setDownloadLoader(false);
      }
    } catch (error) {
      toast.error("Error exporting data.");
      setDownloadLoader(false);
    }
  };

  useEffect(() => {
    if (changesMade) {
      setSaveButtonDisabled(false);
      setPreviewButtonDisabled(true);
      setDownloadButtonDisabled(true);
    } else {
      setSaveButtonDisabled(true);
    }
  }, [changesMade]);

  return (
    <>
      {disabled ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-70px)] bg-[#fcfcff]">
          <Image src={loader} alt="Loader" />
        </div>
      ) : (
        <section className="automationSection px-5 py-9">
          <div className="container mx-auto px-20">
            <span
              className="cursor-pointer"
              onClick={() => {
                setFileUploaded(false);
              }}
            >
              &lt;&nbsp;Go Back
            </span>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr className="text-center">
                    <th
                      scope="col"
                      className="px-6 py-3 text-start flex items-center justify-between"
                    >
                      Reorder
                      <div className="flex items-center justify-center gap-4">
                        <FormControl
                          variant="standard"
                          sx={{ mx: 0.75, width: 300, borderColor: "#FFFFFF" }}
                        >
                          <InputLabel
                            id="demo-simple-select-standard-label"
                            className="!text-gray-400"
                          >
                            Download type
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-standard-label"
                            id="demo-simple-select-standard"
                            className="!text-gray-400 capitalize"
                            value={downloadType}
                            onChange={(e) =>
                              setDownloadType(Number(e.target.value))
                            }
                            placeholder="Select Download Type"
                          >
                            <MenuItem value={0} disabled>
                              Select Download Type
                            </MenuItem>
                            <MenuItem value={1}>Default</MenuItem>
                            <MenuItem value={2}>UltraTax</MenuItem>
                            <MenuItem value={3}>Pro-Conect</MenuItem>
                            <MenuItem value={4}>Pro-Series</MenuItem>
                          </Select>
                        </FormControl>
                        <button
                          className={`flex gap-[15px] bg-[#1492C8] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                            saveButtonDisabled || downloadType <= 0
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          onClick={() =>
                            saveButtonDisabled ? undefined : handleSave(true)
                          }
                          disabled={saveButtonDisabled || downloadType <= 0}
                        >
                          Save
                        </button>
                        <button
                          // className="flex gap-[15px] bg-[#259916] text-white text-sm font-semibold px-4 py-2 rounded-md"
                          className={`flex gap-[15px] bg-[#259916] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                            previewButtonDisabled || downloadType <= 0
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          disabled={previewButtonDisabled || downloadType <= 0}
                        >
                          {previewButtonDisabled ? (
                            "Preview"
                          ) : (
                            <a href={previewFile} target="_blank">
                              Preview
                            </a>
                          )}
                        </button>
                        <button
                          className={`flex gap-[15px] bg-[#259916] text-white text-sm font-semibold px-4 py-2 rounded-md ${
                            downloadButtonDisabled || downloadType <= 0
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          onClick={() => setDownloadDialogOpen(true)}
                          disabled={downloadButtonDisabled || downloadType <= 0}
                        >
                          Download
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-center">
                    {/* <DraganddropNew
                  fileData={fileData}
                  setFileData={setFileData}
                  onDataChange={() => setChangesMade(true)}
                /> */}

                    {downloadType === 1 ? (
                      <DraganddropMove
                        fileData={fileData}
                        setFileData={setFileData}
                        onDataChange={() => setChangesMade(true)}
                        download={download}
                      />
                    ) : (
                      <DisplayImages fileData={fileData} download={download} />
                    )}

                    <Dialog
                      open={downloadDialogOpen}
                      onClose={() => setDownloadDialogOpen(false)}
                    >
                      <DialogTitle className="border-b">
                        Download File
                      </DialogTitle>
                      <DialogContent>
                        <p className="pt-2 pb-10 pr-20">
                          Please preview before download?
                        </p>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => setDownloadDialogOpen(false)}
                          color="error"
                          variant="outlined"
                        >
                          Close
                        </Button>
                        <Button
                          onClick={handlePreviewClick}
                          color="primary"
                          variant="contained"
                        >
                          Preview
                        </Button>
                        {downloadLoader ? (
                          <div className="w-[64px] flex items-center justify-center">
                            <CircularProgress />
                          </div>
                        ) : (
                          <Button
                            onClick={handleDownloadClick}
                            color="success"
                            variant="contained"
                          >
                            Yes
                          </Button>
                        )}
                      </DialogActions>
                    </Dialog>
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

export default ReorderSection;
