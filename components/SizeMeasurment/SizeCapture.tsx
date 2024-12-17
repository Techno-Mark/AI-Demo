import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";

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

const SizeCapture = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [userDetected, setUserDetected] = useState<boolean>(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [measurements, setMeasurements] = useState<Measurements[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(5);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [poseDetector, setPoseDetector] =
    useState<poseDetection.PoseDetector | null>(null);
  const [averageMeasurements, setAverageMeasurements] = useState({});

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

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

    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      }
    );

    setPoseDetector(detector);
  };

  useEffect(() => {
    const interval = setInterval(detectPose, 100);
    return () => clearInterval(interval);
  }, [poseDetector, hasCamera]);

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
    const scalingFactor = 0.15; // Calibrate based on your camera setup
    const estimatedDistance = 200 / shoulderWidth; // Approximation formula
    return estimatedDistance * scalingFactor;
  };

  const detectPose = async () => {
    if (!poseDetector || !videoRef.current || !hasCamera) return;

    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("Invalid video dimensions. Skipping pose detection.");
      return;
    }

    try {
      const poses = await poseDetector.estimatePoses(video);
      if (poses.length > 0) {
        const poseKeypoints = poses[0].keypoints;

        const keypointsMap = {
          leftShoulder: poseKeypoints[5],
          rightShoulder: poseKeypoints[6],
        };

        const distanceToCamera = estimateDistance(
          keypointsMap.leftShoulder,
          keypointsMap.rightShoulder
        );

        setUserDetected(true);
        setDistance(distanceToCamera);

        if (distanceToCamera >= 0.11 && distanceToCamera <= 0.12) {
          if (!isCounting) {
            setIsCounting(true); // Start countdown
            setErrorMessage(""); // Clear any error message if in range
          }
        } else {
          setIsCounting(false); // Reset countdown if out of range
          setCountdown(5); // Reset countdown to 5 seconds
          setErrorMessage(
            "Distance is too " +
              (distanceToCamera < 0.11 ? "close" : "far") +
              ". Please adjust your position."
          );
        }

        // Countdown logic
        if (isCounting && countdown > 0) {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }
      } else {
        setUserDetected(false);
      }
    } catch (error) {
      console.error("Error detecting pose:", error);
    }
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

  const measurement = async () => {
    if (!poseDetector || !videoRef.current || !hasCamera) return;

    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("Invalid video dimensions. Skipping pose detection.");
      return;
    }

    try {
      const poses = await poseDetector.estimatePoses(video);
      if (poses.length > 0) {
        const poseKeypoints = poses[0].keypoints;

        const keypointsMap = {
          nose: poseKeypoints[0],
          leftShoulder: poseKeypoints[5],
          rightShoulder: poseKeypoints[6],
          leftHip: poseKeypoints[11],
          rightHip: poseKeypoints[12],
          leftElbow: poseKeypoints[7],
          rightElbow: poseKeypoints[8],
          leftWrist: poseKeypoints[9],
          rightWrist: poseKeypoints[10],
          leftKnee: poseKeypoints[13],
          rightKnee: poseKeypoints[14],
          leftAnkle: poseKeypoints[15],
          rightAnkle: poseKeypoints[16],
        };

        const scalingFactor = 0.154;

        const measurementsData = {
          chestSize:
            calculateDistance(
              keypointsMap.leftShoulder,
              keypointsMap.rightShoulder
            ) * scalingFactor,
          shoulderSize:
            (calculateDistance(
              keypointsMap.leftShoulder,
              keypointsMap.rightShoulder
            ) *
              scalingFactor) /
            2,
          armLength:
            ((calculateDistance(
              keypointsMap.leftShoulder,
              keypointsMap.leftElbow
            ) +
              calculateDistance(
                keypointsMap.leftElbow,
                keypointsMap.leftWrist
              )) *
              scalingFactor) /
            2,
          forearmSize:
            (calculateDistance(keypointsMap.leftElbow, keypointsMap.leftWrist) *
              scalingFactor) /
            2,
          upperArmSize:
            (calculateDistance(
              keypointsMap.leftShoulder,
              keypointsMap.leftElbow
            ) *
              scalingFactor) /
            2,
          bicepSize:
            (calculateDistance(
              keypointsMap.leftShoulder,
              keypointsMap.leftElbow
            ) *
              0.13) /
            2,
          // waistSize:
          //   calculateDistance(keypointsMap.leftHip, keypointsMap.rightHip) *
          //   scalingFactor,
          waistSize:
            ((calculateDistance(
              keypointsMap.leftShoulder,
              keypointsMap.rightShoulder
            ) +
              calculateDistance(keypointsMap.leftHip, keypointsMap.rightHip)) *
              scalingFactor) /
            2,
          thighSize:
            calculateDistance(keypointsMap.leftHip, keypointsMap.leftKnee) *
            scalingFactor,
          upperBodySize:
            calculateDistance(keypointsMap.leftShoulder, keypointsMap.leftHip) *
            scalingFactor,
          lowerBodySize:
            (calculateDistance(keypointsMap.leftHip, keypointsMap.leftKnee) +
              calculateDistance(
                keypointsMap.leftKnee,
                keypointsMap.leftAnkle
              )) *
            scalingFactor,
          neckSize:
            (calculateDistance(keypointsMap.nose, keypointsMap.leftShoulder) *
              scalingFactor) /
            2,
          hipSize:
            calculateDistance(keypointsMap.leftHip, keypointsMap.rightHip) *
            scalingFactor,
          legSize:
            (calculateDistance(keypointsMap.leftHip, keypointsMap.leftKnee) +
              calculateDistance(
                keypointsMap.leftKnee,
                keypointsMap.leftAnkle
              )) *
            scalingFactor,
          kneeSize:
            (calculateDistance(keypointsMap.leftKnee, keypointsMap.rightKnee) *
              scalingFactor) /
            2, // Assume circumference proportional to distance and scaling
          calfSize:
            (calculateDistance(keypointsMap.leftKnee, keypointsMap.leftAnkle) *
              scalingFactor) /
            2,
        };

        // You can either display the distance directly as part of the UI
        setMeasurements((prevMeasurements) => [
          ...prevMeasurements,
          measurementsData,
        ]);
      } else {
        setUserDetected(false);
        setMeasurements([]);
      }
    } catch (error) {
      console.error("Error detecting pose:", error);
    }
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

  const handleClickOpen = () => {
    setUserDetected(false);
    setDistance(null);
    setErrorMessage("");
    setCapturedImage(null);
    setCountdown(5);
    setIsCounting(false);
    setMeasurements([]);
    setAverageMeasurements({});
    setOpen(true);
    startCamera();
  };

  const handleClose = () => {
    setOpen(false);
    if (videoRef.current) {
      const stream: any = videoRef.current.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track: any) => track.stop());
      }
    }
    setHasCamera(true);
    setUserDetected(false);
    setDistance(null);
    setCountdown(5); // Reset countdown when closing the dialog
    setErrorMessage(""); // Clear any error message when closing
  };

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
      average[key] = value / measurements.length;
    });

    setAverageMeasurements({
      ...average,
      tShirtSize: estimateTShirtSize(average.chestSize),
    });
  };

  useEffect(() => {
    errorMessage.length > 0 && setMeasurements([]);
  }, [errorMessage]);

  useEffect(() => {
    let countdownTimer: any;
    if (isCounting && countdown >= 0) {
      countdownTimer = setInterval(() => {
        if (countdown > 0) {
          setCountdown((prevCountdown) => prevCountdown - 1); // Decrease countdown every second
          measurement();
        } else {
          captureImage();
          handleClose();
        }
      }, 1000); // Update countdown every second
    }
    if (measurements.length > 0 && countdown === 0) {
      calculateAverageMeasurements();
    }

    return () => clearInterval(countdownTimer); // Clean up the interval on component unmount or when countdown is reset
  }, [isCounting, countdown]); // Effect depends on isCounting and countdown

  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <Button
        variant="contained"
        onClick={handleClickOpen}
        className="my-4 !bg-[#1565c0]"
      >
        Capture
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Pose Detection</DialogTitle>
        <DialogContent>
          {hasCamera ? (
            <div>
              <video
                ref={videoRef}
                width="100%"
                height="fit"
                style={{
                  border:
                    distance && (distance < 0.11 || distance > 0.12)
                      ? "2px solid red"
                      : "2px solid black",
                }}
              />
              <canvas ref={canvasRef} width={"0px"} height={"0px"} />
              {hasCamera && userDetected ? (
                <div>
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
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Display the captured image below the button */}
      {capturedImage && (
        <div>
          <Typography variant="h6">Captured Image:</Typography>
          <img
            src={capturedImage}
            alt="Captured"
            style={{ width: "400px", maxHeight: "400px" }}
            className="mb-4"
          />
        </div>
      )}

      {capturedImage && measurements.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          <div>
            {Object.entries(averageMeasurements)
              .slice(0, Object.entries(averageMeasurements).length / 2)
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
          </div>
          <div>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default SizeCapture;
