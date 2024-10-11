import { ReactNode } from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

type WrapperPropsType = {
  isScrollable?: boolean;
  children: ReactNode;
};

const MainWrapper = ({ isScrollable, children }: WrapperPropsType) => {
  return (
    <>
      <div className="max-h-screen flex flex-col overflow-hidden bg-white text-darkCharcoal">
        <Box
          sx={{
            display: "flex",
            overflow: isScrollable ? "scroll" : "hidden",
          }}
        >
          <CssBaseline />
          <Sidebar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: { sm: `calc(100% - ${200}px)` },
            }}
          >
            <Navbar />
            {children}
          </Box>
        </Box>
      </div>
    </>
  );
};

export default MainWrapper;
