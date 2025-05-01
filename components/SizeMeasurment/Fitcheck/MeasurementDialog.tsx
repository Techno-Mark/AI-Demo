import { DialogContent, DialogActions, Button, TextField } from "@mui/material";

const measurementsList = [
  "chestSize",
  "waistSize",
  "shoulderSize",
  "armLength",
  "forearmSize",
  "upperarmSize",
  "bicepSize",
  "neckSize",
  "thighSize",
  "hipSize",
  "legSize",
  "kneeSize",
  "calfSize",
  "upperbodySize",
  "lowerbodySize",
] as const;
type MeasurementKey = (typeof measurementsList)[number];

const MeasurementDialog = ({
  measurementDialog,
  setMeasurementDialog,
  errors,
  setErrors,
  handleClickSatisfied,
  handleCloseMeasurementData,
}: any) => {
  const handleChange = (key: MeasurementKey, value: string) => {
    if (/^\d*$/.test(value) && value.length <= 3) {
      setMeasurementDialog((prev: any) => ({ ...prev, [key]: Number(value) }));
      setErrors((prev: any) => ({ ...prev, [key]: false }));
    }
  };

  const handleBlur = (key: MeasurementKey, value: string) => {
    setErrors((prev: any) => ({
      ...prev,
      [key]: !value || Number(value) < 2 || value.length > 3,
    }));
  };

  const isInvalid = (key: MeasurementKey) => {
    const value = measurementDialog[key]
      ? measurementDialog[key].toString()
      : "";
    return (
      errors[key] ||
      measurementDialog[key] === 0 ||
      value.length < 2 ||
      value.length > 3
    );
  };

  return (
    <>
      <DialogContent className="grid grid-cols-2 lg:grid-cols-3 gap-5">
        {measurementsList.map((key) => (
          <TextField
            key={key}
            label={`${key
              .replace(/([A-Z])/g, " $1")
              .replace(/^\w/, (c) => c.toUpperCase())}`}
            className="pt-1"
            value={measurementDialog[key] === 0 ? "" : measurementDialog[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            margin="normal"
            variant="standard"
            onBlur={(e) => handleBlur(key, e.target.value)}
            error={errors[key]}
            helperText={
              errors[key]
                ? measurementDialog[key]?.toString().length > 3
                  ? "Maximum 3 digits allowed."
                  : "Enter a valid size."
                : ""
            }
          />
        ))}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => handleClickSatisfied(false, true)}
          variant="contained"
          className={`${
            measurementsList.some(isInvalid)
              ? " bg-gray-500 cursor-not-allowed"
              : "!bg-[#6B7CF6] hover:bg-[#6B7CF6] cursor-pointer"
          }`}
          disabled={measurementsList.some(isInvalid)}
        >
          Save
        </Button>
        <Button
          onClick={handleCloseMeasurementData}
          variant="outlined"
          color="error"
        >
          Close
        </Button>
      </DialogActions>
    </>
  );
};

export default MeasurementDialog;
