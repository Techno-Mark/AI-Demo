import { Close } from "@mui/icons-material";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loader from "../common/Loader";

interface LabelValue {
  label: string;
  value: string;
}

const FormDrawer = ({ onOpen, onClose, editId, getData }: any) => {
  const [loading, setLoading] = useState(false);
  const [formType, setFormType] = useState("");
  const [formTypeError, setFormTypeError] = useState(false);
  const [formDropdownData, setFormDropdownData] = useState([
    { label: "W-2", value: "W-2" },
    { label: "1099-INT", value: "1099-INT" },
    { label: "1099-OID", value: "1099-OID" },
    { label: "1099-DIV", value: "1099-DIV" },
    { label: "1099-R", value: "1099-R" },
    { label: "SSA-1099", value: "SSA-1099" },
    { label: "1099-B", value: "1099-B" },
    { label: "1099-S", value: "1099-S" },
    { label: "1099-G", value: "1099-G" },
    { label: "1099-NEC", value: "1099-NEC" },
    { label: "1099-K", value: "1099-K" },
    { label: "1099-MISC", value: "1099-MISC" },
    { label: "Schedule K-1-1065", value: "Schedule K-1-1065" },
    { label: "Schedule K-1-1120S", value: "Schedule K-1-1120S" },
    { label: "Schedule K-1-1041", value: "Schedule K-1-1041" },
    { label: "1099-PATR", value: "1099-PATR" },
    { label: "W2-G", value: "W2-G" },
    { label: "1099-C", value: "1099-C" },
    { label: "1099-SA", value: "1099-SA" },
    { label: "1099-QA", value: "1099-QA" },
    { label: "1099-Q", value: "1099-Q" },
    { label: "1099-LTC", value: "1099-LTC" },
    { label: "5498", value: "5498" },
    { label: "5498-SA", value: "5498-SA" },
    { label: "1098-E", value: "1098-E" },
    { label: "1098", value: "1098" },
    { label: "1098-T", value: "1098-T" },
    { label: "1095-A/B/C", value: "1095-A/B/C" },
    { label: "1040-ES", value: "1040-ES" },
    { label: "1099-HC", value: "1099-HC" },
    { label: "CRP", value: "CRP" },
  ]);
  const [cpaName, setCPAName] = useState("");
  const [cpaError, setCPAError] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldNameError, setFieldNameError] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedColorError, setSelectedColorError] = useState(false);
  const [comment, setComment] = useState("");

  const getById = async () => {
    try {
      let response = await axios.get(
        `https://pythonapi.pacificabs.com:5001/bookmark/${editId}`
      );
      if (response.status === 200) {
        setCPAName(response.data.cpatype);
        setFormType(response.data.bookmark);
        setFieldName(response.data.strings);
        setSelectedColor(response.data.colour);
        setComment(response.data.comments);
      } else {
        clearForm();
        toast.error("Please try again later.");
      }
    } catch (error: any) {
      toast.error("Please try again later.");
    }
  };

  useEffect(() => {
    if (editId > 0) {
      getById();
    } else {
      clearForm();
    }
  }, [editId]);

  const clearForm = () => {
    setCPAName("");
    setCPAError(false);
    setFormType("");
    setFormTypeError(false);
    setFieldName("");
    setFieldNameError(false);
    setSelectedColor("");
    setSelectedColorError(false);
    setComment("");
  };

  const validateForm = () => {
    let isValid = true;

    if (cpaName.trim().length === 0) {
      setCPAError(true);
      isValid = false;
    } else {
      setCPAError(false);
    }

    if (formType.trim().length === 0) {
      setFormTypeError(true);
      isValid = false;
    } else {
      setFormTypeError(false);
    }

    if (fieldName.trim().length === 0) {
      setFieldNameError(true);
      isValid = false;
    } else {
      setFieldNameError(false);
    }

    if (selectedColor.trim().length === 0) {
      setSelectedColorError(true);
      isValid = false;
    } else {
      setSelectedColorError(false);
    }

    return isValid;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      const formData = {
        cpatype: cpaName,
        bookmark: formType,
        strings: fieldName,
        colour: selectedColor,
        comments: comment,
      };
      const url =
        editId > 0
          ? `https://pythonapi.pacificabs.com:5001/update/${editId}`
          : `https://pythonapi.pacificabs.com:5001/bookmark`;

      try {
        let response = await axios.post(url, formData);
        if (response.status === 200 || response.status === 201) {
          setLoading(false);
          getData();
          toast.success(
            editId > 0
              ? "Rule updated successfully."
              : "Rule added successfully."
          );
        } else {
          setLoading(false);
          toast.error("Please try again later.");
        }
      } catch (error: any) {
        setLoading(false);
        toast.error("Please try again later.");
      }

      handleCloseDrawer();
    }
  };

  const handleCloseDrawer = () => {
    clearForm();
    onClose();
  };

  return (
    <>
      <div
        className={`fixed top-0 right-0 z-30 h-screen ${
          loading ? "overflow-y-hidden" : "overflow-y-auto"
        } w-[600px] border border-lightSilver bg-pureWhite transform  ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out bg-white`}
      >
        <div className="sticky top-0 !h-[9%] bg-whiteSmoke border-b z-30 border-lightSilver">
          <div className="flex p-[6px] h-full justify-between items-center">
            <span className="flex items-center justify-center font-bold ml-[10px]">
              {editId > 0 ? "Edit Rule" : "Add Rule"}
            </span>
            <Tooltip title="Close" placement="left" arrow>
              <IconButton className="mr-[10px]" onClick={handleCloseDrawer}>
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className={`!h-[91%]`}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between h-full pt-3 px-3"
          >
            <div>
              <FormControl
                variant="standard"
                sx={{ width: "98%" }}
                error={cpaError}
              >
                <InputLabel id="form-type-label">
                  Software Name
                  <span className="!text-defaultRed">&nbsp;*</span>
                </InputLabel>
                <Select
                  labelId="form-type-label"
                  id="form-type"
                  value={cpaName}
                  onChange={(e) => {
                    setCPAName(e.target.value);
                    setCPAError(false);
                  }}
                  onBlur={() => {
                    if (cpaName.trim().length > 0) {
                      setCPAError(false);
                    } else {
                      setCPAError(true);
                    }
                  }}
                >
                  <MenuItem value="Default">Default</MenuItem>
                  <MenuItem value="UltraTax">UltraTax</MenuItem>
                  <MenuItem value="Pro-Conect">Pro-Conect</MenuItem>
                  <MenuItem value="Pro-Series">Pro-Series</MenuItem>
                </Select>
                {cpaError && (
                  <FormHelperText>Software Name is required.</FormHelperText>
                )}
              </FormControl>
              <FormControl
                variant="standard"
                sx={{ marginTop: "16px", width: "98%" }}
                error={formTypeError}
              >
                <InputLabel id="form-type-label">
                  Form Name
                  <span className="!text-defaultRed">&nbsp;*</span>
                </InputLabel>
                <Select
                  labelId="form-type-label"
                  id="form-type"
                  value={formType}
                  onChange={(e) => {
                    setFormType(e.target.value);
                    setFormTypeError(false);
                  }}
                  onBlur={() => {
                    if (formType.trim().length > 0) {
                      setFormTypeError(false);
                    } else {
                      setFormTypeError(true);
                    }
                  }}
                >
                  {formDropdownData.map((i: LabelValue, index: number) => (
                    <MenuItem value={i.value} key={index}>
                      {i.label}
                    </MenuItem>
                  ))}
                </Select>
                {formTypeError && (
                  <FormHelperText>Form Name is required.</FormHelperText>
                )}
              </FormControl>
              <TextField
                label={
                  <span>
                    Field Name
                    <span className="!text-defaultRed">&nbsp;*</span>
                  </span>
                }
                fullWidth
                value={fieldName}
                onChange={(e) => {
                  setFieldName(e.target.value);
                  setFieldNameError(false);
                }}
                onBlur={() => {
                  if (fieldName.trim().length > 0) {
                    setFieldNameError(false);
                  } else {
                    setFieldNameError(true);
                  }
                }}
                margin="normal"
                variant="standard"
                sx={{ width: "98%" }}
                error={fieldNameError}
                helperText={fieldNameError ? "Field Name is required." : ""}
              />
              <div style={{ marginTop: "16px", width: "98%" }}>
                <FormLabel
                  component="legend"
                  className={selectedColorError ? "text-defaultRed" : ""}
                >
                  Highlight Color
                  <span className="!text-defaultRed">&nbsp;*</span>
                </FormLabel>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "start",
                    marginTop: "8px",
                    marginLeft: "10px",
                  }}
                >
                  {["#FF0000", "#00FF00", "#0000FF", "#FFFF00"].map((color) => (
                    <div
                      key={color}
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: color,
                        border: `2px solid ${
                          selectedColor === color ? "#000000" : color
                        }`,
                        cursor: "pointer",
                        borderRadius: "4px",
                        marginRight: "10px",
                      }}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedColorError(false);
                      }}
                    />
                  ))}
                </div>
                {selectedColorError && (
                  <FormHelperText error>
                    Highlight Color is required.
                  </FormHelperText>
                )}
              </div>
              <TextField
                label="Comment"
                fullWidth
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                }}
                margin="normal"
                variant="standard"
                sx={{ width: "98%" }}
              />
            </div>
            <div className="sticky bottom-0 !h-[9%] bg-whiteSmoke border-t z-30 border-lightSilver flex py-2 justify-end items-center">
              <div className="flex items-end justify-center">
                <Button
                  variant="outlined"
                  className="rounded-[4px] !h-[36px] !text-defaultRed border-defaultRed hover:border-defaultRed"
                  onClick={handleCloseDrawer}
                >
                  <span className="flex items-center justify-center gap-[10px] px-[5px]">
                    Close
                  </span>
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className="rounded-[4px] !h-[36px] !ml-6 !bg-[#1565C0]"
                >
                  <span className="flex items-center justify-center gap-[10px] px-[5px]">
                    {editId > 0 ? "Save Rule" : "Add Rule"}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        </div>
        {loading && <Loader />}
      </div>
    </>
  );
};

export default FormDrawer;
