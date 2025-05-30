import { TextField, Switch } from "@mui/material";
import React, { useEffect, useState } from "react";

interface FitCheckYouProps {
  sex: number;
  setSex: (value: number) => void;
  height: number;
  heightErr: boolean;
  setHeight: (value: number) => void;
  setHeightErr: (value: boolean) => void;
  isHeightInInch: boolean;
  setIsHeightInInch: (value: boolean) => void;
  weight: number;
  weightErr: boolean;
  setWeight: (value: number) => void;
  setWeightErr: (value: boolean) => void;
}

const FitCheckYou: React.FC<FitCheckYouProps> = ({
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
}) => {
  const [isWeightInLb, setIsWeightInLb] = useState(false);
  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  const inchesToCm = (inch: number) => inch * 2.54;
  const lbToKg = (lb: number) => lb / 2.20462;

  // Keep input field blank if value is 0
  useEffect(() => {
    setHeightInput(height > 0 ? height.toString() : "");
  }, [height]);

  useEffect(() => {
    setWeightInput(weight > 0 ? weight.toString() : "");
  }, [weight]);

  const handleHeightSwitch = () => {
    setHeightInput("");
    setHeight(0);
    setIsHeightInInch(!isHeightInInch);
  };

  const handleWeightSwitch = () => {
    setWeightInput("");
    setWeight(0);
    setIsWeightInLb(!isWeightInLb);
  };

  const handleInputChange = (
    value: string,
    isInInchOrLb: boolean,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setValue: (value: number) => void,
    setError: (value: boolean) => void,
    conversionFn?: (value: number) => number
  ) => {
    const filteredValue = value.replace(/[^0-9.]/g, "");
    const parts = filteredValue.split(".");
    if (parts.length > 2) return;

    const regex = isInInchOrLb
      ? /^\d{0,2}(\.\d{0,2})?$/
      : /^\d{0,3}(\.\d{0,2})?$/;

    if (regex.test(filteredValue)) {
      setInput(filteredValue);
    }

    if (filteredValue === "") {
      setValue(0);
      return;
    }

    if (regex.test(filteredValue)) {
      const num = Number(filteredValue);
      const convertedValue = conversionFn ? conversionFn(num) : num;
      setValue(parseFloat(convertedValue.toFixed(2)));
      setError(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between md:max-w-[70%] lg:max-w-[50%] min-h-[60vh] md:min-h-[30vh]">
      <p className="md:text-lg lg:text-xl pb-6 md:py-4 md:pb-8 md:px-0 flex items-center justify-center text-center">
        To help us find your size, tell us if you’re<br className="md:hidden" /> shopping for male or female
        clothing.
      </p>

      <div className="flex items-center justify-center gap-10 md:hidden">
        {["Male", "Female"].map((label, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center gap-2 md:gap-5 md:text-2xl px-4 py-2 bg-white rounded-xl shadow-lg ${
              sex === index ? "border-[#6B7CF6] border-2" : ""
            }`}
            onClick={() => setSex(index)}
          >
            {label === "Male" ? (
              <img src="/male.png" alt={label} />
            ) : (
              <img src="/female.png" alt={label} />
            )}
            {/* <input
              type="radio"
              name="gender"
              value={label}
              checked={sex === index}
              onChange={() => setSex(index)}
              className="scale-125 accent-[#6B7CF6]"
            /> */}
            <p>{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
        <div className="hidden md:flex items-center justify-center gap-10">
          {["Male", "Female"].map((label, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center gap-2 md:gap-5 md:text-2xl min-w-[116px] px-4 py-2 bg-white rounded-xl shadow-lg ${
                sex === index ? "border-[#6B7CF6] border-2" : "border-white border-2"
              }`}
              onClick={() => setSex(index)}
            >
              {label === "Male" ? (
                <img src="/male.png" alt={label} />
              ) : (
                <img src="/female.png" alt={label} />
              )}
              {/* <input
                type="radio"
                name="gender"
                value={label}
                checked={sex === index}
                onChange={() => setSex(index)}
                className="scale-125 accent-[#6B7CF6] !-mb-2"
              /> */}
              <p>{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-[8%] md:gap-[4%] pt-6 pb-2 md:py-4">
          {/* Height Input */}
          <div className="flex items-center justify-center gap-2">
            <TextField
              label={`Height (${isHeightInInch ? "IN" : "CM"})`}
              type="text"
              value={heightInput}
              onFocus={(e) =>
                e.target.addEventListener("wheel", (e) => e.preventDefault(), {
                  passive: false,
                })
              }
              onChange={(e) =>
                handleInputChange(
                  e.target.value,
                  isHeightInInch,
                  setHeightInput,
                  setHeight,
                  setHeightErr,
                  isHeightInInch ? inchesToCm : undefined
                )
              }
              margin="normal"
              variant="standard"
              sx={{ width: 200, mx: 0.75 }}
              error={heightErr}
              helperText={heightErr ? "Enter a valid height." : " "}
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
          <div className="flex items-center justify-center gap-2">
            <TextField
              label={`Weight (${isWeightInLb ? "LB" : "KG"})`}
              type="text"
              value={weightInput}
              onFocus={(e) =>
                e.target.addEventListener("wheel", (e) => e.preventDefault(), {
                  passive: false,
                })
              }
              onChange={(e) =>
                handleInputChange(
                  e.target.value,
                  isWeightInLb,
                  setWeightInput,
                  setWeight,
                  setWeightErr,
                  isWeightInLb ? lbToKg : undefined
                )
              }
              margin="normal"
              variant="standard"
              sx={{ width: 200, mx: 0.75 }}
              className="!mt-0 md:mt-auto"
              error={weightErr}
              helperText={weightErr ? "Enter a valid weight." : " "}
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
      </div>
    </div>
  );
};

export default FitCheckYou;
