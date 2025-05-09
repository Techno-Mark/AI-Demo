import { TextField, Switch } from "@mui/material";
import React, { useState } from "react";
import Female from "tsconfig.json/assets/icons/Female`";
import Male from "tsconfig.json/assets/icons/Male`";

const FitCheckYou = ({
  sex,
  setSex,
  height,
  heightErr,
  setHeight,
  setHeightErr,
  isHeightInInch,
  setIsHeightInInch,
  weight,
  weightErr,
  setWeight,
  setWeightErr,
}: any) => {
  const [isWeightInLb, setIsWeightInLb] = useState(false);

  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  const inchesToCm = (inch: number) => inch * 2.54;

  const lbToKg = (lb: number) => lb / 2.20462;

  // Keep inputs in sync when unit switch is toggled
  const handleHeightSwitch = () => {
    if (height) {
      setHeightInput("");
      setHeight(0);
    }
    setIsHeightInInch(!isHeightInInch);
  };

  const handleWeightSwitch = () => {
    if (weight) {
      setWeightInput("");
      setWeight(0);
    }
    setIsWeightInLb(!isWeightInLb);
  };

  return (
    <>
      <p className="md:text-lg lg:text-xl px-3 py-4 pb-8 md:px-0 flex items-center justify-center md:max-w-[70%] lg:max-w-[50%] text-center">
        To help us find your size, tell us if you’re shopping for male or female
        clothing.
      </p>

      <div className="flex items-center justify-center gap-10">
        {["Male", "Female"].map((i, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center gap-2 md:gap-5 md:text-2xl px-4 py-2 bg-white rounded-xl shadow-lg ${
              sex === index ? "border-[#6B7CF6] border-2" : ""
            }`}
            onClick={() => setSex(index)}
          >
            {i === "Male" ? <Male /> : <Female />}
            <p>{i}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center lg:gap-8 py-4">
        {/* Height Input */}
        <div className="flex items-end justify-center gap-2">
          <TextField
            label={`Height (${isHeightInInch ? "in" : "cm"})`}
            type="text"
            value={heightInput}
            onFocus={(e) =>
              e.target.addEventListener("wheel", (e) => e.preventDefault(), {
                passive: false,
              })
            }
            onChange={(e) => {
              const value = e.target.value;
              const filteredValue = value.replace(/[^0-9.]/g, "");
              const parts = filteredValue.split(".");
              if (parts.length > 2) return;

              const regex = isHeightInInch
                ? /^\d{0,2}(\.\d{0,2})?$/
                : /^\d{0,3}(\.\d{0,2})?$/;
              if (regex.test(filteredValue)) {
                setHeightInput(filteredValue);
              }

              if (filteredValue === "") return;
              if (regex.test(filteredValue)) {
                const num = Number(filteredValue);
                const cmVal = isHeightInInch ? inchesToCm(num) : num;
                setHeight(parseFloat(cmVal.toFixed(2)));
                setHeightErr(false);
              }
            }}
            margin="normal"
            variant="standard"
            sx={{ width: 200, mx: 0.75 }}
            error={heightErr}
            helperText={heightErr ? "Enter a valid height." : ""}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm">cm</span>
            <Switch
              checked={isHeightInInch}
              onChange={handleHeightSwitch}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#6B7CF6",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#6B7CF6",
                },
              }}
            />
            <span className="text-sm">in</span>
          </div>
        </div>

        {/* Weight Input */}
        <div className="flex items-end justify-center gap-2">
          <TextField
            label={`Weight (${isWeightInLb ? "lb" : "kg"})`}
            type="text"
            value={weightInput}
            onFocus={(e) =>
              e.target.addEventListener("wheel", (e) => e.preventDefault(), {
                passive: false,
              })
            }
            onChange={(e) => {
              const value = e.target.value;
              const filteredValue = value.replace(/[^0-9.]/g, "");
              const parts = filteredValue.split(".");
              if (parts.length > 2) return;

              const regex = /^\d{0,3}(\.\d{0,2})?$/;
              if (regex.test(filteredValue)) {
                setWeightInput(filteredValue);
              }

              if (filteredValue === "") return;

              if (regex.test(filteredValue)) {
                const num = Number(filteredValue);
                const kgVal = isWeightInLb ? lbToKg(num) : num;
                setWeight(parseFloat(kgVal.toFixed(2)));
                setWeightErr(false);
              }
            }}
            margin="normal"
            variant="standard"
            sx={{ width: 200, mx: 0.75 }}
            error={weightErr}
            helperText={weightErr ? "Enter a valid weight." : ""}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm">kg</span>
            <Switch
              checked={isWeightInLb}
              onChange={handleWeightSwitch}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#6B7CF6",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#6B7CF6",
                },
              }}
            />
            <span className="text-sm">lb</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default FitCheckYou;
