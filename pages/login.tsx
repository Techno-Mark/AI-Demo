/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, TextField } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Spinner from "tsconfig.json/components/Spinner`";
import { hasToken } from "tsconfig.json/utils/commonFunction`";
import Pabs from "tsconfig.json/assets/icons/Pabs`";

interface TokenList {
  Token: string;
  TokenExpiry: string;
  Username: string;
}
interface Token {
  TwoFactorEnabled: boolean;
  Token: TokenList;
}

const login = () => {
  const router = useRouter();
  const [clicked, setClicked] = useState(false);
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    hasToken(router);
  }, [router]);

  useEffect(() => {
    email.trim().length > 0 && setEmail(email);
    password.trim().length > 0 && setPassword(password);
  }, [email, password]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    email.trim().length <= 0 && setEmailError(true);
    email.trim().length > 100 && setEmailError(true);
    setEmailError(!regex.test(email));
    setPasswordError(password.trim().length <= 0);

    if (
      !emailError &&
      email.trim().length > 0 &&
      email.trim().length < 100 &&
      regex.test(email) &&
      password.trim().length > 0 &&
      !passwordError
    ) {
      router.push("/setting");

      // setClicked(true);
      // const params = {
      //   Username: email,
      //   Password: password,
      // };
    } else {
      setClicked(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen relative bg-white text-black">
      <div className="flex items-center justify-between max-h-screen min-w-full relative">
        <Image
          src="https://staging-tms.azurewebsites.net/assets/images/pages/login-v2.svg"
          alt="Login"
          className="w-[50%]"
          width={500}
          height={500}
        />
        <span className="absolute -top-10 left-4">
          <Pabs width="200" height="50" />
        </span>
        <div className="loginWrapper flex items-center flex-col pt-[10%] !w-[40%] font-normal border-l border-lightSilver">
          <p className="font-bold mb-[20px] text-darkCharcoal text-2xl">
            Welcome to PABS - I&B
          </p>
          <form
            className="text-start w-full max-w-3xl py-5 px-3 flex flex-col items-center justify-center"
            onSubmit={handleSubmit}
          >
            <div className="mb-4 w-[300px] lg:w-[356px]">
              <span className="text-gray-500 text-sm">
                Email
                <span className="!text-defaultRed">&nbsp;*</span>
              </span>
              <TextField
                type="email"
                sx={{ mt: "-3px" }}
                fullWidth
                value={email?.trim().length <= 0 ? "" : email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                onBlur={() => {
                  if (
                    email.trim().length < 1 ||
                    email.trim().length > 100 ||
                    !regex.test(email)
                  ) {
                    setEmailError(true);
                  }
                }}
                error={emailError}
                helperText={
                  emailError && email?.trim().length > 100
                    ? "Maximum 100 characters allowed."
                    : emailError && !regex.test(email)
                    ? "Please enter valid email."
                    : emailError
                    ? "This is a required field."
                    : ""
                }
                margin="normal"
                variant="standard"
              />
            </div>
            <div className="mb-5 w-[300px] lg:w-[356px]">
              <span className="text-gray-500 text-sm">
                Password
                <span className="!text-defaultRed">&nbsp;*</span>
              </span>
              <TextField
                type={show ? "text" : "password"}
                sx={{ mt: "-3px" }}
                fullWidth
                value={password?.trim().length <= 0 ? "" : password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                onBlur={() => {
                  if (password.trim().length < 1) {
                    setPasswordError(true);
                  }
                }}
                error={passwordError}
                helperText={passwordError ? "This is a required field." : ""}
                margin="normal"
                variant="standard"
                InputProps={{
                  endAdornment: (
                    <span
                      className="absolute top-1 right-2 text-slatyGrey cursor-pointer"
                      onClick={() => setShow(!show)}
                    >
                      {show ? (
                        <VisibilityOff className="text-[18px]" />
                      ) : (
                        <Visibility className="text-[18px]" />
                      )}
                    </span>
                  ),
                }}
              />
            </div>
            {/* <div className="pb-0 w-[300px] lg:w-[356px] flex justify-end items-center">
              <Link
                href="/forgot-password"
                className="text-[#1565C0] font-semibold text-sm lg:text-base underline"
              >
                Forgot Password?
              </Link>
            </div> */}
            {clicked ? (
              <span className="mt-[35px]">
                <Spinner />
              </span>
            ) : (
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className="rounded-full !w-[300px] !font-semibold mt-[35px] bg-[#1565C0]"
              >
                SIGN IN
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default login;
