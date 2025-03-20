import {
  Button,
  Dialog,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Correct from "tsconfig.json/assets/icons/Correct`";
import MeasurementDialog from "./MeasurementDialog";

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

interface Keypoint {
  x: number;
  y: number;
  score?: number;
}

interface Measurements {
  chestSize: number;
  shoulderSize: number;
  armLength: number;
  forearmSize: number;
  upperArmSize: number;
  bicepSize: number;
  waistSize: number;
  thighSize: number;
  upperBodySize: number;
  lowerBodySize: number;
  neckSize: number;
  hipSize: number;
  legSize: number;
  kneeSize: number;
  calfSize: number;
}

const FitCheckYourSize3 = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async () => {
    setCapturedImage(null);
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = userMediaStream;

        videoRef.current.addEventListener("loadedmetadata", () => {
          videoRef.current?.play();
          setHasCamera(true);
          startPoseDetection();
        });
      }
    } catch (err) {
      console.error("Camera not found or permission denied", err);
      setHasCamera(false);
    }
  };

  const startPoseDetection = async () => {
    if (!hasCamera) return;
    await tf.ready();
    await tf.setBackend("webgl");
  };

  const handleOpen = () => {
    startCamera();
  };

  return (
    <>
      {!capturedImage && (
        <>
          <p className="text-ml flex items-center justify-center">
            Help us find your best fit.
          </p>
          <Button
            variant="contained"
            onClick={() => handleOpen()}
            className="mt-6 !bg-[#6B7CF6]"
          >
            Open Camera
          </Button>
        </>
      )}
      {
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between py-10 gap-4 md:gap-10 md:py-4 !w-[70%]">
          <div className="flex flex-col items-start justify-center gap-1 md:gap-2 md:w-[33%]">
            <div>
              <p className="text-[#28A745] text-md lg:text-xl">
                Correct Technique
              </p>
              <span className="text-xs md:text-md lg:text-lg">
                (for best results)
              </span>
            </div>
            {[
              "Wear fitted clothes",
              "Stretch your arms outward",
              "Use good lighting",
            ].map((i, index) => (
              <p
                className="flex items-center justify-center py-1 text-xs md:text-md lg:text-lg"
                key={index}
              >
                <Correct />
                &nbsp;{i}
              </p>
            ))}
          </div>
          <div className="flex items-start justify-center gap-5 md:w-[66%]">
            {hasCamera ? (
              <div className="!max-w-[400px] flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  width="100%"
                  height="fit"
                  playsInline
                ></video>
                <canvas
                  ref={canvasRef}
                  width={"0px"}
                  height={"0px"}
                  className="hidden"
                />
                {hasCamera ? (
                  <div className="mt-4 flex flex-col items-center justify-center">
                    <Typography variant="h6">
                      <span className="text-sm md:text-md lg:text-xl">
                        User Detected
                      </span>
                    </Typography>
                  </div>
                ) : (
                  <Typography variant="h6" color="error">
                    <span className="text-sm md:text-md lg:text-xl">
                      No user detected. Please step into the frame.
                    </span>
                  </Typography>
                )}
              </div>
            ) : (
              <Typography variant="h6" color="error">
                <span className="text-sm md:text-md lg:text-xl">
                  No Camera Found
                </span>
              </Typography>
            )}
            <div className="w-[50%] flex items-center justify-end">
              <img src="/pose.png" alt="pose" />
            </div>
          </div>
        </div>
      }
      {capturedImage && (
        <div className="flex flex-col items-center justify-center">
          <img
            src={capturedImage}
            alt="Captured"
            style={{ width: "200px", maxHeight: "200px" }}
            className="mb-4"
          />
        </div>
      )}
    </>
  );
};

export default FitCheckYourSize3;
