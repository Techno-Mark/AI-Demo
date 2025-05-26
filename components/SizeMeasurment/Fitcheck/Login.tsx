"use client";
import { useState } from "react";
import { TextField, Button } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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

const Auth = ({
  setLogin,
  setIsLoading,
  isRegister,
  setIsRegister,
  setIsLoginClicked,
}: any) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailInvalid =
      !regex.test(email) ||
      email.trim().length < 1 ||
      email.trim().length > 100;
    const isPasswordInvalid = password.trim().length < 1;

    setEmailError(isEmailInvalid);
    setPasswordError(isPasswordInvalid);

    if (isEmailInvalid || isPasswordInvalid) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SIZE_MEASUREMENT}/${
          isRegister ? "register" : "login"
        }`,
        { email, password }
      );
      const data = response.data;
      if (data.status === "success") {
        setLogin(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message, toastOptions);
        if (response.status === 201) setIsRegister(false);
        setIsLoading(true);
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (error) {
      toast.error("There is some error. Please try again later.", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center md:flex-row min-h-[88vh] h-full w-full">
      {/* <div className="hidden md:flex w-1/2 bg-white items-center justify-center">
        <img
          src="/login.png"
          alt="Body Scanner"
          className="max-h-[85%] -mt-2"
        />
      </div> */}

      <div className="mt-5 md:mt-0 md:w-1/2 bg-white flex flex-col justify-center md:items-center px-6 md:px-10">
        <h2 className="text-xl md:text-2xl font-bold text-[#6B7CF6] mb-2">
          Welcome to your personal sizing assistant.
        </h2>
        <p className="text-gray-600 mb-6 md:mb-4 lg:mb-8 md:text-xl">
          Scan your body and have fun shopping!
        </p>

        <form
          onSubmit={handleAuth}
          className="space-y-6 md:space-y-4 lg:space-y-8 max-w-lg md:min-w-[400px]"
          autoComplete="off"
        >
          <Button
            variant="contained"
            fullWidth
            className="rounded-md py-2 bg-[#6B7CF6] hover:bg-[#5a6adf]"
            onClick={() => {
              setIsLoginClicked(2);
              setLogin(null);
            }}
          >
            Get Started
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex-grow h-px bg-gray-300" />
            <div className="text-center text-gray-400 text-sm">OR</div>
            <div className="flex-grow h-px bg-gray-300" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Email Address
            </label>
            <TextField
              type="email"
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
              variant="outlined"
              size="small"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Password</label>
            <TextField
              type={showPassword ? "text" : "password"}
              fullWidth
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              onBlur={() => setPasswordError(password.trim().length < 1)}
              error={passwordError}
              helperText={passwordError ? "This is a required field." : ""}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <span
                    className="absolute right-3 top-[10px] cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </span>
                ),
              }}
            />
          </div>

          <Button
            type="submit"
            variant="outlined"
            fullWidth
            className={`rounded-md py-2 text-white ${
              loading
                ? "border-gray-400 hover:border-gray-400 !text-gray-600 cursor-not-allowed"
                : "border-[#6B7CF6] !text-[#6B7CF6] cursor-pointer"
            }`}
            disabled={loading}
          >
            {isRegister ? "Register" : "Login"}
          </Button>

          <div className="text-sm text-center">
            {isRegister ? "Already have an account?" : "Don't have an account?"}
            <span
              className="ml-1 text-[#6B7CF6] cursor-pointer"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Sign In" : "Register"}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
