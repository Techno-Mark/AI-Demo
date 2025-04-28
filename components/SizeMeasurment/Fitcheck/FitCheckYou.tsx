import { TextField } from "@mui/material";
import React from "react";
import Female from "tsconfig.json/assets/icons/Female`";
import Male from "tsconfig.json/assets/icons/Male`";

const FitCheckYou = ({
  sex,
  setSex,
  height,
  heightErr,
  setHeight,
  setHeightErr,
  weight,
  weightErr,
  setWeight,
  setWeightErr,
}: any) => {
  return (
    <>
      <p className="md:text-lg lg:text-xl px-3 py-2 md:px-0 flex items-center justify-center md:max-w-[70%] lg:max-w-[50%] text-center">
        {/* Tell us about yourself, so that we can recommend the best size for you
        Are you interested in buying men’s or women’s clothing? */}
        To help us find your size, tell us if you’re shopping for male or female
        clothing
      </p>
      <div className="flex items-center justify-center gap-10">
        {["Male", "Female"].map((i, index) => (
          <div
            className={`flex flex-col items-center justify-center gap-2 md:gap-5 md:text-2xl px-4 py-2 bg-white rounded-xl shadow-lg ${
              sex === index ? "border-[#6B7CF6] border-2" : ""
            }`}
            key={index}
            onClick={() => setSex(index)}
          >
            {i === "Male" ? <Male /> : <Female />}
            <p>{i}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center md:gap-5">
        <TextField
          label="Height (In CM)"
          type="text"
          onFocus={(e) =>
            e.target.addEventListener(
              "wheel",
              function (e) {
                e.preventDefault();
              },
              { passive: false }
            )
          }
          value={height === 0 ? "" : height}
          onChange={(e) => {
            const value = e.target.value;

            // Only allow numbers and dot
            const filteredValue = value.replace(/[^0-9.]/g, "");

            // Ensure only one dot
            const parts = filteredValue.split(".");
            if (parts.length > 2) {
              return;
            }

            // Optional: Limit to 3 digits before dot and 2 digits after dot
            const regex = /^\d{0,3}(\.\d{0,2})?$/;
            if (regex.test(filteredValue)) {
              setHeight(filteredValue);
              setHeightErr(false);
            }
          }}
          margin="normal"
          variant="standard"
          sx={{
            width: 200,
            mx: 0.75,
          }}
          onBlur={(e) => {
            const value = e.target.value;
            if (!value || Number(value) < 2) {
              setHeightErr(true);
            } else {
              setHeightErr(false);
            }
          }}
          error={heightErr}
          helperText={heightErr ? "Enter a valid height in cm." : ""}
        />

        <TextField
          label="Weight (In KG)"
          type="text"
          onFocus={(e) =>
            e.target.addEventListener(
              "wheel",
              function (e) {
                e.preventDefault();
              },
              { passive: false }
            )
          }
          value={weight === 0 ? "" : weight}
          onChange={(e) => {
            const value = e.target.value;

            // Only allow numbers and dot
            const filteredValue = value.replace(/[^0-9.]/g, "");

            // Ensure only one dot
            const parts = filteredValue.split(".");
            if (parts.length > 2) {
              return;
            }

            // Optional: Limit to 3 digits before dot and 2 digits after dot
            const regex = /^\d{0,3}(\.\d{0,2})?$/;
            if (regex.test(filteredValue)) {
              setWeight(filteredValue);
              setWeightErr(false);
            }
          }}
          margin="normal"
          variant="standard"
          sx={{
            width: 200,
            mx: 0.75,
          }}
          onBlur={(e) => {
            const value = e.target.value;
            if (!value || Number(value) < 1) {
              setWeightErr(true);
            } else {
              setWeightErr(false);
            }
          }}
          error={weightErr}
          helperText={weightErr ? "Enter a valid weight in KG." : ""}
        />
      </div>
    </>
  );
};

export default FitCheckYou;
