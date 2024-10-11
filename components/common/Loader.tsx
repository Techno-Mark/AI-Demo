import { CircularProgress } from "@mui/material";

const Loader = () => {
  return (
    <div className="h-screen w-full fixed top-0 bottom-0 left-0 right-0 z-[9999] bg-[#0000004d] flex flex-col gap-4 items-center justify-center cursor-progress">
      <CircularProgress sx={{color: "white !important"}} />
    </div>
  );
};

export default Loader;
