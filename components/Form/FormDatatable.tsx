import React, { useState } from "react";
import Loader from "../common/Loader";
import { TablePagination, ThemeProvider, Tooltip } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { Delete, Edit } from "@mui/icons-material";
import DeleteDialog from "../common/DeleteDialog";
import { toast } from "react-toastify";
import { getMuiTheme } from "tsconfig.json/utils/CommonStyle`";
import {
  generateCommonBodyRender,
  generateCustomColumn,
  generateCustomHeaderName,
} from "tsconfig.json/utils/CommonTableFunction`";
import axios from "axios";

const pageNo = 1;
const pageSize = 10;

const initialFilter = {
  page: pageNo,
  limit: pageSize,
  search: "",
  formType: "",
};

interface Interface {
  page: number;
  limit: number;
  search: string;
  formType: string | null;
}

interface List {
  id: number;
  formType: string;
  fullName: string;
  email: string;
  phone: number | string;
  organizationName: string;
  projectDescription: string | null;
  date: string;
}

const FormDatatable = ({
  loaded,
  data,
  getData,
  setOpenDrawer,
  setEditId,
}: any) => {
  const [filteredObject, setFilteredOject] = useState<Interface>(initialFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [tableDataCount, setTableDataCount] = useState(
    !!data ? data.length : 0
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(0);

  const columnConfig = [
    // {
    //   name: "id",
    //   label: "ID",
    //   bodyRenderer: generateCommonBodyRender,
    // },
    {
      name: "cpatype",
      label: "Software Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "bookmark",
      label: "Form Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "strings",
      label: "Field Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "colour",
      label: "Highlight Color",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "comments",
      label: "Comments",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "id",
      label: "Action",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const generateConditionalColumn = (column: {
    name: string;
    label: string;
    bodyRenderer: (arg0: any) => any;
  }) => {
    if (column.label === "Action") {
      return {
        name: "id",
        options: {
          filter: true,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Action"),
          customBodyRender: (value: number) => {
            return (
              <div className="flex items-center justify-start gap-4">
                <div
                  onClick={() => {
                    setOpenDrawer(true);
                    setEditId(value);
                  }}
                >
                  <Tooltip title={"Edit"} placement="top" arrow>
                    <Edit />
                  </Tooltip>
                </div>
                <div
                  onClick={() => {
                    setDeleteOpen(true);
                    setDeleteId(value);
                  }}
                >
                  <Tooltip title={"Delete"} placement="top" arrow>
                    <Delete />
                  </Tooltip>
                </div>
              </div>
            );
          },
        },
      };
    }
    if (column.label === "Highlight Color") {
      return {
        name: "colour",
        options: {
          filter: true,
          sort: true,
          customHeadLabelRender: () =>
            generateCustomHeaderName("Highlight Color"),
          customBodyRender: (value: string) => {
            return (
              <>
                {value ? (
                  <div
                    style={{
                      backgroundColor: value,
                      width: "30px",
                      height: "30px",
                      border: `2px solid ${value}`,
                      borderRadius: "5px",
                      margin: "10px 10px 10px 10px",
                    }}
                  ></div>
                ) : (
                  "-"
                )}
              </>
            );
          },
        },
      };
    } else {
      return generateCustomColumn(
        column.name,
        column.label,
        column.bodyRenderer
      );
    }
  };

  const formCols = columnConfig.map((col: any) => {
    return generateConditionalColumn(col);
  });

  const handlePageChangeWithFilter = (
    newPage: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    setFilteredObject: React.Dispatch<React.SetStateAction<any>>
  ) => {
    setPage(newPage);
    setFilteredObject((prevState: any) => ({
      ...prevState,
      page: newPage + 1,
    }));
  };

  const handleChangeRowsPerPageWithFilter = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setRowsPerPage: React.Dispatch<React.SetStateAction<number>>,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    setFilteredObject: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const pageSize = parseInt(event.target.value);

    setRowsPerPage(pageSize);
    setPage(0);
    setFilteredObject((prevState: any) => ({
      ...prevState,
      page: 1,
      limit: pageSize,
    }));
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
  };

  const deleteData = async () => {
    try {
      let response = await axios.get(
        `https://pythonapi.pacificabs.com:5001/delete/${deleteId}`
      );
      if (response.status === 200) {
        toast.success("Record has been deleted successfully.");
        getData();
        setDeleteOpen(false);
      } else {
        setDeleteOpen(false);
        getData();
        toast.error("Please try again later.");
      }
    } catch (error: any) {
      setDeleteOpen(false);
      getData();
      toast.error("Please try again later.");
    }
  };

  return (
    <>
      {loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={data}
            columns={formCols}
            title={undefined}
            options={{
              filterType: "checkbox",
              responsive: "standard",
              tableBodyHeight: "75vh",
              viewColumns: false,
              filter: false,
              print: false,
              download: false,
              search: false,
              pagination: false,
              selectToolbarPlacement: "none",
              draggableColumns: {
                enabled: true,
                transitionTime: 300,
              },
              elevation: 0,
              selectableRows: "none",
              textLabels: {
                body: {
                  noMatch: (
                    <div className="flex items-start">
                      <span>Currently there is no record found.</span>
                    </div>
                  ),
                  toolTip: "",
                },
              },
            }}
            data-tableid="unassignee_Datatable"
          />
          {/* <TablePagination
            component="div"
            count={tableDataCount}
            page={page}
            onPageChange={(
              event: React.MouseEvent<HTMLButtonElement> | null,
              newPage: number
            ) => {
              handlePageChangeWithFilter(newPage, setPage, setFilteredOject);
            }}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => {
              handleChangeRowsPerPageWithFilter(
                event,
                setRowsPerPage,
                setPage,
                setFilteredOject
              );
            }}
          /> */}
        </ThemeProvider>
      ) : (
        <Loader />
      )}
      <DeleteDialog
        isOpen={deleteOpen}
        onClose={closeDeleteModal}
        onActionClick={() => {
          deleteData();
        }}
        Title={"Delete Data"}
        firstContent={"Are you sure you want to delete this record?"}
        secondContent={""}
      />
    </>
  );
};

export default FormDatatable;
