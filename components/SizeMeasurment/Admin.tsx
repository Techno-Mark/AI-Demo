/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { CircularProgress, Box } from "@mui/material";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

  const downloadExcel = () => {
    const selectedData = data.map((row) => ({
      id: row.id,
      chestSize: row.chestSize,
      shoulderSize: row.shoulderSize,
      armLength: row.armLength,
      forearmSize: row.forearmSize,
      upperArmSize: row.upperArmSize,
      bicepSize: row.bicepSize,
      waistSize: row.waistSize,
      thighSize: row.thighSize,
      chestCM: row.chestCM,
      waistCM: row.waistCM,
      shoulderCM: row.shoulderCM,
      chestMeasure: row.chestMeasure,
      waistMeasure: row.waistMeasure,
      shoulderMeasure: row.shoulderMeasure,
      isSatisfied: row.isSatisfied,
      height: row.height,
      version: row.version,
    }));

    const worksheet = XLSX.utils.json_to_sheet(selectedData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "data.xlsx");
  };

  const fetchData = async (page: number, limit: number) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SIZE_MEASUREMENT}/measurementList`,
        {
          page: page + 1,
          limit,
          isSatisfied: false,
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
    { field: "chestSize", headerName: "Chest Size", width: 150 },
    { field: "shoulderSize", headerName: "Shoulder Size", width: 150 },
    // { field: "armLength", headerName: "Arm Length", width: 150 },
    // { field: "forearmSize", headerName: "Forearm Size", width: 150 },
    // { field: "upperArmSize", headerName: "Upper Arm Size", width: 150 },
    // { field: "bicepSize", headerName: "Bicep Size", width: 150 },
    { field: "waistSize", headerName: "Waist Size", width: 150 },
    // { field: "thighSize", headerName: "Thigh Size", width: 150 },
    { field: "chestCM", headerName: "Chest (CM)", width: 150 },
    { field: "waistCM", headerName: "Waist (CM)", width: 150 },
    { field: "shoulderCM", headerName: "Shoulder (CM)", width: 150 },
    { field: "chestMeasure", headerName: "Chest Measure", width: 150 },
    { field: "waistMeasure", headerName: "Waist Measure", width: 150 },
    { field: "shoulderMeasure", headerName: "Shoulder Measure", width: 150 },
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
