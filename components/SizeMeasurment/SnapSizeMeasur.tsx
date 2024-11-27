import React, { useState } from "react";
import { toast, ToastContainer, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const SnapSizeMeasur: React.FC = () => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [frontImageName, setFrontImageName] = useState<string | null>(null);
  const [sideImageName, setSideImageName] = useState<string | null>(null);
  const [height, setHeight] = useState<string>("");
  const [unit, setUnit] = useState<"cm" | "feet">("cm");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<string | null>(null);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    face: "front" | "side"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const cleanedBase64 = base64.replace(
        /^data:image\/(jpeg|png|gif);base64,/,
        ""
      );
      if (face === "front") {
        setFrontImage(cleanedBase64);
        setFrontImageName(file.name);
      } else {
        setSideImage(cleanedBase64);
        setSideImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHeightInput = (value: string) => {
    if (unit === "cm" && /^\d{0,3}$/.test(value)) setHeight(value);
    if (unit === "feet" && /^\d{0,3}(\.\d{0,2})?$/.test(value))
      setHeight(value);
  };

  const handleUnitChange = (selectedUnit: "cm" | "feet") => {
    if (selectedUnit !== unit) {
      setUnit(selectedUnit);
      if (selectedUnit === "cm" && height) {
        const feet = parseFloat(height);
        if (!isNaN(feet)) {
          setHeight((feet * 30.48).toFixed(2));
        }
      } else if (selectedUnit === "feet" && height) {
        const cm = parseFloat(height);
        if (!isNaN(cm)) {
          setHeight((cm / 30.48).toFixed(2));
        }
      }
    }
  };

  const validateData = (): boolean => {
    if (!frontImage || !sideImage) {
      return false;
    }
    if (!height) {
      return false;
    }
    return true;
  };

  const analyzeBodyMeasurements = async () => {
    if (!validateData()) return;
    setLoading(true);
    setData(null);

    try {
      const response = await fetch(
        "https://api.snapmeasureai.com/smpl/v2/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            height: `${height}cm`,
            images: [
              {
                data: frontImage,
                fileName: frontImageName,
              },
              {
                data: sideImage,
                fileName: sideImageName,
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (response.status == 200) {
        const mainData = await data.data;
        setData(mainData);
        toast.success("Body measurements analyzed successfully.", toastOptions);
        setLoading(false);
        resetForm();
      } else {
        toast.error(
          `Error: ${data.message || "Something went wrong"}`,
          toastOptions
        );
        setLoading(false);
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error while analyzing body measurements", toastOptions);
      setLoading(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFrontImage(null);
    setSideImage(null);
    setFrontImageName(null);
    setSideImageName(null);
    setHeight("");
    setUnit("cm");
    setLoading(false);
  };

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex flex-col items-center p-6 space-y-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800">Snap Size Measurer</h1>
        <div className="flex space-x-8 w-full justify-center">
          {["front", "side"].map((face) => (
            <div
              key={face}
              className="flex flex-col items-center border-2 border-dashed border-gray-300 p-6 rounded-md w-60 h-60 relative"
            >
              {face === "front" && frontImage ? (
                <img
                  src={`data:image/jpeg;base64,${frontImage}`}
                  alt="Front"
                  className="object-cover rounded-md h-full w-full"
                />
              ) : face === "side" && sideImage ? (
                <img
                  src={`data:image/jpeg;base64,${sideImage}`}
                  alt="Side"
                  className="object-cover rounded-md h-full w-full"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  {face === "front"
                    ? "Capture front image"
                    : "Capture side image"}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) =>
                  handleFileUpload(e, face === "front" ? "front" : "side")
                }
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center space-y-4 mt-6">
          <div className="flex items-center justify-center gap-4">
            <input
              type="text"
              value={height}
              onChange={(e) => handleHeightInput(e.target.value)}
              placeholder="Height"
              className="w-32 text-center py-2 border-gray-300 rounded-md text-black"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleUnitChange("cm")}
                className={`px-4 py-2 rounded-md ${
                  unit === "cm" ? "bg-purple-500 text-white" : "bg-gray-200"
                }`}
              >
                cm
              </button>
              {/* <button
                onClick={() => handleUnitChange("feet")}
                className={`px-4 py-2 rounded-md ${
                  unit === "feet" ? "bg-purple-500 text-white" : "bg-gray-200"
                }`}
              >
                feet
              </button> */}
            </div>
          </div>
          <button
            onClick={analyzeBodyMeasurements}
            disabled={!frontImage || !sideImage || !height || loading}
            className={`px-6 py-3 bg-green-500 text-white rounded shadow-md hover:bg-green-600 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed`}
          >
            {loading ? "Loading..." : "Analyze Body Measurements"}
          </button>
        </div>
        {!!data && typeof data === "string" && (
          <table className="text-black table-auto w-[40%] border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Measurement</th>
                <th className="px-4 py-2 border-b">Value (cm)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(JSON.parse(data.replace(/'/g, '"'))).map(
                ([key, value]: [string, any]) => (
                  <tr key={key}>
                    <td className="px-4 py-2 border-b text-center">{key}</td>
                    <td className="px-4 py-2 border-b text-center">
                      {!!value ? value.toFixed(2) : "-"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default SnapSizeMeasur;
