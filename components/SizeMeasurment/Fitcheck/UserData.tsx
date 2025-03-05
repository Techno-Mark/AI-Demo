import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";

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

const UserData = ({
  userData,
  setUserData,
  productPart,
  productName,
  measurementMatrix,
}: {
  userData: Record<string, number>;
  setUserData: any;
  productPart: string;
  productName: string;
  measurementMatrix: any;
}) => {
  const filteredEntries = Object.entries(userData || {}).filter(
    ([key]) => key in measurementLabels
  );

  const chunkSize = 8;
  const firstHalf = filteredEntries.slice(0, chunkSize);
  const secondHalf = filteredEntries.slice(chunkSize);

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
    <div className="flex flex-col items-center justify-center gap-4 mt-5">
      <p className="px-10">
        As per Fitcheck Your {productName} size is&nbsp;
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
      <Button
        variant="contained"
        onClick={() => setUserData(null)}
        className={`my-4 !bg-[#1565c0] cursor-pointer`}
      >
        Re Check
      </Button>
      <div className="w-full">
        {/* Mobile View: Single Table */}
        <div className="block md:hidden">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Measurement</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Size (inches)</b>
                  </TableCell>
                  <TableCell align="center">
                    <b>Size (cm)</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEntries.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{measurementLabels[key]}</TableCell>
                    <TableCell align="center">{value}</TableCell>
                    <TableCell align="center">
                      {(value * 2.54).toFixed(2)} cm
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Large Screen: Two Tables */}
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          {[firstHalf, secondHalf].map((data, index) =>
            data.length > 0 ? (
              <TableContainer key={index} component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <b>Measurement</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Size (inches)</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Size (cm)</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{measurementLabels[key]}</TableCell>
                        <TableCell align="center">{value}</TableCell>
                        <TableCell align="center">
                          {(value * 2.54).toFixed(2)} cm
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default UserData;
