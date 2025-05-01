import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { toast, ToastOptions } from "react-toastify";

const measurementLabels: { [key: string]: string } = {
  chestSize: "Chest",
  waistSize: "Waist",
  shoulderSize: "Shoulder",
  armLength: "Arm Length",
  bicepSize: "Bicep",
  forearmSize: "Forearm",
  upperArmSize: "Upper Arm",
  neckSize: "Neck",
  hipSize: "Hip",
  legSize: "Leg",
  thighSize: "Thigh",
  upperBodySize: "Upper Body",
  lowerBodySize: "Lower Body",
  kneeSize: "Knee",
  calfSize: "Calf",
};

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

const UserData = ({
  userData,
  setUserData,
  productPart,
  productName,
  measurementMatrix,
  setLogin,
  getUserData,
}: {
  userData: Record<string, number>;
  setUserData: any;
  productPart: string;
  productName: string;
  measurementMatrix: any;
  setLogin: any;
  getUserData: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<{
    [key: string]: string | number;
  }>(userData);

  const handleChange = (key: string, value: string) => {
    if (/^\d{0,3}(\.\d{0,2})?$/.test(value)) {
      setEditedData((prev) => ({
        ...prev,
        [key]: value, // Update editedData instead of userData
      }));
    }
  };

  const handleSave = async () => {
    setIsEditing(false);

    const token = localStorage.getItem("token");
    const params = {
      chestMeasure: !!editedData.chestSize
        ? Number(editedData.chestSize)
        : userData.chestSize,
      waistMeasure: !!editedData.waistSize
        ? Number(editedData.waistSize)
        : userData.waistSize,
      shoulderMeasure: !!editedData.shoulderSize
        ? Number(editedData.shoulderSize)
        : userData.shoulderSize,
      armMeasure: !!editedData.armLength
        ? Number(editedData.armLength)
        : userData.armLength,
      forearmMeasure: !!editedData.forearmSize
        ? Number(editedData.forearmSize)
        : userData.forearmSize,
      upperarmMeasure: !!editedData.upperArmSize
        ? Number(editedData.upperArmSize)
        : userData.upperArmSize,
      bicepMeasure: !!editedData.bicepSize
        ? Number(editedData.bicepSize)
        : userData.bicepSize,
      neckMeasure: !!editedData.neckSize
        ? Number(editedData.neckSize)
        : userData.neckSize,
      thighMeasure: !!editedData.thighSize
        ? Number(editedData.thighSize)
        : userData.thighSize,
      hipMeasure: !!editedData.hipSize
        ? Number(editedData.hipSize)
        : userData.hipSize,
      legMeasure: !!editedData.legSize
        ? Number(editedData.legSize)
        : userData.legSize,
      kneeMeasure: !!editedData.kneeSize
        ? Number(editedData.kneeSize)
        : userData.kneeSize,
      calfMeasure: !!editedData.calfSize
        ? Number(editedData.calfSize)
        : userData.calfSize,
      upperbodyMeasure: !!editedData.upperBodySize
        ? Number(editedData.upperBodySize)
        : userData.upperBodySize,
      lowerbodyMeasure: !!editedData.lowerBodySize
        ? Number(editedData.lowerBodySize)
        : userData.lowerBodySize,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SIZE_MEASUREMENT}/updateUserData`,
        params,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.data.status.toLowerCase() == "success") {
        toast.success("Thank you for sharing your measurement!", toastOptions);
        getUserData();
      } else {
        getUserData();
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          toast.error("Unauthorized! Please log in again.", toastOptions);
          localStorage.removeItem("token");
          setLogin("");
        } else {
          toast.error(
            `Error: ${error.response.data.message || "Something went wrong!"}`,
            toastOptions
          );
        }
      } else {
        toast.error(
          "There is some error. Please try again later.",
          toastOptions
        );
      }
    }
  };

  const filteredEntries = Object.entries(editedData || {}).filter(
    ([key]) => key in measurementLabels
  );
  const measurementEntries = Object.entries(measurementLabels);
  const firstHalf = measurementEntries.slice(0, 8);
  const secondHalf = measurementEntries.slice(8, 16);

  const estimateTShirtSize = (chestInCM: number) => {
    const sizeChart = !!measurementMatrix
      ? measurementMatrix
      : [
          { min: 0, max: 87.99, size: "Check kids section" },
          { min: 88, max: 91.99, size: "Small (S)" },
          { min: 92, max: 95.99, size: "Medium (M)" },
          { min: 96, max: 99.99, size: "Large (L)" },
          { min: 100, max: 103.99, size: "XL" },
          { min: 104, max: 107.99, size: "XXL" },
          { min: 108, max: null, size: "Too large size not available" },
        ];

    const size = sizeChart.find(
      ({ min, max }: { min: number; max: number }) =>
        chestInCM >= min && (max === null || chestInCM < max)
    );

    return size ? size.size : "Size not found";
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-5 pb-5">
      <div className="flex items-center justify-center w-full mx-10">
        <p className="font-bold">
          As per Fitcheck, your {productName} size is{" "}
          {estimateTShirtSize(
            Number(
              (productPart === "top"
                ? userData.chestSize
                : userData.waistSize
              ).toFixed(2)
            )
          )}
          .
        </p>
      </div>
      <div className="flex flex-col md:flex-row items-start justify-between w-full gap-4 p-4">
        {/* Product Size Matrix */}
        <div className="w-full md:w-[40%] flex-shrink-0">
          <p className="font-bold text-left md:mb-7">Product Size Matrix</p>
          <TableContainer component={Paper} className="w-full">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Size</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>CM</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(!!measurementMatrix && measurementMatrix.length > 0
                  ? measurementMatrix
                  : [
                      { min: 0, max: 87.99, size: "Check kids section" },
                      { min: 88, max: 91.99, size: "Small (S)" },
                      { min: 92, max: 95.99, size: "Medium (M)" },
                      { min: 96, max: 99.99, size: "Large (L)" },
                      { min: 100, max: 103.99, size: "XL" },
                      { min: 104, max: 107.99, size: "XXL" },
                      {
                        min: 108,
                        max: null,
                        size: "Too large size not available",
                      },
                    ]
                ).map(
                  (
                    i: { min: number; max: number; size: string },
                    index: number
                  ) => (
                    <TableRow key={index}>
                      <TableCell>{i.size}</TableCell>
                      <TableCell align="center">{`${i.min} - ${i.max}`}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Fitcheck Size Matrix */}
        <div className="w-full md:w-[60%] flex flex-col">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <p className="font-bold my-4">Fitcheck Size Matrix</p>
            <div className="flex items-center justify-end w-full md:w-auto gap-4">
              <Button
                variant="contained"
                onClick={() => setIsEditing(!isEditing)}
                className="!bg-[#6B7CF6]"
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
              {isEditing && (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  className="!bg-[#388e3c]"
                >
                  Save
                </Button>
              )}
              <Button
                variant="contained"
                onClick={() => setUserData(null)}
                className="!bg-[#6B7CF6]"
              >
                Re Check
              </Button>
            </div>
          </div>

          {/* Table for Mobile */}
          <div className="block md:hidden mt-4">
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Measurement</b>
                    </TableCell>
                    <TableCell align="center">
                      <b>Size (cm)</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(measurementLabels).map(([key, label]) => {
                    const entry = filteredEntries.find(
                      ([entryKey]) => entryKey === key
                    );
                    const value = entry ? entry[1] : "-"; // Show "-" if no value is found

                    return (
                      <TableRow key={key}>
                        <TableCell>{label}</TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <TextField
                              value={value}
                              onChange={(e) =>
                                handleChange(key, e.target.value)
                              }
                              size="small"
                            />
                          ) : (
                            value
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Table for Desktop */}
          <div className="hidden md:grid md:grid-cols-2 gap-4 mt-4">
            {[firstHalf, secondHalf].map((data, index) => (
              <TableContainer key={index} component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <b>Measurement</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Size (cm)</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map(([key, label]) => (
                      <TableRow key={key}>
                        <TableCell>{label}</TableCell>
                        <TableCell align="center">
                          {isEditing ? (
                            <TextField
                              value={editedData[key] || ""}
                              onChange={(e) =>
                                handleChange(key, e.target.value)
                              }
                              size="small"
                            />
                          ) : (
                            userData[key] || "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserData;
