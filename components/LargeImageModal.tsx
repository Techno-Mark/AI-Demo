/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import {
  FormControl,
  InputLabel,
  DialogActions,
  DialogTitle,
} from "@mui/material";

interface LargeImageModalProps {
  open: boolean;
  src: string;
  onClose: () => void;
  bookmarks?: string[];
  onMove?: (selectedBookmark: string) => void;
  onDelete?: () => void;
  download: boolean;
}

const LargeImageModal: React.FC<LargeImageModalProps> = ({
  open,
  src,
  onClose,
  bookmarks,
  onMove,
  onDelete,
  download,
}) => {
  const [selectedBookmark, setSelectedBookmark] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMove = () => {
    onMove?.(selectedBookmark);
    setSelectedBookmark("");
    onClose();
  };

  const handleClose = () => {
    setSelectedBookmark("");
    onClose();
  };

  const handleDelete = () => {
    onDelete?.();
    setDeleteDialogOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
            overflow: "hidden",
          }}
        >
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            sx={{ position: "absolute", top: 8, right: 20 }}
          >
            <CloseIcon />
          </IconButton>
          <div className="h-[95vh] py-8 gap-8 flex flex-col items-center justify-between">
            <img
              src={
                `${
                  download
                    ? "https://pythonapi.pacificabs.com:5000/"
                    : "https://pythonapi.pacificabs.com:5001/"
                }` + src
              }
              alt="Large view"
              style={{
                maxWidth: "100%",
                maxHeight: `${!!bookmarks ? "75vh" : "90vh"}`,
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
            {!!bookmarks && (
              <div className="flex items-end justify-center w-full gap-20">
                <div className="flex items-end justify-center">
                  <FormControl variant="standard" sx={{ mx: 0.75, width: 210 }}>
                    <InputLabel id="demo-simple-select-standard-label">
                      Move To
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select-standard"
                      value={selectedBookmark}
                      onChange={(e) => {
                        setSelectedBookmark(e.target.value);
                      }}
                    >
                      {bookmarks?.map((i: any, index: number) => (
                        <MenuItem value={i} key={index}>
                          {i}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    type="button"
                    variant="contained"
                    className="rounded-[4px] !h-full !mx-2 mt-2 cursor-pointer"
                    onClick={handleMove}
                    disabled={!selectedBookmark}
                  >
                    Move
                  </Button>
                </div>
                {/* <Button
                variant="outlined"
                className="rounded-[4px] !h-[36px]"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <span className="flex items-center justify-center gap-[10px] px-[5px]">
                  Delete
                </span>
              </Button> */}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle className="border-b">Delete Confirmation</DialogTitle>
        <DialogContent>
          <p className="pt-2 pb-10 pr-20">
            Are you sure you want to delete this page?
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="error"
            variant="outlined"
          >
            Close
          </Button>
          <Button onClick={handleDelete} color="primary" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LargeImageModal;
