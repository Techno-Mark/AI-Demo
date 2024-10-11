"use client";
import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "@mui/material";
import { Logout } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Navbar = () => {
  const router = useRouter();
  const [openLogoutNavbar, setOpenLogoutNavbar] = useState(false);
  const selectRefNavbar = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("username") || "");
  }, []);

  const handleLogout = () => {
    setOpenLogoutNavbar(false);
    localStorage.clear();
    router.push("/login");
    toast.success("User logout successfully.");
  };

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      if (
        selectRefNavbar.current &&
        !selectRefNavbar.current.contains(event.target)
      ) {
        setOpenLogoutNavbar(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <>
      <div className="flex items-center justify-between px-[20px] py-2 border-b border-lightSilver z-5">
        <div></div>

        <span className="flex items-center">
          <div
            ref={selectRefNavbar}
            className="flex items-center justify-center flex-col relative"
          >
            <span
              onClick={() => setOpenLogoutNavbar(!openLogoutNavbar)}
              className="cursor-pointer flex items-center justify-center gap-2"
            >
              <Avatar sx={{ width: 34, height: 34, fontSize: 14 }}></Avatar>
              {username}
            </span>
            {openLogoutNavbar && (
              <div className="absolute top-[55px] rounded-md -right-2 w-50 h-12 px-5 flex items-center justify-center bg-white shadow-xl z-50">
                <span
                  onClick={handleLogout}
                  className="flex items-center justify-center cursor-pointer hover:text-defaultRed"
                >
                  <span className="!rotate-0">
                    <Logout />
                  </span>
                  &nbsp;Logout
                </span>
              </div>
            )}
          </div>
        </span>
      </div>
    </>
  );
};

export default Navbar;
