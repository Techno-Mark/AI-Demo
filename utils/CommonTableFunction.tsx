import { Tooltip } from "@mui/material";

export const generateCustomHeaderName = (headerName: string) => {
  return (
    <span style={{ fontWeight: "600", textTransform: "capitalize" }}>
      {headerName}
    </span>
  );
};

export const generateCustomColumn = (
  name: any,
  label: string,
  bodyRenderer: (arg0: any) => any
) => ({
  name,
  options: {
    filter: true,
    sort: true,
    customHeadLabelRender: () => generateCustomHeaderName(label),
    customBodyRender: (value: any) => bodyRenderer(value),
  },
});

export const generateCommonBodyRender = (bodyValue: any) => {
  const shortProcessName =
    bodyValue !== null &&
    bodyValue !== undefined &&
    bodyValue !== "" &&
    bodyValue !== "0" &&
    bodyValue.length > 20
      ? bodyValue.slice(0, 20)
      : bodyValue;

  return (
    <div className="ml-2">
      {!bodyValue ||
      bodyValue === "0" ||
      bodyValue === null ||
      bodyValue === "null" ? (
        "-"
      ) : bodyValue.length > 20 ? (
        <>
          <Tooltip title={bodyValue} placement="top">
            <span>{shortProcessName}</span>
          </Tooltip>
          <span>...</span>
        </>
      ) : (
        shortProcessName
      )}
    </div>
  );
};
