import { Button, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Voice from "tsconfig.json/assets/icons/Voice`";
import Mobile from "tsconfig.json/assets/icons/Mobile`";

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

const calculateDistance = (point1: Keypoint, point2: Keypoint) => {
  if (!point1 || !point2) return 0;
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const estimateDistance = (shoulderLeft: Keypoint, shoulderRight: Keypoint) => {
  const shoulderWidth = calculateDistance(shoulderLeft, shoulderRight);
  const scalingFactor = 0.15;
  const estimatedDistance = 200 / shoulderWidth;
  return estimatedDistance * scalingFactor;
};

const FitCheckYourSize4 = ({
  login,
  setLogin,
  camera,
  setCamera,
  videoRef,
  height,
  weight,
  sex,
  onClose,
  measurementMatrix,
  productPart,
  setIsRegister,
  setIsLoginClicked,
  getUserData,
  setActiveTab,
}: any) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastSpokenTimeRef = useRef<Date | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
  const [sideCapturedImage, setSideCapturedImage] = useState<string | null>(
    null
  );
  const [isSideCapture, setIsSideCapture] = useState<boolean>(false);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [averageMeasurements, setAverageMeasurements] = useState<
    Measurements | any
  >({});
  const [avgGot, setAvgGot] = useState(false);
  const [id, setId] = useState<number>(0);
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
  const [device, setDevice] = useState("desktop");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    function updateDevice() {
      const width = window.innerWidth;
      if (width <= 768) setDevice("mobile");
      else if (width <= 1024) setDevice("tablet");
      else setDevice("desktop");
    }

    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  const startCamera = async () => {
    setId(0);
    setCapturedImage(null);
    setSideCapturedImage(null);
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
        const leftElbow: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_elbow"
        );
        const leftWrist: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_wrist"
        );
        const leftKnee: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_knee"
        );
        const leftAnkle: any = poses[0].keypoints.find(
          (keypoint) => keypoint.name === "left_ankle"
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
              thighSize:
                (calculateDistance(leftWaist, leftKnee) * 2.6) / distanceToEyes,
              upperBodySize: ((height / 2.54) * 45) / 100,
              lowerBodySize: ((height / 2.54) * 55) / 100,
              neckSize:
                (calculateDistance(nose, leftShoulder) * 4.2) / distanceToEyes,
              hipSize:
                ((calculateDistance(leftWaist, rightWaist) * 3.5) /
                  distanceToEyes) *
                2,
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
              `${
                distanceToCamera < 0.31
                  ? "STEP BACK"
                  : distanceToCamera > 0.35
                  ? "STEP FORWARD"
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
    speck("", new Date());
  };

  const handleOpen = () => {
    setCamera(true);
    startSpeaking();
    startCamera();
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
      average[key] = Math.round(value / measurements.length);
    });

    setAverageMeasurements({
      ...average,
    });
    setAvgGot(true);
  };

  useEffect(() => {
    avgGot && handleClickSatisfied();
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

  const updateSatisfiedStatus = async () => {
    const token = localStorage.getItem("token");
    const params = {
      ...averageMeasurements,
      height: height,
      weight: weight,
      sex: sex,
      version: "fitcheck",
      isSatisfied: true,
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
    parent.postMessage(
      {
        type: "fitcheckUserSize",
        chest: averageMeasurements.chestSize * 2.54,
        waist: averageMeasurements.waistSize * 2.54,
      },
      "*"
    );
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

  const handleClickSatisfied = async () => {
    try {
      const response = await updateSatisfiedStatus();
      if (response.status.toLowerCase() == "success") {
        handleClose();
        onClose();
      } else {
        toast.error(response.data.message, toastOptions);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
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

  const playAudio = (src: string) => {
    if (!audioRef.current) return;
    audioRef.current.src = `/audio/${src}`;
    audioRef.current.load();
    audioRef.current.play().catch((error) => {
      console.error("Audio play error:", error);
    });
  };

  const speck = (file: string, now: Date) => {
    playAudio(file);
    lastSpokenTimeRef.current = now;
  };

  useEffect(() => {
    capturedImage &&
      isCounting &&
      playAudio(`/audio/Please_turn_to_the_side.mp3`);
  }, [capturedImage, isCounting]);

  useEffect(() => {
    capturedImage &&
      !isCounting &&
      sideCapturedImage &&
      playAudio(`/audio/Your_scan_is_completed.mp3`);
  }, [capturedImage, isCounting, sideCapturedImage]);

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
      errorMessage.includes("STEP BACK") &&
      !!distance &&
      distance - 0.31 < -0.01
    ) {
      text = "Please_step_back.mp3";
      shouldSpeak = true;
    } else if (
      errorMessage.includes("STEP FORWARD") &&
      !!distance &&
      distance - 0.35 > 0.01
    ) {
      text = "Please_step_forward.mp3";
      shouldSpeak = true;
    }

    if (shouldSpeak && timeDiffInSeconds > 5) {
      speck(text, now);
    }
  }, [errorMessage, distance]);

  useEffect(() => {
    const audio = document.createElement("audio");
    audioRef.current = audio;
    audio.setAttribute("playsinline", "true"); // for iOS
    document.body.appendChild(audio);

    return () => {
      if (audioRef.current) {
        document.body.removeChild(audioRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-between w-full h-full min-h-[60vh]">
      {!camera && !capturedImage && (
        <div className="flex flex-col items-center justify-center py-5 md:py-0 gap-4 overflow-y-auto my-10">
          <div className="flex items-center justify-center py-4 px-4 mx-4 rounded-lg border border-gray gap-5 max-w-[80%]">
            <Voice />
            <p>Turn up your volume to be guided during the scan</p>
          </div>
          <div className="flex items-center justify-center py-4 px-4 mx-4 rounded-lg border border-gray gap-5 max-w-[80%]">
            <Mobile />
            <p>
              Set your phone straight onto a table, around your waist height
            </p>
          </div>
          <Button
            variant="contained"
            onClick={() => handleOpen()}
            onTouchStart={handleOpen}
            className="!bg-[#6B7CF6] hover:!bg-[#4e5ab6] mt-6"
          >
            Open Camera
          </Button>
        </div>
      )}
      {camera && (
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between py-5 gap-4 md:gap-10 md:py-4">
          <div className="flex items-start justify-center gap-5">
            {hasCamera ? (
              <div
                className={`fixed ${
                  device !== "desktop" ? "top-[7%]" : "top-[50.70px]"
                } left-0 w-screen h-screen overflow-hidden`}
              >
                <video
                  ref={videoRef}
                  className={`w-full ${
                    device !== "desktop" ? "h-[93%]" : "h-[94.5%]"
                  } object-fill`}
                  style={{
                    border:
                      distance &&
                      (distance < 0.31 || distance > 0.35) &&
                      !capturedImage
                        ? "2px solid red"
                        : "2px solid black",
                    zIndex: 1,
                  }}
                  playsInline
                  autoPlay
                  muted
                />
                <canvas
                  ref={canvasRef}
                  width="0px"
                  height="0px"
                  className="hidden"
                />
                <div className="absolute top-8 z-10 w-full text-center px-4 py-2 rounded-md">
                  {hasCamera && userDetected ? (
                    <>
                      {capturedImage && isCounting && (
                        <Typography variant="h6" color="primary">
                          <span className="text-2xl md:text-6xl lg:text-7xl font-bold text-white">
                            ROTATE TO THE SIDE
                          </span>
                        </Typography>
                      )}
                      {isCounting && (
                        <Typography variant="h6" color="primary">
                          <span className="text-2xl md:text-6xl lg:text-7xl font-bold">
                            Countdown: {countdown} seconds
                          </span>
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="h6" color="error">
                      <span className="text-2xl md:text-6xl lg:text-7xl font-bold text-white">
                        No user detected. Please step into the frame.
                      </span>
                    </Typography>
                  )}

                  {userDetected && errorMessage && (
                    <Typography variant="h6" color="error">
                      <span className="text-2xl md:text-6xl lg:text-7xl font-bold text-white">
                        {errorMessage}
                      </span>
                    </Typography>
                  )}
                </div>
              </div>
            ) : (
              <Typography variant="h6" color="error">
                <span className="text-lg md:text-4xl lg:text-5xl font-bold">
                  No Camera Found
                </span>
              </Typography>
            )}
          </div>
        </div>
      )}

      {capturedImage &&
        sideCapturedImage &&
        !isCounting &&
        measurements.length > 0 && (
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="px-8 pt-6 text-lg lg:text-3xl">
              We recommend you get size{" "}
              <span className="text-[#6B7CF6]">
                {estimateTShirtSize(
                  Number(
                    (productPart === "top"
                      ? averageMeasurements.chestSize * 2.54
                      : averageMeasurements.waistSize * 2.54
                    ).toFixed(2)
                  )
                )}
              </span>
              .
            </p>
            <Button
              variant="contained"
              onClick={() => {
                parent.postMessage({ type: "closeIframeWindow" }, "*");
              }}
              className="mt-6 !bg-[#6B7CF6] hover:!bg-[#4e5ab6]"
            >
              Return to shopping
            </Button>
            {login && (
              <Button
                variant="outlined"
                onClick={() => getUserData()}
                className="rounded-md border-[#6B7CF6] text-[#6B7CF6] mt-6"
              >
                Change my metrics
              </Button>
            )}
            {!login && (
              <>
                <div className="w-full">
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex-grow h-px bg-gray-300" />
                    <div className="text-center text-gray-400 text-sm">OR</div>
                    <div className="flex-grow h-px bg-gray-300" />
                  </div>
                </div>
                <p className="text-md lg:text-xl text-center">
                  Create an Account to always have your size
                </p>
                <Button
                  variant="outlined"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setLogin(null);
                    setIsRegister(true);
                    setIsLoginClicked(0);
                    setActiveTab(1);
                  }}
                  className="border-[#6B7CF6] text-[#6B7CF6]"
                >
                  Create an account now
                </Button>
              </>
            )}
          </div>
        )}
    </div>
  );
};

export default FitCheckYourSize4;
