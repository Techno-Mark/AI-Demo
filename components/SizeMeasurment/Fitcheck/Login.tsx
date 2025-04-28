/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Spinner from "tsconfig.json/components/Spinner`";
import { toast, ToastOptions } from "react-toastify";
import axios from "axios";

const toastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

const Auth = ({ setLogin, setIsLoading, setIsLoginClicked, isRegister, setIsRegister }: any) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleAuth = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setEmailError(
      !regex.test(email) || email.trim().length < 1 || email.trim().length > 100
    );
    setPasswordError(password.trim().length < 1);

    if (emailError || passwordError) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SIZE_MEASUREMENT}/${
          isRegister ? "register" : "login"
        }`,
        { email: email, password: password }
      );
      const data = response.data;
      if (data.status === "success") {
        setLogin(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message, toastOptions);
        response.status == 201 && setIsRegister(false);
        setIsLoading(true);
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (error) {
      toast.error("There is some error. Please try again later.", toastOptions);
      throw error;
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col bg-white text-black h-[94vh]">
      <div
        className="flex items-start justify-start ml-2 cursor-pointer px-2 my-2 bg-blue-600 text-white rounded-lg w-fit"
        onClick={() => setIsLoginClicked(0)}
      >
        &lt;
      </div>
      <div className="flex flex-col justify-center items-center bg-white text-black h-[94vh]">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center font-normal p-20 rounded-xl lg:border border-lightSilver">
            <form
              className="text-start w-full max-w-3xl py-5 px-3 flex flex-col items-center justify-center"
              onSubmit={handleAuth}
            >
              <h2 className="text-xl font-semibold mb-5">
                {isRegister ? "Create an Account" : "Sign In"}
              </h2>

              {/* Email Field */}
              <div className="mb-4 w-[300px] lg:w-[356px]">
                <span className="text-gray-500 text-sm">
                  Email<span className="!text-defaultRed"> *</span>
                </span>
                <TextField
                  type="email"
                  sx={{ mt: "-3px" }}
                  fullWidth
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                  }}
                  onBlur={() =>
                    setEmailError(
                      !regex.test(email) ||
                        email.trim().length < 1 ||
                        email.trim().length > 100
                    )
                  }
                  error={emailError}
                  helperText={
                    emailError
                      ? email.length > 100
                        ? "Maximum 100 characters allowed."
                        : "Please enter a valid email."
                      : ""
                  }
                  margin="normal"
                  variant="standard"
                />
              </div>

              {/* Password Field */}
              <div className="mb-5 w-[300px] lg:w-[356px]">
                <span className="text-gray-500 text-sm">
                  Password<span className="!text-defaultRed"> *</span>
                </span>
                <TextField
                  type={showPassword ? "text" : "password"}
                  sx={{ mt: "-3px" }}
                  fullWidth
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  onBlur={() => setPasswordError(password.trim().length < 1)}
                  error={passwordError}
                  helperText={passwordError ? "This is a required field." : ""}
                  margin="normal"
                  variant="standard"
                  InputProps={{
                    endAdornment: (
                      <span
                        className="absolute top-1 right-2 text-slatyGrey cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <VisibilityOff className="text-[18px]" />
                        ) : (
                          <Visibility className="text-[18px]" />
                        )}
                      </span>
                    ),
                  }}
                />
              </div>

              {/* Submit Button */}

              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={`rounded-full !w-[300px] !font-semibold mt-[35px] ${
                  loading
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                    : "bg-[#1565C0] cursor-pointer"
                }`}
                disabled={loading}
              >
                {isRegister ? "REGISTER" : "SIGN IN"}
              </Button>

              {/* Toggle Between Login/Register */}
              <p className="mt-4 text-sm">
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <span
                  className="text-blue-600 cursor-pointer ml-1"
                  onClick={() => setIsRegister(!isRegister)}
                >
                  {isRegister ? "Sign In" : "Register"}
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
