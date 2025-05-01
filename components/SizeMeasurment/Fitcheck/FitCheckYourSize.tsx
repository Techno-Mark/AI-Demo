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

const FitCheckYourSize = ({
  height,
  camera,
  setCamera,
  weight,
  sex,
  // dob,
  // body,
  onClose,
}: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
  const [id, setId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const measurementsList = [
    "chestSize",
    "waistSize",
    "shoulderSize",
    "armLength",
    "forearmSize",
    "upperarmSize",
    "bicepSize",
    "neckSize",
    "thighSize",
    "hipSize",
    "legSize",
    "kneeSize",
    "calfSize",
    "upperbodySize",
    "lowerbodySize",
  ] as const;
  type MeasurementKey = (typeof measurementsList)[number];
  const [measurementDialog, setMeasurementDialog] = useState<
    Record<MeasurementKey, number>
  >({
    chestSize: 0,
    waistSize: 0,
    shoulderSize: 0,
    armLength: 0,
    forearmSize: 0,
    upperarmSize: 0,
    bicepSize: 0,
    neckSize: 0,
    thighSize: 0,
    hipSize: 0,
    legSize: 0,
    kneeSize: 0,
    calfSize: 0,
    upperbodySize: 0,
    lowerbodySize: 0,
  });
  const [errors, setErrors] = useState<Record<MeasurementKey, boolean>>({
    chestSize: false,
    waistSize: false,
    shoulderSize: false,
    armLength: false,
    forearmSize: false,
    upperarmSize: false,
    bicepSize: false,
    neckSize: false,
    thighSize: false,
    hipSize: false,
    legSize: false,
    kneeSize: false,
    calfSize: false,
    upperbodySize: false,
    lowerbodySize: false,
  });

  const startCamera = async () => {
    setId(0);
    setCapturedImage(null);
    setLoading(false);
    setMeasurementDialog({
      chestSize: 0,
      waistSize: 0,
      shoulderSize: 0,
      armLength: 0,
      forearmSize: 0,
      upperarmSize: 0,
      bicepSize: 0,
      neckSize: 0,
      thighSize: 0,
      hipSize: 0,
      legSize: 0,
      kneeSize: 0,
      calfSize: 0,
      upperbodySize: 0,
      lowerbodySize: 0,
    });
    setErrors({
      chestSize: false,
      waistSize: false,
      shoulderSize: false,
      armLength: false,
      forearmSize: false,
      upperarmSize: false,
      bicepSize: false,
      neckSize: false,
      thighSize: false,
      hipSize: false,
      legSize: false,
      kneeSize: false,
      calfSize: false,
      upperbodySize: false,
      lowerbodySize: false,
    });
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
          const leftShoulder: any = pose.keypoints.find(
            (kp) => kp.name === "left_shoulder"
          );
          const rightShoulder: any = pose.keypoints.find(
            (kp) => kp.name === "right_shoulder"
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

          if (leftShoulder?.score > 0.5 && rightShoulder?.score > 0.5) {
            const yLevel = Math.round((leftShoulder.y + rightShoulder.y) / 2);
            const startX = Math.min(leftShoulder.x, rightShoulder.x) - 50;
            const endX = Math.max(leftShoulder.x, rightShoulder.x) + 50;

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
                name: "left_Shoulder",
              });
            }

            if (bodyRightEdge !== null) {
              pose.keypoints.push({
                x: bodyRightEdge - 20,
                y: yLevel,
                score: 0.8,
                name: "right_Shoulder",
              });
            }
          }

          pose.keypoints.forEach(({ x, y, score, name }: any) => {
            if (Number(score) > 0.5) {
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = name.includes("waist") ? "blue" : "red";
              ctx.fillStyle = name.includes("Shoulder") ? "blue" : "red";
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
          (keypoint) => keypoint.name === "left_Shoulder"
        );
        const rightShoulder: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "right_Shoulder"
        );
        const leftChest: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_shoulder"
        );
        const rightChest: any = poses[0].keypoints.find(
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
        const distanceToCamera = estimateDistance(leftChest, rightChest);
        setDistance(distanceToCamera);
        const distanceToEyes = calculateDistance(leftEye, rightEye);

        if (distanceToCamera >= 0.21 && distanceToCamera <= 0.25) {
          const measurementsData = {
            chestSize:
              ((calculateDistance(leftChest, rightChest) * 3.9) /
                distanceToEyes) *
              2,
            shoulderSize:
              ((calculateDistance(leftShoulder, rightShoulder) * 3) /
                distanceToEyes) *
              2,
            waistSize:
              ((calculateDistance(leftWaist, rightWaist) * 3.3) /
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
            `Distance is ${(distanceToCamera < 0.21
              ? distanceToCamera - 0.21
              : distanceToCamera > 0.25
              ? distanceToCamera - 0.25
              : 0
            ).toFixed(2)}
               ${
                 distanceToCamera < 0.21
                   ? "go far."
                   : distanceToCamera > 0.25
                   ? "come closer."
                   : ""
               }`
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

  const handleOpen = () => {
    setCamera(true);
    startCamera();
  };

  const handleClose = () => {
    setCamera(false);
    if (videoRef.current) {
      const tracks: any = stream?.getTracks();
      tracks?.forEach((track: any) => track.stop());
    }
    setHasCamera(true);
    setUserDetected(false);
    setErrorMessage("");
    setCountdown(5);
  };

  const estimateTShirtSize = (chestInCM: number) => {
    if (sex === 0) {
      if (chestInCM < 88) return "Check kids section";
      if (chestInCM >= 88 && chestInCM < 92) return "Small (S)";
      if (chestInCM >= 92 && chestInCM < 96) return "Medium (M)";
      if (chestInCM >= 96 && chestInCM < 100) return "Large (L)";
      if (chestInCM >= 100 && chestInCM < 104) return "XL";
      if (chestInCM >= 104 && chestInCM < 108) return "XXL";
      return "Too large size not available";
    } else {
      if (chestInCM < 76) return "Check kids section";
      if (chestInCM >= 76 && chestInCM < 80) return "Small (S)";
      if (chestInCM >= 80 && chestInCM < 84) return "Medium (M)";
      if (chestInCM >= 84 && chestInCM < 88) return "Large (L)";
      if (chestInCM >= 88 && chestInCM < 92) return "XL";
      if (chestInCM >= 92 && chestInCM < 96) return "XXL";
      return "Too large size not available";
    }
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
      height: height,
      weight: weight,
      sex: sex,
      // yearOfBirth: dob,
      // bodyType: body,
      version: "fitcheck",
      isSatisfied: isSatisfied,
      chestMeasure:
        measurementDialog.chestSize === 0 ? null : measurementDialog.chestSize,
      waistMeasure:
        measurementDialog.waistSize === 0 ? null : measurementDialog.waistSize,
      shoulderMeasure:
        measurementDialog.shoulderSize === 0
          ? null
          : measurementDialog.shoulderSize,
      armMeasure:
        measurementDialog.armLength === 0 ? null : measurementDialog.armLength,
      forearmMeasure:
        measurementDialog.forearmSize === 0
          ? null
          : measurementDialog.forearmSize,
      upperarmMeasure:
        measurementDialog.upperarmSize === 0
          ? null
          : measurementDialog.upperarmSize,
      bicepMeasure:
        measurementDialog.bicepSize === 0 ? null : measurementDialog.bicepSize,
      neckMeasure:
        measurementDialog.neckSize === 0 ? null : measurementDialog.neckSize,
      thighMeasure:
        measurementDialog.thighSize === 0 ? null : measurementDialog.thighSize,
      hipMeasure:
        measurementDialog.hipSize === 0 ? null : measurementDialog.hipSize,
      legMeasure:
        measurementDialog.legSize === 0 ? null : measurementDialog.legSize,
      kneeMeasure:
        measurementDialog.kneeSize === 0 ? null : measurementDialog.kneeSize,
      calfMeasure:
        measurementDialog.calfSize === 0 ? null : measurementDialog.calfSize,
      upperbodyMeasure:
        measurementDialog.upperbodySize === 0
          ? null
          : measurementDialog.upperbodySize,
      lowerbodyMeasure:
        measurementDialog.lowerbodySize === 0
          ? null
          : measurementDialog.lowerbodySize,
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
      setLoading(true);
      const response = await updateSatisfiedStatus(isSatisfied);
      if (response.status.toLowerCase() == "success") {
        setId(response.data.id);
        success &&
          toast.success(
            "Thank you for sharing your measurement!",
            toastOptions
          );
        setLoading(false);
        success && setId(0);
        success && handleClose();
        success && setOpenMeasurementData(false);
        success && setMeasurements([]);
        success && setAverageMeasurements({});
        success && setIsCounting(false);
        success && setCapturedImage(null);
        success && handleCloseMeasurementData();
        success && onClose();
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error("There is some error. Please try again later.", toastOptions);
    }
  };

  const handleCloseMeasurementData = () => {
    setOpenMeasurementData(false);
    setCapturedImage(null);
    setMeasurementDialog({
      chestSize: 0,
      waistSize: 0,
      shoulderSize: 0,
      armLength: 0,
      forearmSize: 0,
      upperarmSize: 0,
      bicepSize: 0,
      neckSize: 0,
      thighSize: 0,
      hipSize: 0,
      legSize: 0,
      kneeSize: 0,
      calfSize: 0,
      upperbodySize: 0,
      lowerbodySize: 0,
    });
    setErrors({
      chestSize: false,
      waistSize: false,
      shoulderSize: false,
      armLength: false,
      forearmSize: false,
      upperarmSize: false,
      bicepSize: false,
      neckSize: false,
      thighSize: false,
      hipSize: false,
      legSize: false,
      kneeSize: false,
      calfSize: false,
      upperbodySize: false,
      lowerbodySize: false,
    });
  };

  const measurementLabels: { [key: string]: string } = {
    chestSize: "Chest",
    waistSize: "Waist",
    shoulderSize: "Shoulder",
    armLength: "Arm Length",
    bicepSize: "Bicep",
    forearmSize: "Forearm",
    upperArmSize: "Upper Arm",
    neckSize: "Neck",
    hipSize: "Hip",
    legSize: "Leg",
    thighSize: "Thigh",
    upperBodySize: "Upper Body",
    lowerBodySize: "Lower Body",
    kneeSize: "Knee",
    calfSize: "Calf",
  };

  const measurementEntries = Object.entries(averageMeasurements);
  const chunkSize = 8; // Split into chunks of 8
  const firstHalf = measurementEntries.slice(0, chunkSize);
  const secondHalf = measurementEntries.slice(chunkSize);

  return (
    <>
      {!camera && !capturedImage && (
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
      {/* <Dialog open={camera} onClose={handleClose} maxWidth="lg" fullWidth> */}
      {/* <DialogTitle className="border-b">
          <Logo />
        </DialogTitle>
        <DialogContent> */}
      {camera && (
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
                  <div className="mt-4 flex flex-col items-center justify-center">
                    <Typography variant="h6">
                      <span className="text-sm md:text-md lg:text-xl">
                        User Detected
                      </span>
                    </Typography>
                    {isCounting && (
                      <Typography variant="h6" color="primary">
                        <span className="text-sm md:text-md lg:text-xl">
                          Countdown: {countdown} seconds
                        </span>
                      </Typography>
                    )}
                  </div>
                ) : (
                  <Typography variant="h6" color="error">
                    <span className="text-sm md:text-md lg:text-xl">
                      No user detected. Please step into the frame.
                    </span>
                  </Typography>
                )}
                {userDetected && errorMessage && (
                  <Typography variant="h6" color="error">
                    <span className="text-sm md:text-md lg:text-xl">
                      {errorMessage}
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
      )}
      {/* </DialogContent> */}
      {/* <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="error">
            Close
          </Button>
        </DialogActions> */}
      {/* </Dialog> */}
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

      {capturedImage && measurements.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="px-10">
            As per Fitcheck Your T-shirt size is&nbsp;
            {estimateTShirtSize(
              Number((averageMeasurements.chestSize * 2.54).toFixed(2))
            )}
            , pant size is&nbsp;
            {Math.round(averageMeasurements.waistSize)}.
          </p>
          <p className="border rounded-lg w-[70%] py-4 flex flex-col items-center justify-center gap-5">
            <b>Are you satisfied with this data?</b>
            <div className="flex gap-5">
              <Button
                variant="contained"
                onClick={() =>
                  loading ? undefined : handleClickSatisfied(true, true)
                }
                className={`my-4 ${
                  loading ? "bg-gray-500" : "!bg-[#6B7CF6] hover:bg-[#6B7CF6] cursor-pointer"
                }`}
                disabled={loading}
              >
                Yes
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setOpenMeasurementData(true);
                  handleClickSatisfied(false, false);
                }}
                className="my-4"
                disabled={loading}
              >
                No
              </Button>
            </div>
          </p>
          {/* <div className="flex flex-col items-start justify-center gap-5">
            <p>
              Chest Size: {averageMeasurements.chestSize}inches,&nbsp;
              {(averageMeasurements.chestSize * 2.54).toFixed(2)}cm
            </p>
            <p>
              Waist Size: {averageMeasurements.waistSize}inches,&nbsp;
              {(averageMeasurements.waistSize * 2.54).toFixed(2)}cm
            </p>
            <p>
              Shoulder Size: {averageMeasurements.shoulderSize}inches,&nbsp;
              {(averageMeasurements.shoulderSize * 2.54).toFixed(2)}cm
            </p>
            <p>
              Arm Length: {averageMeasurements.armLength}inches,&nbsp;
              {(averageMeasurements.armLength * 2.54).toFixed(2)}cm
            </p>
            <p>
              Bicep Size: {averageMeasurements.bicepSize}inches,&nbsp;
              {(averageMeasurements.bicepSize * 2.54).toFixed(2)}cm
            </p>
            <p>
              Forearm Size: {averageMeasurements.forearmSize}inches,&nbsp;
              {(averageMeasurements.forearmSize * 2.54).toFixed(2)}cm
            </p>
            <p>
              Neck Size: {averageMeasurements.neckSize}inches,&nbsp;
              {(averageMeasurements.neckSize * 2.54).toFixed(2)}cm
            </p>
            <p>
              Hip Size: {averageMeasurements.hipSize}inches,&nbsp;
              {(averageMeasurements.hipSize * 2.54).toFixed(2)}cm
            </p>
            <p>
              Leg Size: {averageMeasurements.legSize}inches,&nbsp;
              {(averageMeasurements.legSize * 2.54).toFixed(2)}cm
            </p>
            <p>
              Thigh Size: {averageMeasurements.thighSize}inches,&nbsp;
              {(averageMeasurements.thighSize * 2.54).toFixed(2)}cm
            </p>
            <p>
              Knee Size: {averageMeasurements.kneeSize}inches,&nbsp;
              {(averageMeasurements.kneeSize * 2.54).toFixed(2)}cm
            </p>
            <p>
              Calf Size: {averageMeasurements.calfSize}inches,&nbsp;
              {(averageMeasurements.calfSize * 2.54).toFixed(2)}cm
            </p>
          </div> */}
          <div className="w-full">
            {/* Small Screen: Single Table */}
            <div className="block md:hidden">
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <b>Measurement</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Size (inches)</b>
                      </TableCell>
                      <TableCell align="center">
                        <b>Size (cm)</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {measurementEntries.map(([key, value]: any) => (
                      <TableRow key={key}>
                        <TableCell>{measurementLabels[key] || key}</TableCell>
                        <TableCell align="center">{value}</TableCell>
                        <TableCell align="center">
                          {(value * 2.54).toFixed(2)} cm
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            {/* Large Screen: Two Tables */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
              {[firstHalf, secondHalf].map((data, index) =>
                data.length > 0 ? ( // Only render if there is data
                  <TableContainer key={index} component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <b>Measurement</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Size (inches)</b>
                          </TableCell>
                          <TableCell align="center">
                            <b>Size (cm)</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map(([key, value]: any) => (
                          <TableRow key={key}>
                            <TableCell>
                              {measurementLabels[key] || key}
                            </TableCell>
                            <TableCell align="center">{value}</TableCell>
                            <TableCell align="center">
                              {(value * 2.54).toFixed(2)} cm
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : null
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={openMeasurementData}
        onClose={() => handleCloseMeasurementData()}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Provide your sizes(In CM)</DialogTitle>
        <MeasurementDialog
          handleClickSatisfied={handleClickSatisfied}
          handleCloseMeasurementData={handleCloseMeasurementData}
          measurementDialog={measurementDialog}
          setMeasurementDialog={setMeasurementDialog}
          errors={errors}
          setErrors={setErrors}
        />
      </Dialog>
    </>
  );
};

export default FitCheckYourSize;
