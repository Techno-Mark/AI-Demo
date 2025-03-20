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
}: // dob,
// dobErr,
// setDOB,
// setDOBErr,
any) => {
  return (
    <>
      <p className="md:text-lg lg:text-xl px-3 py-2 md:px-0 flex items-center justify-center md:max-w-[70%] lg:max-w-[50%] text-center">
        Tell us about yourself, so that we can recommend the best size for you
        Are you interested in buying men’s or women’s clothing?
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
          value={height === 0 ? null : height}
          onChange={(e) => {
            const value = e.target.value;
            const regex = /^\d{0,3}(\.\d{0,2})?$/;

            if (regex.test(value)) {
              setHeight(value);
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
          helperText={
            heightErr && height !== null && height.toString().trim().length < 2
              ? "Enter a valid height in cm."
              : ""
          }
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
          value={weight === 0 ? null : weight}
          onChange={(e) => {
            const value = e.target.value;
            const regex = /^\d{0,3}(\.\d{0,2})?$/;

            if (regex.test(value)) {
              setWeight(value);
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
          helperText={
            weightErr &&
            weight !== null &&
            (weight === 0 || weight.toString().trim().length < 1)
              ? "Enter a valid weight in KG."
              : ""
          }
        />
        {/* <TextField
          label="Year of Birth (YYYY)"
          onFocus={(e) =>
            e.target.addEventListener(
              "wheel",
              function (e) {
                e.preventDefault();
              },
              { passive: false }
            )
          }
          value={dob === 0 ? null : dob}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, "");
            if (value.length <= 4) {
              setDOB(Number(value));
              setDOBErr(false);
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
            if (!value || Number(value) < 4 || value.length > 4) {
              setDOBErr(true);
            } else {
              setDOBErr(false);
            }
          }}
          error={dobErr}
          helperText={
            dobErr &&
            dob !== null &&
            (dob === 0 || dob.toString().trim().length < 4)
              ? "Enter a valid Year in YYYY."
              : dobErr && dob !== null && dob.toString().length > 4
              ? "Maximum 4 digits allowed."
              : ""
          }
        /> */}
      </div>
    </>
  );
};

export default FitCheckYou;
