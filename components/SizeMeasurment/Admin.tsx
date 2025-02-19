/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CircularProgress, Box } from "@mui/material";
import axios from "axios";
import Logo from "tsconfig.json/assets/icons/Logo`";

interface RowData {
  id: number;
  chestSize: number;
  shoulderSize: number;
  blob: string;
  armLength?: number;
  forearmSize?: number;
  upperArmSize?: number;
  bicepSize?: number;
  waistSize?: number;
  thighSize?: number;
  chestCM?: number;
  waistCM?: number;
  shoulderCM?: number;
  chestMeasure?: string;
  waistMeasure?: string;
  shoulderMeasure?: string;
  isSatisfied?: boolean;
  height?: number;
  version?: string;
  createdAt: string;
  updatedAt: string;
}

const Admin: React.FC = () => {
  const [data, setData] = useState<RowData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const downloadExcel = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SIZE_MEASUREMENT}/measurementList`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: 1,
            limit: 50000,
            isDownload: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Create a blob from response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a link element
      const a = document.createElement("a");
      a.href = url;
      a.download = "measurements.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Revoke the URL to free memory
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  const fetchData = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SIZE_MEASUREMENT}/measurementList`,
        {
          page: page + 1,
          limit,
          isSatisfied: null,
        }
      );

      const fetchedData = response.data.data.measurements;
      const totalCount = response.data.data.pagination.totalCount;

      setData(fetchedData);
      setTotalRows(totalCount);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "blob",
      headerName: "Image",
      width: 200,
      renderCell: (params) =>
        params.value ? (
          <img
            alt={`Image for ${params.row.id}`}
            src={`${params.value}`}
            className="w-full h-full object-contain"
          />
        ) : (
          "-"
        ),
    },
    { field: "chestSize", headerName: "Chest", width: 150 },
    { field: "shoulderSize", headerName: "Shoulder", width: 150 },
    { field: "waistSize", headerName: "Waist", width: 150 },
    { field: "armLength", headerName: "Arm Length", width: 150 },
    { field: "forearmSize", headerName: "Forearm", width: 150 },
    { field: "upperArmSize", headerName: "Upper Arm", width: 150 },
    { field: "bicepSize", headerName: "Bicep", width: 150 },
    { field: "neckSize", headerName: "Neck", width: 150 },
    { field: "thighSize", headerName: "Thigh", width: 150 },
    { field: "hipSize", headerName: "Hip", width: 150 },
    { field: "legSize", headerName: "Leg", width: 150 },
    { field: "kneeSize", headerName: "Knee", width: 150 },
    { field: "calfSize", headerName: "Calf", width: 150 },
    { field: "upperBodySize", headerName: "Upper Body", width: 150 },
    { field: "lowerBodySize", headerName: "Lower Body", width: 150 },
    { field: "chestMeasure", headerName: "Chest Measure", width: 150 },
    { field: "shoulderMeasure", headerName: "Shoulder Measure", width: 150 },
    { field: "waistMeasure", headerName: "Waist Measure", width: 150 },
    { field: "armMeasure", headerName: "Arm Length Measure", width: 150 },
    { field: "forearmMeasure", headerName: "Forearm Measure", width: 150 },
    { field: "upperarmMeasure", headerName: "Upper Arm Measure", width: 150 },
    { field: "bicepMeasure", headerName: "Bicep Measure", width: 150 },
    { field: "neckMeasure", headerName: "Neck Measure", width: 150 },
    { field: "thighMeasure", headerName: "Thigh Measure", width: 150 },
    { field: "hipMeasure", headerName: "Hip Measure", width: 150 },
    { field: "legMeasure", headerName: "Leg Measure", width: 150 },
    { field: "kneeMeasure", headerName: "Knee Measure", width: 150 },
    { field: "calfMeasure", headerName: "Calf Measure", width: 150 },
    { field: "upperbodyMeasure", headerName: "Upper Body Measure", width: 150 },
    { field: "lowerbodyMeasure", headerName: "Lower Body Measure", width: 150 },
    { field: "isSatisfied", headerName: "Is Satisfied", width: 150 },
    { field: "height", headerName: "Height", width: 150 },
    { field: "version", headerName: "Version", width: 150 },
    // { field: "createdAt", headerName: "Created At", width: 200 },
    // { field: "updatedAt", headerName: "Updated At", width: 200 },
  ];

  return (
    <Box p={3} className="bg-white text-black h-screen flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Logo />
        <button
          className="border rounded-lg px-3 py-2 hover:bg-gray-100 transition"
          onClick={downloadExcel}
        >
          Download
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <CircularProgress />
          </div>
        ) : (
          <DataGrid
            rows={data}
            columns={columns}
            pageSizeOptions={[10, 20, 50, 100]}
            paginationModel={{ pageSize, page: currentPage }}
            onPaginationModelChange={(model) => {
              setPageSize(model.pageSize);
              setCurrentPage(model.page);
            }}
            paginationMode="server"
            rowCount={totalRows}
            pagination
            getRowId={(row) => row.id}
            rowHeight={200}
          />
        )}
      </div>
    </Box>
  );
};

export default Admin;
