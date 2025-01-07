/* eslint-disable @next/next/no-img-element */
import React, { useRef, useEffect, useState } from "react";
import "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
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

// Define types for keypoints
interface Keypoint {
  x: number;
  y: number;
  score?: number;
}

interface Pose {
  keypoints: Keypoint[];
}

// Define measurements type
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

const validWeightRegex = /^\d{0,3}(\.\d{0,2})?$/;

const SizeCapture3 = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [poseDetector, setPoseDetector] =
    useState<poseDetection.PoseDetector | null>(null);
  const [stream, setStream] = useState<any>(null);
  const [userDetected, setUserDetected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(5);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [averageMeasurements, setAverageMeasurements] = useState<
    Measurements | any
  >({});
  const [openMeasurementData, setOpenMeasurementData] =
    useState<boolean>(false);
  const [chestSize, setChestSize] = useState<number>(0);
  const [waistSize, setWaistSize] = useState<number>(0);
  const [id, setId] = useState<number>(0);
  const [height, setHeight] = useState(0);
  const [heightErr, setHeightErr] = useState(false);
  const [weight, setWeight] = useState(0);
  const [weightErr, setWeightErr] = useState(false);

  const startCamera = async () => {
    setId(0);
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      setStream(userMediaStream);

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

    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    };
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );

    setPoseDetector(detector);
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas: any = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData); // Save the captured image
  };

  const calculateDistance = (point1: Keypoint, point2: Keypoint) => {
    if (!point1 || !point2) return 0;
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const estimateDistance = (
    shoulderLeft: Keypoint,
    shoulderRight: Keypoint
  ) => {
    const shoulderWidth = calculateDistance(shoulderLeft, shoulderRight);
    const scalingFactor = 0.15;
    const estimatedDistance = 200 / shoulderWidth;
    return estimatedDistance * scalingFactor;
  };

  const detectPose = async () => {
    if (!poseDetector || !videoRef.current || !hasCamera) return;

    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("Invalid video dimensions. Skipping Fit checking.");
      return;
    }

    if (videoRef.current.readyState === 4) {
      const canvas: any = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const poses = await poseDetector.estimatePoses(video);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (poses.length > 0) {
        poses.forEach((pose) => {
          const leftHip: any = pose.keypoints.find(
            (kp) => kp.name === "left_hip"
          );
          const rightHip: any = pose.keypoints.find(
            (kp) => kp.name === "right_hip"
          );

          if (leftHip?.score > 0.5 && rightHip?.score > 0.5) {
            const yLevel = Math.round((leftHip.y + rightHip.y) / 2);
            const startX = Math.min(leftHip.x, rightHip.x) - 50;
            const endX = Math.max(leftHip.x, rightHip.x) + 50;

            const imageData = ctx.getImageData(
              startX,
              yLevel,
              endX - startX,
              1
            );
            const { data, width } = imageData;

            let bodyLeftEdge = null;
            let bodyRightEdge = null;

            for (let x = 0; x < width; x++) {
              const idx = x * 4;
              const [r, g, b, a] = data.slice(idx, idx + 4);
              if (a > 0) {
                if (bodyLeftEdge === null) bodyLeftEdge = x + startX;
                bodyRightEdge = x + startX;
              }
            }

            if (bodyLeftEdge !== null) {
              pose.keypoints.push({
                x: bodyLeftEdge + 20,
                y: yLevel,
                score: 0.8,
                name: "left_waist",
              });
            }

            if (bodyRightEdge !== null) {
              pose.keypoints.push({
                x: bodyRightEdge - 20,
                y: yLevel,
                score: 0.8,
                name: "right_waist",
              });
            }
          }

          pose.keypoints.forEach(({ x, y, score, name }: any) => {
            if (Number(score) > 0.5) {
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = name.includes("waist") ? "blue" : "red";
              ctx.fill();
            }
          });
        });

        const nose: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "nose"
        );
        const leftEye: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_eye"
        );
        const rightEye: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "right_eye"
        );
        const leftShoulder: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_shoulder"
        );
        const rightShoulder: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "right_shoulder"
        );
        const leftHip: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_hip"
        );
        const rightHip: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "right_hip"
        );
        const leftElbow: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_elbow"
        );
        const rightElbow: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "right_elbow"
        );
        const leftWrist: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_wrist"
        );
        const rightWrist: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "right_wrist"
        );
        const leftKnee: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_knee"
        );
        const rightKnee: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "right_knee"
        );
        const leftAnkle: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_ankle"
        );
        const rightAnkle: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "right_ankle"
        );
        const leftWaist: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_waist"
        );
        const rightWaist: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "right_waist"
        );

        setUserDetected(true);
        const distanceToCamera = estimateDistance(leftShoulder, rightShoulder);
        setDistance(distanceToCamera);
        const distanceToEyes = calculateDistance(leftEye, rightEye);

        if (distanceToCamera >= 0.21 && distanceToCamera <= 0.25) {
          const measurementsData = {
            chestSize:
              ((calculateDistance(leftShoulder, rightShoulder) * 3.7) /
                distanceToEyes) *
              2,
            shoulderSize:
              (calculateDistance(leftShoulder, rightShoulder) * 3.2) /
              distanceToEyes,
            waistSize:
              ((calculateDistance(leftWaist, rightWaist) * 3.1) /
                distanceToEyes) *
              2,
            armLength:
              ((calculateDistance(leftShoulder, leftElbow) +
                calculateDistance(leftElbow, leftWrist)) *
                3) /
              distanceToEyes,
            forearmSize:
              (calculateDistance(leftElbow, leftWrist) * 3) / distanceToEyes,
            upperArmSize:
              (calculateDistance(leftShoulder, leftElbow) * 3) / distanceToEyes,
            bicepSize:
              (calculateDistance(leftShoulder, leftElbow) * 3) / distanceToEyes,
            thighSize:
              (calculateDistance(leftWaist, leftKnee) * 4) / distanceToEyes,
            upperBodySize:
              (calculateDistance(leftShoulder, leftHip) * 4) / distanceToEyes,
            lowerBodySize:
              ((calculateDistance(leftHip, leftKnee) +
                calculateDistance(leftKnee, leftAnkle)) *
                4) /
              distanceToEyes,
            neckSize:
              (calculateDistance(nose, leftShoulder) * 4.2) / distanceToEyes,
            hipSize:
              ((calculateDistance(leftWaist, rightWaist) * 3.5) /
                distanceToEyes) *
              2,
            legSize:
              ((calculateDistance(leftHip, leftKnee) +
                calculateDistance(leftKnee, leftAnkle)) *
                4) /
              distanceToEyes,
            kneeSize:
              (calculateDistance(leftWaist, leftKnee) * 4) / distanceToEyes / 2,
            calfSize:
              (calculateDistance(leftKnee, leftAnkle) * 4) / distanceToEyes / 2,
          };

          setMeasurements((prevMeasurements) => [
            ...prevMeasurements,
            measurementsData,
          ]);
          if (!isCounting) {
            setIsCounting(true);
            setErrorMessage("");
          }
        } else {
          setIsCounting(false);
          setCountdown(5);
          setErrorMessage(
            "Distance is too " +
              (distanceToCamera < 0.21 ? "close" : "far") +
              ". Please adjust your position."
          );
        }

        if (isCounting && countdown > 0) {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }
      }
    } else {
      setUserDetected(false);
      setMeasurements([]);
    }
  };

  useEffect(() => {
    const interval = setInterval(detectPose, 100);
    return () => clearInterval(interval);
  }, [poseDetector, hasCamera]);

  const handleClickOpen = () => {
    setWeightErr(
      weight.toString().trim().length < 2 || weight.toString().trim().length > 3
    );
    setHeightErr(height.toString().trim().length < 3);

    if (
      height.toString().trim().length === 3 &&
      !heightErr &&
      !weightErr &&
      weight.toString().trim().length > 1
    ) {
      setUserDetected(false);
      setErrorMessage("");
      setCountdown(5);
      setIsCounting(false);
      setCapturedImage(null);
      setMeasurements([]);
      setAverageMeasurements({});
      setOpen(true);
      startCamera();
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (videoRef.current) {
      const tracks: any = stream?.getTracks();
      tracks?.forEach((track: any) => track.stop());
    }
    setHasCamera(true);
    setUserDetected(false);
    setErrorMessage("");
    setCountdown(5);
  };

  const estimateTShirtSize = (chestInInches: number) => {
    if (chestInInches < 30) return "Check kids section";
    if (chestInInches >= 30 && chestInInches < 32) return "XXXS";
    if (chestInInches >= 32 && chestInInches < 34) return "XXS";
    if (chestInInches >= 34 && chestInInches < 36) return "XS";
    if (chestInInches >= 36 && chestInInches < 38) return "Small (S)";
    if (chestInInches >= 38 && chestInInches < 40) return "Medium (M)";
    if (chestInInches >= 40 && chestInInches < 42) return "Large (L)";
    if (chestInInches >= 42 && chestInInches < 44) return "XL";
    if (chestInInches >= 44 && chestInInches < 46) return "XXL";
    if (chestInInches >= 46 && chestInInches <= 48) return "XXXL";
    return "Too large size not available";
  };

  const estimateHoddieSize = (chestInInches: number) => {
    if (chestInInches < 30) return "Check kids section";
    if (chestInInches >= 30 && chestInInches < 32) return "XXS";
    if (chestInInches >= 32 && chestInInches < 34) return "XS";
    if (chestInInches >= 34 && chestInInches < 36) return "Small (S)";
    if (chestInInches >= 36 && chestInInches < 38) return "Medium (M)";
    if (chestInInches >= 38 && chestInInches < 40) return "Large (L)";
    if (chestInInches >= 40 && chestInInches < 42) return "XL";
    if (chestInInches >= 42 && chestInInches < 44) return "XXL";
    if (chestInInches >= 44 && chestInInches < 46) return "XXXL";
    return "Too large size not available";
  };

  useEffect(() => {
    errorMessage.length > 0 && setMeasurements([]);
  }, [errorMessage]);

  const calculateAverageMeasurements = () => {
    const average: any = {};
    measurements.forEach((data) => {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === "number") {
          if (!average[key]) average[key] = 0;
          average[key] += value;
        }
      });
    });

    Object.entries(average).forEach(([key, value]: any) => {
      average[key] = Math.round(value / measurements.length);
    });

    setAverageMeasurements({
      ...average,
    });
  };

  useEffect(() => {
    let countdownTimer: any;
    if (isCounting && countdown >= 0) {
      countdownTimer = setInterval(() => {
        if (countdown > 0) {
          setCountdown((prevCountdown) => prevCountdown - 1);
        } else {
          captureImage();
          handleClose();
        }
      }, 1000);
    }
    if (measurements.length > 0 && countdown === 0) {
      calculateAverageMeasurements();
    }

    return () => clearInterval(countdownTimer);
  }, [isCounting, countdown]);

  const updateSatisfiedStatus = async (isSatisfied: boolean) => {
    const params = {
      ...averageMeasurements,
      isSatisfied: isSatisfied,
      chestMeasure: chestSize === 0 ? null : chestSize,
      waistMeasure: waistSize === 0 ? null : waistSize,
      id: id,
      blob: capturedImage,
    };
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SIZE_MEASUREMENT}/measurements`,
        params
      );
      return response.data;
    } catch (error) {
      toast.error("There is some error. Please try again later.", toastOptions);
      throw error;
    }
  };

  const handleClickSatisfied = async (
    isSatisfied: boolean,
    success: boolean
  ) => {
    try {
      const response = await updateSatisfiedStatus(isSatisfied);
      if (response.status.toLowerCase() == "success") {
        setId(response.data.id);
        success &&
          toast.success(
            "Thank you for sharing your measurement!",
            toastOptions
          );
        success && handleClose();
        success && setOpenMeasurementData(false);
        success && setMeasurements([]);
        success && setAverageMeasurements({});
        success && setIsCounting(false);
        success && setCapturedImage(null);
      }
    } catch (error) {
      toast.error("There is some error. Please try again later.", toastOptions);
    }
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
      <div
        style={{
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <TextField
            label="Weight (In KG)"
            onFocus={(e) =>
              e.target.addEventListener(
                "wheel",
                function (e) {
                  e.preventDefault();
                },
                { passive: false }
              )
            }
            fullWidth
            value={weight}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              if (value.length <= 3) {
                setWeight(Number(value));
                setWeightErr(false);
              }
            }}
            margin="normal"
            variant="standard"
            sx={{
              width: 300,
              mx: 0.75,
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (!value || Number(value) < 3 || value.length > 3) {
                setWeightErr(true);
              } else {
                setWeightErr(false);
              }
            }}
            error={weightErr}
            helperText={weightErr ? "Enter a valid weight in kg." : ""}
          />

          <TextField
            label="Height (In CM)"
            onFocus={(e) =>
              e.target.addEventListener(
                "wheel",
                function (e) {
                  e.preventDefault();
                },
                { passive: false }
              )
            }
            fullWidth
            value={height}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              if (value.length <= 3) {
                setHeight(Number(value));
                setHeightErr(false);
              }
            }}
            margin="normal"
            variant="standard"
            sx={{
              width: 300,
              mx: 0.75,
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (!value || Number(value) < 3 || value.length > 3) {
                setHeightErr(true);
              } else {
                setHeightErr(false);
              }
            }}
            error={heightErr}
            helperText={
              heightErr &&
              height !== null &&
              height.toString().trim().length < 3
                ? "Enter a valid height in cm."
                : heightErr && height !== null && height.toString().length > 3
                ? "Maximum 3 digits allowed."
                : ""
            }
          />

          <Button
            variant="contained"
            onClick={handleClickOpen}
            className="my-4 !bg-[#1565c0]"
          >
            Capture
          </Button>
        </div>

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>Fit check</DialogTitle>
          <DialogContent>
            {hasCamera ? (
              <div className="!max-w-[500px]">
                <video
                  ref={videoRef}
                  width="100%"
                  height="fit"
                  style={{
                    border:
                      distance && (distance < 0.21 || distance > 0.25)
                        ? "2px solid red"
                        : "2px solid black",
                  }}
                ></video>
                <canvas
                  ref={canvasRef}
                  width={"0px"}
                  height={"0px"}
                  className="hidden"
                />
                {hasCamera && userDetected ? (
                  <div className="mt-4">
                    <Typography variant="h6">User Detected</Typography>
                    {isCounting && (
                      <Typography variant="h6" color="primary">
                        Countdown: {countdown} seconds
                      </Typography>
                    )}
                  </div>
                ) : (
                  <Typography variant="h6" color="error">
                    No user detected. Please step into the frame.
                  </Typography>
                )}
                {userDetected && errorMessage && (
                  <Typography variant="h6" color="error">
                    {errorMessage}
                  </Typography>
                )}
              </div>
            ) : (
              <Typography variant="h6" color="error">
                No Camera Found
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="outlined" color="error">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {capturedImage && (
          <div className="flex flex-col items-center justify-center text-black">
            <Typography variant="h6">Captured Image:</Typography>
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: "300px", maxHeight: "300px" }}
              className="mb-4"
            />
          </div>
        )}

        {capturedImage && measurements.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-4 text-black">
            <p>
              As per Fitcheck Your T-shirt size is&nbsp;
              {estimateTShirtSize(averageMeasurements.chestSize)}, Pant size
              is&nbsp;
              {Math.round(averageMeasurements.waistSize)} and Hoodie size
              is&nbsp;
              {estimateHoddieSize(averageMeasurements.chestSize)}
            </p>
            <p className="border rounded-lg w-[30%] py-4 flex flex-col items-center justify-center gap-5">
              <b>Are you satisfied with this data?</b>
              <div className="flex gap-5">
                <Button
                  variant="contained"
                  onClick={() => handleClickSatisfied(true, true)}
                  className="my-4 !bg-[#1565c0]"
                >
                  Yes
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setOpenMeasurementData(true);
                    handleClickSatisfied(true, false);
                  }}
                  className="my-4 "
                >
                  No
                </Button>
              </div>
            </p>
            <div className="flex items-center justify-center gap-5">
              <p>
                Normal Chest Size:{" "}
                {((0.35 * height + 0.45 * weight + 10) * 0.393701).toFixed(2)}
                inches,&nbsp;
                {(0.35 * height + 0.45 * weight + 10).toFixed(2)}cm
              </p>
              <p>
                Normal Shoulder Size:
                {((0.15 * height + 0.25 * weight + 6) * 0.393701).toFixed(2)}
                inches,&nbsp;
                {(0.15 * height + 0.25 * weight + 6).toFixed(2)}cm
              </p>
              <p>
                Normal Waist Size:{" "}
                {((0.25 * height + 0.4 * weight + 8) * 0.393701).toFixed(2)}
                inches,&nbsp;
                {(0.25 * height + 0.4 * weight + 8).toFixed(2)}cm
              </p>
            </div>
            <div className="flex items-center justify-center gap-5">
              <p>
                Chest Size: {averageMeasurements.chestSize}inches,&nbsp;
                {(averageMeasurements.chestSize * 2.54).toFixed(2)}cm
              </p>
              <p>
                Shoulder Size: {averageMeasurements.shoulderSize}inches,&nbsp;
                {(averageMeasurements.shoulderSize * 2.54).toFixed(2)}cm
              </p>
              <p>
                Waist Size: {averageMeasurements.waistSize}inches,&nbsp;
                {(averageMeasurements.waistSize * 2.54).toFixed(2)}cm
              </p>
            </div>
            <div className="flex items-center justify-center gap-5">
              <p>
                Average Chest Size:{" "}
                {(
                  ((0.35 * height + 0.45 * weight) * 0.393701 +
                    averageMeasurements.chestSize) /
                  2
                ).toFixed(2)}{" "}
                inches,&nbsp;
                {(
                  (0.35 * height +
                    0.45 * weight +
                    averageMeasurements.chestSize * 2.54) /
                  2
                ).toFixed(2)}{" "}
                cm
              </p>
              <p>
                Average Shoulder Size:{" "}
                {(
                  ((0.15 * height + 0.25 * weight) * 0.393701 +
                    averageMeasurements.shoulderSize) /
                  2
                ).toFixed(2)}{" "}
                inches,&nbsp;
                {(
                  (0.15 * height +
                    0.25 * weight +
                    averageMeasurements.shoulderSize * 2.54) /
                  2
                ).toFixed(2)}{" "}
                cm
              </p>
              <p>
                Average Waist Size:{" "}
                {(
                  ((0.25 * height + 0.4 * weight) * 0.393701 +
                    averageMeasurements.waistSize) /
                  2
                ).toFixed(2)}{" "}
                inches,&nbsp;
                {(
                  (0.25 * height +
                    0.4 * weight +
                    averageMeasurements.waistSize * 2.54) /
                  2
                ).toFixed(2)}{" "}
                cm
              </p>
            </div>
            {/* <div>
              {Object.entries(averageMeasurements)
                // .slice(0, Object.entries(averageMeasurements).length / 2)
                .map(([key, value]) => (
                  <p key={key} className="py-1">
                    <strong>{key.replace(/([A-Z])/g, " $1")}</strong>:{" "}
                    {value === "N/A"
                      ? value
                      : typeof value === "number"
                      ? value.toFixed(2)
                      : (value as string)}
                  </p>
                ))}
            </div> */}
            {/* <div>
            {Object.entries(averageMeasurements)
              .slice(Object.entries(averageMeasurements).length / 2)
              .map(([key, value]) => (
                <p key={key} className="py-1">
                  <strong>{key.replace(/([A-Z])/g, " $1")}</strong>:{" "}
                  {value === "N/A"
                    ? value
                    : typeof value === "number"
                    ? value.toFixed(2)
                    : (value as string)}
                </p>
              ))}
          </div> */}
          </div>
        )}

        <Dialog
          open={openMeasurementData}
          onClose={() => setOpenMeasurementData(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Provide your sizes(In inches)</DialogTitle>
          <DialogContent className="flex items-center justify-center gap-5">
            <TextField
              label="Chest size(In inches)"
              className="pt-1"
              value={chestSize}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 2) {
                  setChestSize(Number(value));
                }
              }}
              margin="normal"
              variant="standard"
            />
            <TextField
              label="Waist size(In inches)"
              className="pt-1"
              value={waistSize}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 2) {
                  setWaistSize(Number(value));
                }
              }}
              margin="normal"
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleClickSatisfied(false, true)}
              variant="contained"
              className="!bg-[#1565c0]"
            >
              save
            </Button>
            <Button
              onClick={() => setOpenMeasurementData(false)}
              variant="outlined"
              color="error"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default SizeCapture3;
