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

const FitCheckYourSize4 = ({
  height,
  camera,
  setCamera,
  weight,
  sex,
  onClose,
  productName,
  measurementMatrix,
  productPart,
  login,
  setLogin,
  setIsRegister,
  setIsLoginClicked,
  getUserData,
}: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastSpokenTimeRef = useRef<Date | null>(null);
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
  const [avgGot, setAvgGot] = useState(false);
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
  const [sideCapturedImage, setSideCapturedImage] = useState<string | null>(
    null
  );
  const [isSideCapture, setIsSideCapture] = useState<boolean>(false);
  const [started, setStarted] = useState(false);

  const startCamera = async () => {
    setId(0);
    setCapturedImage(null);
    setSideCapturedImage(null);
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
    setCapturedImage(imageData);
  };

  const captureSideImage = () => {
    if (!videoRef.current) return;
    const canvas: any = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const sideImageData = canvas.toDataURL("image/png");
    setSideCapturedImage(sideImageData);
    setIsSideCapture(false);
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

        if (!capturedImage) {
          if (distanceToCamera >= 0.31 && distanceToCamera <= 0.35) {
            const measurementsData = {
              chestSize:
                ((calculateDistance(leftChest, rightChest) * 3.9) /
                  distanceToEyes) *
                2,
              shoulderSize:
                ((calculateDistance(leftShoulder, rightShoulder) * 2.6) /
                  distanceToEyes) *
                2,
              waistSize:
                ((calculateDistance(leftWaist, rightWaist) * 2.7) /
                  distanceToEyes) *
                2,
              armLength:
                ((calculateDistance(leftShoulder, leftElbow) +
                  calculateDistance(leftElbow, leftWrist)) *
                  2) /
                distanceToEyes,
              forearmSize:
                (calculateDistance(leftElbow, leftWrist) * 3) / distanceToEyes,
              upperArmSize:
                (calculateDistance(leftShoulder, leftElbow) * 1.5) /
                distanceToEyes,
              bicepSize:
                (calculateDistance(leftShoulder, leftElbow) * 1.6) /
                distanceToEyes,
              // thighSize:
              //   (calculateDistance(leftWaist, leftKnee) * 4) / distanceToEyes,
              thighSize:
                (calculateDistance(leftWaist, leftKnee) * 2.6) / distanceToEyes,
              // upperBodySize:
              //   (calculateDistance(leftEye, leftWaist) * 2.4) / distanceToEyes,
              // lowerBodySize:
              //   ((calculateDistance(leftWaist, leftKnee) +
              //     calculateDistance(leftKnee, leftAnkle)) *
              //     4) /
              //   distanceToEyes,
              upperBodySize: ((height / 2.54) * 45) / 100,
              lowerBodySize: ((height / 2.54) * 55) / 100,
              neckSize:
                (calculateDistance(nose, leftShoulder) * 4.2) / distanceToEyes,
              hipSize:
                ((calculateDistance(leftWaist, rightWaist) * 3.5) /
                  distanceToEyes) *
                2,
              // legSize:
              //   ((calculateDistance(leftWaist, leftKnee) +
              //     calculateDistance(leftKnee, leftAnkle)) *
              //     4) /
              //   distanceToEyes,
              legSize: ((height / 2.54) * 55) / 100,
              kneeSize:
                ((calculateDistance(leftWaist, leftKnee) +
                  calculateDistance(leftKnee, leftAnkle)) *
                  4) /
                  distanceToEyes -
                (calculateDistance(leftWaist, leftKnee) * 4) / distanceToEyes,
              calfSize:
                (calculateDistance(leftKnee, leftAnkle) * 4) /
                distanceToEyes /
                2,
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
              `Distance is ${(distanceToCamera < 0.31
                ? distanceToCamera - 0.31
                : distanceToCamera > 0.35
                ? distanceToCamera - 0.35
                : 0
              ).toFixed(2)}
               ${
                 distanceToCamera < 0.31
                   ? "go far."
                   : distanceToCamera > 0.35
                   ? "come closer."
                   : ""
               }`
            );
          }
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
  }, [poseDetector, hasCamera, capturedImage]);

  const startSpeaking = () => {
    if (started) return;
    setStarted(true);

    speakText("", new Date());
  };

  const handleOpen = () => {
    setCamera(true);
    startSpeaking();
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
    setIsCounting(false);
  };

  const estimateTShirtSize = (chestInCM: number) => {
    const sizeChart = !!measurementMatrix
      ? measurementMatrix
      : [
          { min: 0, max: 87.99, size: "Check kids section" },
          { min: 88, max: 91.99, size: "Small (S)" },
          { min: 92, max: 95.99, size: "Medium (M)" },
          { min: 96, max: 99.99, size: "Large (L)" },
          { min: 100, max: 103.99, size: "XL" },
          { min: 104, max: 107.99, size: "XXL" },
          { min: 108, max: null, size: "Too large size not available" },
        ];

    const size = sizeChart.find(
      ({ min, max }: { min: number; max: number }) =>
        chestInCM >= min && (max === null || chestInCM < max)
    );

    return size ? size.size : "Size not found";
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
    setAvgGot(true);
  };

  useEffect(() => {
    avgGot && handleClickSatisfied(true, true);
  }, [avgGot]);

  useEffect(() => {
    let countdownTimer: any;
    if (isCounting && countdown >= 0) {
      countdownTimer = setInterval(() => {
        if (countdown > 0) {
          setCountdown((prevCountdown) => prevCountdown - 1);
          isSideCapture && countdown === 1 && captureSideImage();
        } else if (!!capturedImage && !sideCapturedImage) {
          setIsCounting(true);
          setCountdown(5);
          setIsSideCapture(true);
        } else if (!capturedImage && !sideCapturedImage) {
          captureImage();
        } else if (!!capturedImage && !isSideCapture && !!sideCapturedImage) {
          handleClose();
        }
      }, 1000);
    }
    if (
      measurements.length > 0 &&
      countdown === 0 &&
      !!capturedImage &&
      !!sideCapturedImage
    ) {
      calculateAverageMeasurements();
    }

    return () => clearInterval(countdownTimer);
  }, [isCounting, countdown, isSideCapture, capturedImage]);

  const updateSatisfiedStatus = async (isSatisfied: boolean) => {
    const token = localStorage.getItem("token");
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
      sideBlob: sideCapturedImage,
    };
    try {
      const response = login
        ? await axios.post(
            `${process.env.NEXT_PUBLIC_SIZE_MEASUREMENT}/measurements`,
            params,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
              },
            }
          )
        : await axios.post(
            `${process.env.NEXT_PUBLIC_SIZE_MEASUREMENT}/measurements`,
            params
          );
      return response.data;
    } catch (error) {
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
        // setId(response.data.id);
        // success &&
        //   toast.success(
        //     "Thank you for sharing your measurement!",
        //     toastOptions
        //   );
        setLoading(false);
        // success && setId(0);
        success && handleClose();
        // success && setOpenMeasurementData(false);
        // success && setMeasurements([]);
        // success && setAverageMeasurements({});
        // success && setIsCounting(false);
        // success && setCapturedImage(null);
        // success && handleCloseMeasurementData();
        success && onClose();
        // success && login && getUserData();
      } else {
        setLoading(false);
        toast.error(response.data.message, toastOptions);
      }
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          // toast.error("Unauthorized! Please log in again.", toastOptions);
          localStorage.removeItem("token");
          setLogin(null);
        } else {
          toast.error(
            `Error: ${error.response.data.message || "Something went wrong!"}`,
            toastOptions
          );
        }
      } else {
        toast.error(
          "There is some error. Please try again later.",
          toastOptions
        );
      }
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

  const measurementEntries = Object.entries(averageMeasurements).filter(
    ([_, value]) => value !== 0
  );

  const sortedEntries = measurementEntries.sort(
    ([keyA], [keyB]) =>
      Object.keys(measurementLabels).indexOf(keyA) -
      Object.keys(measurementLabels).indexOf(keyB)
  );

  const midIndex = Math.ceil(sortedEntries.length / 2);
  const firstHalf = sortedEntries.slice(0, midIndex);
  const secondHalf = sortedEntries.slice(midIndex);

  useEffect(() => {
    const text = "Please rotate 90°.";
    const value = new SpeechSynthesisUtterance(text);
    capturedImage && isCounting && window.speechSynthesis.speak(value);
  }, [capturedImage, isCounting]);

  const speakText = (text: string, now: any) => {
    const synth = window.speechSynthesis;

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      synth.cancel();
      synth.speak(utterance);
      lastSpokenTimeRef.current = now;
    };

    const voices = synth.getVoices();
    if (voices.length > 0) {
      speak();
    } else {
      // Wait for voices to load on iOS
      synth.onvoiceschanged = () => {
        speak();
      };
    }
  };

  useEffect(() => {
    const now = new Date();

    const timeDiffInSeconds = lastSpokenTimeRef.current
      ? (now.getTime() - lastSpokenTimeRef.current.getTime()) / 1000
      : Infinity;

    let shouldSpeak = false;
    let text = "";

    if (
      errorMessage.includes("go far") &&
      !!distance &&
      distance - 0.31 < -0.01
    ) {
      text = "Go Far";
      shouldSpeak = true;
    } else if (
      errorMessage.includes("come closer") &&
      !!distance &&
      distance - 0.35 > 0.01
    ) {
      text = "Come Closer";
      shouldSpeak = true;
    }

    if (shouldSpeak && timeDiffInSeconds > 5) {
      // const value = new SpeechSynthesisUtterance(text);
      // window.speechSynthesis.cancel();
      // window.speechSynthesis.speak(value);
      // lastSpokenTimeRef.current = now;
      speakText(text, now);
    }
  }, [errorMessage, distance]);

  return (
    <>
      {!camera && !capturedImage && (
        <div className="flex flex-col items-center justify-center gap-5 overflow-y-auto">
          <div className="flex flex-col items-start justify-center gap-1 md:gap-2">
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
          <div className="flex items-center justify-center py-4 px-4 mx-4 rounded-lg border border-gray gap-5">
            <p>Turn up your volume to be guided during the scan</p>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              height="40px"
              width="40px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="32"
                d="M126 192H56a8 8 0 0 0-8 8v112a8 8 0 0 0 8 8h69.65a15.93 15.93 0 0 1 10.14 3.54l91.47 74.89A8 8 0 0 0 240 392V120a8 8 0 0 0-12.74-6.43l-91.47 74.89A15 15 0 0 1 126 192zm194 128c9.74-19.38 16-40.84 16-64 0-23.48-6-44.42-16-64m48 176c19.48-33.92 32-64.06 32-112s-12-77.74-32-112m48 272c30-46 48-91.43 48-160s-18-113-48-160"
              ></path>
            </svg>
          </div>
          <div className="flex items-center justify-center py-4 px-4 mx-4 rounded-lg border border-gray gap-5">
            <p>
              Set your phone straight onto a table, around your waist height
            </p>
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 320 512"
              height="40px"
              width="40px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM160 480c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm112-108c0 6.6-5.4 12-12 12H60c-6.6 0-12-5.4-12-12V60c0-6.6 5.4-12 12-12h200c6.6 0 12 5.4 12 12v312z"></path>
            </svg>
          </div>
          <Button
            variant="contained"
            onClick={() => handleOpen()}
            className="mt-4 !bg-[#6B7CF6] !mb-10"
          >
            Open Camera
          </Button>
        </div>
      )}
      {camera && (
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between py-5 gap-4 md:gap-10 md:py-4">
          <div className="flex items-start justify-center gap-5">
            {hasCamera ? (
              <div className="flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  width="100%"
                  height="fit"
                  style={{
                    border:
                      distance &&
                      (distance < 0.31 || distance > 0.35) &&
                      !capturedImage
                        ? "2px solid red"
                        : "2px solid black",
                  }}
                  playsInline
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
                    {capturedImage && isCounting && (
                      <Typography variant="h6" color="primary">
                        <span className="text-sm md:text-md lg:text-xl">
                          Please rotate 90° for the side image.
                        </span>
                      </Typography>
                    )}
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
            {/* <div className="w-[50%] flex items-center justify-end">
              <img src="/pose.png" alt="pose" />
            </div> */}
          </div>
        </div>
      )}
      {/* {capturedImage && sideCapturedImage && !isCounting && (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
          <img
            src={capturedImage}
            alt="Captured"
            style={{ width: "200px", maxHeight: "200px" }}
            className="mb-4"
          />
          <img
            src={sideCapturedImage}
            alt="Side Image"
            style={{ width: "200px", maxHeight: "200px" }}
          />
        </div>
      )} */}

      {capturedImage &&
        sideCapturedImage &&
        !isCounting &&
        measurements.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="px-10">
              {/* As per Fitcheck Your {productName} size is&nbsp;
              {estimateTShirtSize(
                Number(
                  (productPart === "top"
                    ? averageMeasurements.chestSize * 2.54
                    : averageMeasurements.waistSize * 2.54
                  ).toFixed(2)
                )
              )} */}
              We recommend you get size{" "}
              {estimateTShirtSize(
                Number(
                  (productPart === "top"
                    ? averageMeasurements.chestSize * 2.54
                    : averageMeasurements.waistSize * 2.54
                  ).toFixed(2)
                )
              )}
              .
            </p>
            {/* <p className="border rounded-lg w-[70%] py-4 flex flex-col items-center justify-center gap-5">
              <b>Are you satisfied with this data?</b>
              <div className="flex gap-5">
                <Button
                  variant="contained"
                  onClick={() =>
                    loading ? undefined : handleClickSatisfied(true, true)
                  }
                  className={`my-4 ${
                    loading ? "bg-gray-500" : "!bg-[#1565c0] cursor-pointer"
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
            </p> */}
            {/* <div className="w-full">
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

              <div className="hidden md:grid md:grid-cols-2 gap-4 mt-4">
                {[firstHalf, secondHalf].map((data, index) =>
                  data.length > 0 ? (
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
                          {data.map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell>
                                {measurementLabels[key] || key}
                              </TableCell>
                              <TableCell align="center">
                                {value as number}
                              </TableCell>
                              <TableCell align="center">
                                {((value as number) * 2.54).toFixed(2)} cm
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : null
                )}
              </div>
            </div> */}
            {/* <Button
              variant="contained"
              onClick={() => {
                parent.postMessage({ type: "addItemToCart" }, "*");
              }}
              className="mt-6 !bg-[#6B7CF6]"
            >
              Add{" "}
              {estimateTShirtSize(
                Number(
                  (productPart === "top"
                    ? averageMeasurements.chestSize * 2.54
                    : averageMeasurements.waistSize * 2.54
                  ).toFixed(2)
                )
              )}{" "}
              Size to Cart
            </Button> */}
            <Button
              variant="contained"
              onClick={() => {
                parent.postMessage({ type: "closeIframeWindow" }, "*");
              }}
              className="mt-6 !bg-[#6B7CF6]"
            >
              Return to shopping
            </Button>
            {!login && (
              <>
                <Button
                  variant="contained"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setLogin(null);
                    setIsRegister(true);
                    setIsLoginClicked(1);
                  }}
                  className="mt-6 !bg-[#6B7CF6]"
                >
                  Create an account
                </Button>
                <p>To use your measurements anytime you shop online</p>
              </>
            )}
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

export default FitCheckYourSize4;
