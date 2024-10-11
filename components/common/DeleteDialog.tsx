import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { IconButton, Tooltip, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick: () => void;
  Title: string;
  firstContent: string;
  secondContent: string;
}

const DeleteDialog = ({
  isOpen,
  onClose,
  onActionClick,
  Title,
  firstContent,
  secondContent,
}: DeleteModalProps) => {
  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <div className="flex flex-row justify-between items-center">
            <span>{Title}</span>
            <Tooltip title="Close" placement="top" arrow>
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            className="border-y border-y-lightSilver w-full p-4"
          >
            <Typography className="pb-2 text-darkCharcoal">
              {firstContent ? firstContent : ""}
            </Typography>
            <Typography className="text-darkCharcoal">
              {secondContent ? secondContent : ""}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="mb-2">
          <Button
            className="border-defaultRed"
            onClick={onClose}
            variant="outlined"
            color="error"
          >
            No, cancel
          </Button>
          <Button
            className="!bg-[#1565C0]"
            onClick={() => {
              onActionClick();
              onClose();
            }}
            autoFocus
            variant="contained"
          >
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeleteDialog;
