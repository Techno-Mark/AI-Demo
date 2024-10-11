/* eslint-disable react-hooks/rules-of-hooks */
import { Add, Download, Upload } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DrawerOverlay from "tsconfig.json/components/common/DrawerOverlay`";
import MainWrapper from "tsconfig.json/components/common/MainWrapper`";
import FormDatatable from "tsconfig.json/components/Form/FormDatatable`";
import FormDrawer from "tsconfig.json/components/Form/FormDrawer`";

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

const setting = () => {
  const router = useRouter();
  const [loaded, setLoaded] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editId, setEditId] = useState(0);
  const [data, setData] = useState<any>([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [selected, setSelected] = useState("");

  const getData = async () => {
    setLoaded(false);
    try {
      let response = await axios.get(
        `https://pythonapi.pacificabs.com:5001/bookmarks`
      );
      if (response.status === 200) {
        setData(response.data);
        setLoaded(true);
      } else {
        setData([]);
        setLoaded(true);
      }
    } catch (error: any) {
      setLoaded(true);
      setData([]);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setEditId(0);
    setOpenDrawer(false);
  };

  const handleDownload = () => {
    const fileUrl = "/sample-file.pdf";
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "sample-file.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerFileInput = () => {
    const inputElement = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleUpload = () => {
    setOpenPopup(true);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (
        file.name.endsWith(".csv") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsx")
      ) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("cpa_type", selected);

          let response = await axios.post(
            `https://pythonapi.pacificabs.com:5001/bulk_upload`,
            formData
          );
          if (response.status === 200) {
            if (response.data.success) {
              toast.success(response.data.message);
            } else {
              toast.error(response.data.error);
            }
          }
          getData();
          handlePopupClose();
        } catch (error: any) {
          getData();
          handlePopupClose();
        }
      } else {
        console.error("Only CSV and Excel files are allowed.");
      }
    }
  };

  const handlePopupClose = () => {
    setOpenPopup(false);
    setSelected("");
  };

  return (
    <MainWrapper>
      <input
        id="file-upload"
        type="file"
        accept=".csv, .xls, .xlsx"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div className="bg-white flex justify-end items-center px-[20px] py-4 gap-5">
        <div className="flex gap-[20px] items-center justify-center">
          <Button
            type="submit"
            variant="contained"
            className="rounded-[4px] !h-[36px] !bg-[#594b25]"
            onClick={handleDownload}
          >
            <span className="flex items-center justify-center gap-[10px] px-[5px]">
              <span>
                <Download />
              </span>
              <span>Sample File</span>
            </span>
          </Button>
        </div>
        <div className="flex gap-[20px] items-center justify-center">
          <Button
            type="submit"
            variant="contained"
            className="rounded-[4px] !h-[36px] !bg-[#435925]"
            onClick={handleUpload}
          >
            <span className="flex items-center justify-center gap-[10px] px-[5px]">
              <span>
                <Upload />
              </span>
              <span>Bulk Upload</span>
            </span>
          </Button>
        </div>
        <div className="flex gap-[20px] items-center justify-center">
          <Button
            type="submit"
            variant="contained"
            className="rounded-[4px] !h-[36px] !bg-[#1565C0]"
            onClick={handleDrawerOpen}
          >
            <span className="flex items-center justify-center gap-[10px] px-[5px]">
              <span>
                <Add />
              </span>
              <span>Add Rule</span>
            </span>
          </Button>
        </div>
      </div>

      {/* Popup Dialog for File Upload */}
      <Dialog
        open={openPopup}
        onClose={handlePopupClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="mt-2 border-b">
          Choose an Option to Upload
        </DialogTitle>
        <DialogContent>
          <div className="flex items-center justify-start gap-5 my-10">
            {["Default", "UltraTax", "Pro-Conect", "Pro-Series"].map(
              (buttonIndex, index) => (
                <Button
                  key={index}
                  variant="contained"
                  className={`rounded-[4px] !h-[36px] ${
                    index === 0
                      ? "!bg-[#1565C0]"
                      : index === 1
                      ? "!bg-[#594b25]"
                      : index === 2
                      ? "!bg-[#435925]"
                      : "!bg-[#571131]"
                  }`}
                  onClick={() => {
                    triggerFileInput();
                    setSelected(buttonIndex);
                  }}
                >
                  {buttonIndex}
                </Button>
              )
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            className="rounded-[4px] mr-4 mb-4 !h-[36px] !text-defaultRed border-defaultRed hover:border-defaultRed"
            onClick={handlePopupClose}
          >
            <span className="flex items-center justify-center gap-[10px] px-[5px]">
              Close
            </span>
          </Button>
        </DialogActions>
      </Dialog>

      <FormDatatable
        loaded={loaded}
        data={data}
        getData={getData}
        setOpenDrawer={setOpenDrawer}
        setEditId={setEditId}
      />

      <FormDrawer
        onOpen={openDrawer}
        onClose={handleDrawerClose}
        editId={editId}
        getData={getData}
      />

      <DrawerOverlay isOpen={openDrawer} />

      <ToastContainer {...toastOptions} />
    </MainWrapper>
  );
};

export default setting;
