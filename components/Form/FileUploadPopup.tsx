import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const FileUploadPopup = () => {
  const [openPopup, setOpenPopup] = useState(false);

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Selected file:", files[0].name); // You can handle file upload logic here
    }
  };

  // Function to open the file input dialog
  const triggerFileInput = () => {
    const inputElement = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleUpload = (buttonIndex: number) => {
    console.log(`Button ${buttonIndex} clicked!`);
    triggerFileInput(); // Open file input when button is clicked
  };

  return (
    <>
      {/* File Input (Hidden) */}
      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }} // Hide the input
      />

      {/* Button to open popup */}
      <Button
        variant="contained"
        onClick={() => setOpenPopup(true)}
        className="rounded-[4px] !h-[36px] !bg-[#1565C0]"
      >
        Upload File
      </Button>

      {/* Popup with Buttons */}
      <Dialog
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Choose an Option to Upload</DialogTitle>
        <DialogContent>
          {/* Display 4 buttons */}
          <div className="flex flex-col gap-4 items-center">
            {[1, 2, 3, 4].map((buttonIndex) => (
              <Button
                key={buttonIndex}
                variant="contained"
                color="primary"
                onClick={() => handleUpload(buttonIndex)}
              >
                Upload Option {buttonIndex}
              </Button>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPopup(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileUploadPopup;
