import { Button, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

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
        <div className="flex flex-col items-center justify-center py-5 md:py-0 gap-8 overflow-y-auto my-10">
          <div className="flex items-center justify-center py-4 px-4 mx-4 rounded-lg border border-gray gap-5 max-w-[80%]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100"
              height="100"
              viewBox="0 0 134 130"
              fill="none"
            >
              <rect width="134" height="130" rx="4" fill="#5F5BB2" />
              <path
                d="M77.7557 75.7124C83.7259 75.7124 88.5657 70.9161 88.5657 64.9995C88.5657 59.083 83.7259 54.2866 77.7557 54.2866C71.7856 54.2866 66.9458 59.083 66.9458 64.9995C66.9458 70.9161 71.7856 75.7124 77.7557 75.7124Z"
                fill="#0C1959"
              />
              <path
                d="M47.2339 82.9903H22.2783C19.08 82.9903 16.4924 80.426 16.4924 77.2563V52.7425C16.4924 49.5728 19.08 47.0085 22.2783 47.0085H47.2339V82.9903Z"
                fill="#0C1959"
              />
              <path
                d="M75.6828 112L43.356 82.9904V47.0086L75.6828 17.9988V112Z"
                fill="#D6DDEA"
              />
              <path
                d="M76.7742 114C75.6555 114 74.7563 113.102 74.7563 112V17.9988C74.7563 16.8901 75.6623 15.999 76.7742 15.999C77.8929 15.999 78.7921 16.8969 78.7921 17.9988V111.993C78.7921 113.102 77.8929 114 76.7742 114Z"
                fill="#BCC7D8"
              />
              <path
                d="M91.7914 78.7051C91.2767 78.7051 90.7551 78.5215 90.3433 78.1542C89.4441 77.3583 89.3618 75.9912 90.1648 75.1001C92.7386 72.2366 94.1113 68.5364 94.0358 64.6865C93.9534 60.8231 92.416 57.1773 89.705 54.4089C88.8676 53.5519 88.8813 52.1779 89.753 51.3481C90.6178 50.5183 92.0042 50.5319 92.8416 51.3957C96.3282 54.9531 98.3049 59.6395 98.4078 64.6049C98.5108 69.5498 96.74 74.3043 93.4318 77.9841C92.9926 78.4602 92.3954 78.7051 91.7914 78.7051Z"
                fill="#BCC7D8"
              />
              <path
                d="M99.0528 86.7723C98.5792 86.7723 98.1056 86.6362 97.6938 86.3505C96.6094 85.6023 96.3417 84.1263 97.0899 83.0516C101.029 77.4265 103.075 71.0736 102.999 64.6799C102.924 58.2793 100.721 51.9468 96.63 46.3693C95.8544 45.3082 96.0878 43.8254 97.1585 43.0568C98.2292 42.2882 99.7254 42.5195 100.501 43.5805C105.175 49.9607 107.694 57.2318 107.783 64.6186C107.872 71.9986 105.532 79.3106 101.023 85.752C100.556 86.4186 99.8146 86.7723 99.0528 86.7723Z"
                fill="#BCC7D8"
              />
              <path
                d="M105.937 95.6215C105.463 95.6215 104.99 95.4855 104.578 95.1998C103.494 94.4516 103.226 92.9756 103.974 91.9009C106.918 87.6974 109.156 83.2218 110.632 78.5829C112.08 74.0325 112.78 69.346 112.725 64.6595C112.67 59.9663 111.853 55.2934 110.295 50.7634C108.703 46.1449 106.349 41.6829 103.295 37.5202C102.519 36.4591 102.752 34.9763 103.823 34.2077C104.894 33.4391 106.39 33.6703 107.166 34.7314C110.501 39.2819 113.075 44.1656 114.818 49.233C116.541 54.2391 117.447 59.4085 117.509 64.6051C117.571 69.7949 116.795 74.9779 115.196 80.0113C113.576 85.0991 111.126 90.01 107.907 94.6081C107.44 95.2678 106.692 95.6215 105.937 95.6215Z"
                fill="#BCC7D8"
              />
              <path
                d="M20.1506 66.4621V53.2393C20.1506 51.8449 21.29 50.709 22.7038 50.709H34.0217C34.0217 50.7158 24.4678 54.8241 20.1506 66.4621Z"
                fill="#374FAA"
              />
            </svg>
            <p>Turn up your volume to be guided during the scan</p>
          </div>
          <div className="flex items-center justify-center py-4 px-4 mx-4 rounded-lg border border-gray gap-5 max-w-[80%]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100"
              height="100"
              viewBox="0 0 130 130"
              fill="none"
            >
              <g clip-path="url(#clip0_19_582)">
                <path d="M130 0H0V130H130V0Z" fill="#5F5BB2" />
                <path
                  d="M123.905 90.3645L100.071 76.6134C98.2512 75.5734 95.1023 75.6889 93.0223 76.9023L70.4023 89.96C68.3223 91.1734 68.0912 92.9934 69.8823 94.0334L85.7423 103.191H81.7845V108.507H96.7201C98.1356 108.507 99.609 108.189 100.765 107.524L123.385 94.4667C125.493 93.2534 125.696 91.4045 123.905 90.3645Z"
                  fill="#3C388A"
                />
                <path
                  d="M110.009 84.9044L99.0021 93.8311L95.1888 96.9222L81.091 108.333L47.3777 88.8333C46.7999 88.4578 46.4243 87.6778 46.4243 86.5222V85.3378C46.4243 83.2289 47.6954 80.8022 49.2843 79.8778L57.5177 75.14L60.0599 76.6133L62.111 75.4289V72.5111L74.331 65.4622C75.1688 64.9711 75.9199 65.0289 76.4399 65.4911L110.009 84.9044Z"
                  fill="#FFBE55"
                />
                <path
                  d="M99.0023 93.831L95.1889 96.9221L93.7445 96.0554L68.5823 81.5532L60.0601 76.6132L62.1112 75.4577V72.511L95.7667 91.9532L99.0023 93.831Z"
                  fill="#775438"
                />
                <path
                  d="M87.3599 103.249L81.091 108.333L47.3777 88.8332C46.7999 88.4576 46.4243 87.6776 46.4243 86.5221V85.3376C46.4243 83.691 47.2043 81.8421 48.3021 80.6865L87.3599 103.249Z"
                  fill="#FF9E00"
                />
                <path
                  d="M107.958 93.7155L82.9401 108.16C81.3512 109.084 80.0801 108.102 80.0801 105.993V104.809C80.0801 102.7 81.3512 100.273 82.9401 99.3488L107.958 84.9043C109.547 83.9799 110.818 84.9621 110.818 87.071V88.2555C110.789 90.3643 109.518 92.8199 107.958 93.7155Z"
                  fill="#D56851"
                />
                <path
                  d="M95.7666 91.9532V94.8999L62.1111 75.4577V72.511L95.7666 91.9532Z"
                  fill="#FF9E00"
                />
                <path
                  d="M95.7667 94.8997L93.7445 96.0553L93.7156 96.0842L68.5823 81.5531L60.0601 76.6131L62.1112 75.4575L95.7667 94.8997Z"
                  fill="#FFBB00"
                />
                <path
                  d="M98.8867 35.3599L94.7844 89.7866C94.7555 90.2777 94.64 90.7111 94.4667 91.0577C94.4667 91.0577 94.4667 91.0577 94.4667 91.0866C94.4667 91.1155 94.4378 91.1444 94.4378 91.1444C93.9755 92.0688 93.3689 92.6755 92.7333 93.1088C91.8378 93.6866 90.8844 93.9177 90.1911 93.9755L90.0467 93.8888L89.18 93.3688L89.5555 91.231L89.6711 90.5955L68.9289 78.6355C67.3978 77.7688 66.3 75.3999 66.4733 73.3777L70.4311 20.8288L67.4267 19.4999C67.4267 19.4999 69.0444 16.1777 72.5689 16.5244C72.6555 16.5244 72.7422 16.5533 72.8578 16.5533H72.8867C73.1178 16.611 73.3778 16.6977 73.6089 16.8422L96.46 30.0444C97.9333 30.9688 99.06 33.3377 98.8867 35.3599Z"
                  fill="#D9EFFF"
                />
                <path
                  d="M93.9756 42.3801L98.54 39.9245L98.6267 38.7979L93.5422 41.5134L93.9756 42.3801Z"
                  fill="#66788C"
                />
                <path
                  d="M89.0932 89.2378L95.0732 86.06L95.1599 84.9333L88.6599 88.3711L89.0932 89.2378Z"
                  fill="#66788C"
                />
                <path
                  d="M95.4199 37.2088L91.3177 91.6643C91.2888 91.8954 91.2599 92.0977 91.231 92.2999C91.0288 93.1377 90.5955 93.7154 90.0466 93.9754L68.5821 81.5821L63.8444 78.8377C63.3533 77.9999 63.0355 76.9888 63.0066 76.0065C63.0066 75.7754 63.0066 75.5443 63.0066 75.3132L67.1088 20.8865C67.2533 18.8643 68.611 17.9399 70.1133 18.8065L92.9644 32.0088C94.4666 32.8177 95.5933 35.1865 95.4199 37.2088Z"
                  fill="#38424D"
                />
                <path
                  d="M91.8088 34.638L70.8065 22.5046C69.391 21.6957 68.1488 22.5624 68.0043 24.4402L64.191 74.8224C64.0465 76.7002 65.0576 78.8668 66.4732 79.6757L87.4754 91.8091C88.891 92.618 90.1332 91.7513 90.2776 89.8735L94.091 39.4913C94.2354 37.6135 93.1954 35.4468 91.8088 34.638Z"
                  fill="black"
                />
                <path
                  d="M93.0509 36.6023C92.6465 35.8512 92.1265 35.2734 91.5776 34.9556L70.5754 22.8223C70.2287 22.6201 69.7087 22.4467 69.2465 22.6779C68.7843 22.9379 68.4665 23.5734 68.4087 24.4112L64.5954 74.8223C64.5376 75.7467 64.7687 76.7867 65.2309 77.7112C65.6354 78.4623 66.1554 79.0401 66.7043 79.3579L87.7065 91.4912C88.0532 91.6934 88.5732 91.8667 89.0354 91.6356C89.4976 91.3756 89.8154 90.7401 89.8732 89.9023L93.6865 39.5201C93.7443 38.5667 93.5132 37.5267 93.0509 36.6023Z"
                  fill="white"
                />
                <path
                  d="M83.6045 27.82L77.3934 24.2378C77.1622 24.0933 76.96 24.2378 76.9311 24.5555C76.9022 24.8733 77.0756 25.22 77.3067 25.3644L83.5178 28.9467C83.7489 29.0911 83.9511 28.9467 83.98 28.6289C83.98 28.3111 83.8356 27.9355 83.6045 27.82Z"
                  fill="black"
                />
                <path
                  d="M86.1178 29.8999C86.1467 29.6399 85.9733 29.3221 85.7422 29.1777C85.5111 29.0332 85.3089 29.1488 85.28 29.4088C85.2511 29.6688 85.4244 29.9866 85.6556 30.131C85.8867 30.2754 86.0889 30.1599 86.1178 29.8999Z"
                  fill="#26262E"
                />
                <path
                  d="M85.9733 29.8133C85.9733 29.64 85.8866 29.4089 85.7133 29.3222C85.5688 29.2355 85.4244 29.2933 85.3955 29.4955C85.3955 29.6689 85.4822 29.9 85.6555 29.9866C85.8288 30.0733 85.9444 29.9866 85.9733 29.8133Z"
                  fill="#ACDDFF"
                />
                <path
                  d="M85.8578 29.7557C85.8578 29.669 85.8 29.5246 85.7134 29.4957C85.6267 29.4379 85.54 29.4957 85.54 29.5823C85.54 29.669 85.5978 29.8134 85.6845 29.8423C85.7712 29.9001 85.8289 29.8423 85.8578 29.7557Z"
                  fill="#D9EFFF"
                />
                <path
                  d="M87.2733 30.5933C87.3022 30.3333 87.1288 30.0155 86.8977 29.871C86.6666 29.7266 86.4644 29.8421 86.4355 30.1021C86.4066 30.3621 86.58 30.6799 86.8111 30.8244C87.0711 30.9688 87.2733 30.8533 87.2733 30.5933Z"
                  fill="#26262E"
                />
                <path
                  d="M87.1579 30.5067C87.1579 30.3333 87.0712 30.1022 86.8978 30.0156C86.7534 29.9289 86.609 29.9867 86.5801 30.1889C86.5801 30.3622 86.6667 30.5933 86.8401 30.68C86.9845 30.7667 87.129 30.68 87.1579 30.5067Z"
                  fill="#ACDDFF"
                />
                <path
                  d="M87.0133 30.4488C87.0133 30.3621 86.9556 30.2177 86.8689 30.1888C86.7822 30.131 86.6956 30.1888 86.6956 30.2755C86.6956 30.3621 86.7533 30.5066 86.84 30.5355C86.9267 30.5643 87.0133 30.5355 87.0133 30.4488Z"
                  fill="#D9EFFF"
                />
                <path
                  d="M55.5534 121.189C51.0467 123.789 43.7379 123.76 39.2312 121.16C34.6956 118.56 34.6956 114.342 39.1734 111.742C43.6801 109.142 50.989 109.171 55.4956 111.771C60.0312 114.371 60.0601 118.589 55.5534 121.189Z"
                  fill="#3C388A"
                />
                <path
                  d="M29.5534 84.3267C29.5823 84.2689 29.6112 84.24 29.6401 84.1823C29.9868 83.8067 30.4201 83.4889 30.7957 83.1423C31.0846 82.8823 31.3446 82.5934 31.5468 82.2467C31.749 81.9 31.8646 81.5534 32.009 81.1778C32.1534 80.7734 32.2979 80.34 32.4134 79.9356C32.6734 79.0978 32.8757 78.26 33.049 77.3934C33.2223 76.5845 33.3379 75.7467 33.5401 74.9667C33.7134 74.1867 34.0601 73.4645 34.4068 72.7712C35.0712 71.3845 35.2157 69.7956 35.8223 68.4089C35.8801 68.6112 36.1112 68.7267 36.3134 68.8134C36.7468 68.9867 37.209 69.0445 37.6712 69.0156C38.0179 68.9867 38.3934 68.9289 38.6823 69.1023C38.8845 69.2178 39.0001 69.42 39.029 69.6223C39.0868 69.9112 38.9134 70.2289 38.7979 70.4889C38.6534 70.8356 38.4512 71.1823 38.2779 71.5289C37.9312 72.2512 37.7001 73.0312 37.469 73.7823C37.0934 75.0823 36.689 76.3534 36.1401 77.5956C35.909 78.0578 35.649 78.52 35.389 78.9823C34.9846 79.7045 33.4246 82.5067 33.3379 82.68C33.2512 82.8245 33.1934 82.9978 33.1934 83.1712C33.1934 83.4312 33.2223 83.6912 33.1357 83.9512C32.9912 84.4423 32.529 84.76 32.2979 85.2223C32.269 85.3089 32.2401 85.3956 32.2979 85.4823C32.3268 85.5112 32.3846 85.54 32.4423 85.5689C32.5579 85.6556 32.529 85.8578 32.4423 85.9445C32.3557 86.06 32.1823 86.0889 32.0668 86.1178C32.009 86.1178 31.9512 86.1467 31.9223 86.1756C31.8646 86.2045 31.8357 86.2623 31.7779 86.2912C31.6046 86.3778 31.4023 86.2912 31.2579 86.1756C31.229 86.1467 31.2001 86.1178 31.1712 86.1178C31.1134 86.0889 31.0268 86.1178 30.9401 86.1467C30.709 86.2334 30.449 86.1756 30.3046 86.0023C30.2757 85.9734 30.2468 85.9156 30.189 85.8867C30.1312 85.8578 30.1023 85.8289 30.0446 85.8C29.8712 85.7134 29.7557 85.5689 29.669 85.4245C29.5245 85.0778 29.409 84.6445 29.5534 84.3267Z"
                  fill="#FFB78C"
                />
                <path
                  d="M37.9022 62.5157C37.3822 63.1801 37.0644 64.0179 36.7467 64.8268C36.5444 65.4334 35.9667 67.2823 35.88 67.6001C35.8222 67.889 35.6778 68.1201 35.7067 68.4379C35.7355 68.5534 35.7644 68.669 35.7933 68.7846C36.0533 69.4201 36.4867 69.969 37.0355 70.3734C37.5844 70.7779 38.2489 71.009 38.9422 71.0379C39.1155 71.0379 39.26 71.0379 39.4333 71.009C39.4333 70.5179 39.3467 70.0557 39.3467 69.5646C39.3467 69.0446 39.3755 68.4957 39.4044 67.9757C39.4911 66.9068 39.6355 65.8379 39.78 64.769C39.8667 64.1334 40.04 63.4401 40.04 62.7757C40.0689 62.5157 40.0978 62.2268 40.0689 61.9668C40.0689 61.909 39.9822 61.3312 40.0978 61.3312C39.26 61.3023 38.4511 61.8223 37.9022 62.5157C37.9022 62.4868 37.9022 62.4868 37.9022 62.5157Z"
                  fill="#D9EFFF"
                />
                <path
                  d="M45.9044 110.702C45.9333 110.702 45.9333 110.76 45.9333 110.789C45.9333 110.818 45.9333 110.847 45.9622 110.876C45.9911 110.933 45.9911 110.991 45.9911 111.078C45.9911 111.136 45.9622 111.222 45.9622 111.28C45.9333 111.396 45.8755 111.511 45.76 111.598C45.6444 111.685 45.5289 111.627 45.3844 111.598C45.0955 111.54 44.7777 111.569 44.46 111.627C43.42 111.771 42.4089 112.118 41.4555 112.638C40.9933 112.898 40.5889 113.158 40.2422 113.562C40.1844 113.62 40.1844 113.678 40.1266 113.678C40.0689 113.678 39.9822 113.678 39.9533 113.62C39.8666 113.562 39.8089 113.476 39.8089 113.389C39.5777 113.765 39.4044 114.198 39.3177 114.631C39.26 114.949 39.26 115.296 39.3177 115.614C39.3755 115.902 39.4911 116.191 39.6933 116.422C40.2422 117.058 41.34 116.74 41.9466 116.336C42.5533 115.902 42.8422 115.18 43.42 114.747C43.8822 114.4 44.4311 114.285 44.9222 113.996C45.2977 113.765 45.5866 113.418 45.7889 113.042C46.02 112.638 46.1644 112.147 46.2222 111.685C46.2222 111.656 46.2222 111.656 46.2222 111.627C46.2222 111.569 46.2222 111.511 46.2222 111.425C46.2222 111.367 46.2222 111.309 46.1933 111.251C46.1644 111.136 46.1355 111.049 46.1066 110.962C46.0777 110.818 45.9911 110.731 45.9044 110.702Z"
                  fill="#FF2D81"
                />
                <path
                  d="M44.489 110.558C43.449 110.702 42.4379 111.049 41.4845 111.569C41.0223 111.829 40.6179 112.089 40.2712 112.493C39.9534 112.898 39.6934 113.331 39.5201 113.793C39.3179 114.313 39.3468 114.92 39.7223 115.353C40.2712 115.989 41.369 115.671 41.9756 115.267C42.5823 114.833 42.8712 114.111 43.449 113.678C43.9112 113.331 44.4601 113.216 44.9512 112.927C45.4712 112.58 45.8468 112.06 46.049 111.453C46.1068 111.28 46.1356 111.078 46.0779 110.905C46.0201 110.731 45.8756 110.673 45.7023 110.616C45.2979 110.471 44.8934 110.5 44.489 110.558Z"
                  fill="#ACDDFF"
                />
                <path
                  d="M46.2222 91.8957C46.1933 91.5779 46.0778 91.289 45.9622 91.0001C45.5578 89.8734 45.0667 88.6601 44.1133 87.9668C43.5067 87.5334 42.7267 87.3312 41.9756 87.4179C41.4267 87.4757 40.9067 87.7068 40.5022 88.0823C39.6645 88.949 39.9822 90.3646 40.1267 91.4334C40.5889 95.0157 40.82 98.9157 39.8378 102.411C39.5489 103.451 39.4333 104.433 39.4333 105.502C39.4333 106.051 39.4622 106.571 39.52 107.12C39.6067 108.276 39.7222 109.431 39.8956 110.558C39.9822 111.136 40.04 111.713 40.1556 112.32C40.1845 112.436 40.1556 112.609 40.2422 112.725C40.3289 112.84 40.5311 112.898 40.6756 112.927C41.1667 113.013 41.6867 112.927 42.0911 112.638C42.38 112.436 42.5533 112.147 42.5822 111.8C42.6111 111.54 42.6111 111.251 42.64 110.991C42.6689 110.471 42.6978 109.951 42.7556 109.431C42.8711 108.189 43.1022 106.947 43.3622 105.705C43.4778 105.098 43.5933 104.491 43.7667 103.885C43.9111 103.307 44.1711 102.787 44.3156 102.209C44.5178 101.4 44.6045 100.562 44.7489 99.7246C44.8933 98.9446 46.0489 94.2934 46.2511 92.7046C46.2222 92.4734 46.2511 92.1846 46.2222 91.8957Z"
                  fill="#FFB78C"
                />
                <path
                  d="M46.1646 90.2489C45.9046 89.5845 45.6735 88.8912 45.4713 88.1978C45.2401 87.4756 45.0379 86.7534 44.8357 86.0601C44.6624 85.4245 44.4024 84.8467 44.2868 84.2112C44.0557 83.0267 43.7957 81.7845 42.9579 80.9467C42.5535 80.5712 42.0624 80.3112 41.5424 80.1378C41.3113 80.0801 41.0513 80.0512 40.8779 79.9356C40.6757 79.8201 40.4735 79.5601 40.329 79.3867C40.1557 79.7623 40.1557 80.1956 40.0402 80.6001C39.9246 81.0334 39.7513 81.4667 39.6068 81.9001C39.289 82.7667 38.9713 83.6334 38.8846 84.5578C38.7979 85.7712 39.1446 86.9556 39.4624 88.1112C39.6357 88.7178 39.7802 89.2956 39.8668 89.9023C39.9246 90.3934 39.8957 91.0001 40.2135 91.4045C40.589 91.8667 41.0513 92.2423 41.5713 92.5023C42.1779 92.8201 42.8713 92.9934 43.5646 93.0512C44.5179 93.1378 45.5579 93.0223 46.2802 92.3867C47.0024 91.8667 46.4246 90.9134 46.1646 90.2489Z"
                  fill="#FF2D81"
                />
                <path
                  d="M51.3645 117.347C50.8445 117.433 50.3534 117.289 49.8045 117.26C49.5734 117.26 49.4578 117.318 49.2556 117.405C49.0823 117.462 48.9378 117.26 48.7356 117.318C48.6778 117.347 48.6201 117.376 48.5912 117.433C48.389 117.607 48.2156 117.809 48.0712 118.04C47.9845 118.156 47.9267 118.271 47.869 118.387C47.8401 118.416 47.8401 118.502 47.7823 118.502C47.7245 118.531 47.6667 118.473 47.6378 118.445C47.609 118.387 47.609 118.329 47.609 118.271C47.4934 118.647 47.4067 119.022 47.4067 119.398C47.4067 119.513 47.4067 119.6 47.4067 119.716C47.4645 120.322 47.6378 121.276 48.3601 121.42C48.7645 121.507 49.2267 121.449 49.6023 121.247C49.8912 121.102 50.1223 120.9 50.3823 120.756C51.0178 120.438 51.769 120.496 52.4623 120.467C52.7801 120.438 53.069 120.467 53.3867 120.409C53.6756 120.351 53.9645 120.236 54.2534 120.091C54.6867 119.86 55.1201 119.456 55.3512 119.051C55.6112 118.589 55.7556 118.069 55.7267 117.549C55.7267 117.116 55.6112 116.682 55.3512 116.336C55.3801 116.567 55.4378 116.798 55.3512 117.029C55.3512 117.058 55.3223 117.058 55.3223 117.087C55.2645 117.116 55.1201 116.942 55.0623 116.942C54.7734 116.798 54.3978 116.885 54.0801 116.971C53.2134 117.145 52.289 117.202 51.3645 117.347Z"
                  fill="#FF5C9D"
                />
                <path
                  d="M51.3646 116.451C50.8446 116.538 50.3535 116.393 49.8046 116.365C49.5735 116.365 49.4579 116.422 49.2557 116.509C49.0824 116.567 48.9379 116.365 48.7357 116.422C48.6779 116.451 48.6202 116.48 48.5913 116.538C48.1002 117.029 47.6957 117.636 47.5802 118.329C47.4357 119.022 47.5224 120.351 48.3891 120.525C48.7935 120.611 49.2557 120.553 49.6313 120.351C49.9202 120.207 50.1513 120.005 50.4113 119.86C51.0468 119.542 51.7979 119.6 52.4913 119.571C52.8379 119.542 53.1846 119.571 53.5313 119.485C53.8779 119.398 54.2246 119.225 54.5424 119.022C55.4091 118.502 55.8713 117.607 55.5824 116.596C55.5246 116.365 55.3513 116.133 55.1491 116.018C54.8602 115.873 54.4846 115.96 54.1668 116.047C53.2135 116.22 52.2891 116.307 51.3646 116.451Z"
                  fill="#D9EFFF"
                />
                <path
                  d="M52.0001 88.429C51.8268 89.4978 50.8446 90.3934 49.7468 90.4223C49.0824 90.4512 48.4179 90.1912 47.7535 90.0467C47.089 89.9023 46.3379 89.8734 45.8179 90.3067C44.9801 90.9712 45.1824 92.2423 45.3268 93.1667C45.529 94.409 45.8757 95.5934 46.1357 96.8067C46.2801 97.5001 46.3957 98.1934 46.4246 98.8867C46.4824 99.8401 46.829 103.653 46.9446 104.578C47.0601 105.676 46.8001 106.773 46.9735 107.871C47.0601 108.391 47.1468 108.94 47.2335 109.489C47.4646 111.078 47.8112 112.667 47.869 114.285C47.8979 114.949 47.9268 115.613 47.9557 116.278C47.9846 116.625 47.9846 116.942 48.0135 117.289C48.0135 117.433 47.9846 117.607 48.1001 117.722C48.1868 117.838 48.389 117.867 48.5335 117.896C49.2557 117.982 50.0068 117.751 50.5846 117.289C50.7579 117.145 50.9312 116.971 51.0179 116.769C51.0468 116.74 51.0468 116.682 51.0468 116.653C51.0468 116.596 50.989 116.567 50.9312 116.509C50.8446 116.393 50.8446 116.278 50.8446 116.133C50.8446 115.787 51.7979 108.853 51.5668 106.253C51.4512 104.953 51.3935 103.682 51.4801 102.382C51.5668 101.053 51.7112 99.7534 51.8846 98.4245C52.1157 96.749 52.4624 95.0734 52.5779 93.3978C52.7224 91.7223 52.6068 89.989 52.0001 88.429Z"
                  fill="#FFE5CC"
                />
                <path
                  d="M41.9466 86.2046C41.9755 87.389 42.3221 88.5445 43.0155 89.4979C43.4777 90.1334 44.0555 90.6534 44.5466 91.2601C45.0088 91.8379 45.2399 92.5601 45.3266 93.2823C45.3555 93.4846 45.3555 93.5423 45.4999 93.6579C45.6444 93.7734 45.8177 93.8601 45.991 93.9468C46.3377 94.0912 46.7132 94.1779 47.0888 94.2357C48.9955 94.4957 51.0755 94.2357 52.6644 93.1668C52.8955 93.0223 52.8666 92.7623 52.8666 92.5312C52.8666 92.2134 52.9244 90.3068 52.9244 89.6712C52.9244 88.429 52.8666 87.1579 52.6932 85.9157C52.4621 84.2401 51.9999 82.5934 51.5377 80.9468C51.3355 81.3512 50.8733 81.6112 50.4399 81.7557C48.851 82.3623 47.031 82.2468 45.471 81.6112C44.951 81.409 44.431 81.1201 43.8821 81.2068C42.9866 81.3512 42.6399 82.1601 42.4666 82.9401C42.2355 84.0668 41.8888 85.049 41.9466 86.2046Z"
                  fill="#FF5C9D"
                />
                <path
                  d="M40.4446 61.0423C38.8268 61.2734 37.4979 62.4578 37.2957 64.1334C37.1802 65.1734 37.3824 66.2134 37.5846 67.2245C38.0468 69.449 39.4624 79.6467 39.8668 81.149C39.8957 81.3223 39.9535 81.4667 40.0402 81.6112C40.1268 81.7556 40.2713 81.8712 40.4157 81.9867C43.3624 84.2112 47.3779 84.8756 50.9024 83.7778C50.3824 82.2467 50.6135 80.6001 50.8446 79.0112C50.9602 77.7978 51.1913 76.5845 51.3357 75.4001C51.4224 74.7934 51.509 74.1867 51.5957 73.5801C51.6824 72.9734 51.8268 72.3667 51.8557 71.7601C51.8557 71.6445 51.8268 71.529 51.8268 71.4134C51.8268 71.2112 51.8557 71.009 51.8557 70.8067C51.8846 70.4023 51.9135 69.9978 51.9424 69.5645C51.9713 68.7556 52.0002 67.9178 51.9424 67.109C51.9135 66.7912 51.8846 66.4445 51.769 66.1556C51.6246 65.8378 51.3935 65.5778 51.1335 65.3467C50.8446 65.0578 46.4824 62.4578 45.1824 61.9956C43.7668 61.4756 42.1779 60.8978 40.6468 61.0423C40.5602 61.0423 40.5024 61.0423 40.4446 61.0423Z"
                  fill="#ACDDFF"
                />
                <path
                  d="M50.0932 51.6245C50.2377 52.3467 50.1799 53.1267 50.0066 53.849C49.891 54.3112 49.7466 54.7734 49.7177 55.2645C49.7177 55.5245 49.7466 55.8134 49.7466 56.0734C49.7466 56.3912 49.6888 56.709 49.6599 57.0267C49.5732 57.5179 49.4866 58.009 49.371 58.4712C49.2844 58.8467 49.2555 59.2223 49.0533 59.5401C48.7644 59.9445 48.3021 60.1756 48.0133 60.5512C47.7244 60.9267 47.6088 61.389 47.5221 61.8512C47.4644 62.0823 47.4355 62.3423 47.4066 62.5734C47.3777 62.7756 47.3199 63.0356 47.1177 63.1512C47.031 63.209 46.9444 63.209 46.8288 63.2379C45.9333 63.3823 45.0377 63.3245 44.171 63.0934C43.4488 62.9201 42.7266 62.6312 42.1488 62.1112C42.0333 61.9956 41.9177 61.909 41.9466 61.7356C42.0044 61.389 42.351 59.7134 42.3799 59.2223C42.4088 58.9912 42.4088 58.7601 42.351 58.5579C42.2644 58.1534 42.0333 57.8356 41.8021 57.489C40.7621 55.9579 40.0977 53.9645 40.791 52.1445C40.9355 51.7979 41.1088 51.4801 41.311 51.1912C42.2066 49.8045 43.7088 48.7934 45.3266 48.5912C45.731 48.5334 46.1066 48.5334 46.511 48.5912C48.1577 48.7645 49.7466 49.8334 50.0932 51.6245Z"
                  fill="#FFE5CC"
                />
                <path
                  d="M41.9755 58.4422C42.2066 58.8467 42.4666 59.28 42.8421 59.5689C43.6799 60.2334 44.8066 59.9734 45.5288 59.2222C45.7888 58.9622 45.9332 58.6445 46.0777 58.2978C46.3088 57.8067 46.4821 57.3156 46.6555 56.7956C46.771 56.42 46.8866 56.0156 47.1177 55.6978C47.3488 55.38 47.7821 55.1778 48.1577 55.2934C48.5621 55.4378 48.7355 55.8711 48.9088 56.2467C49.2555 55.0622 49.2555 53.7911 48.9666 52.6067C48.6199 53.3867 47.8688 53.8489 47.0599 54.1378C46.4532 54.34 45.7888 54.4556 45.1821 54.3111C44.5177 54.1667 43.9399 53.7622 43.2755 53.6756C43.0732 53.6467 42.8999 53.6467 42.6977 53.7045C42.4088 53.7911 42.2932 54.0511 41.9755 53.7911C41.9177 53.7334 41.8599 53.6756 41.7732 53.6178C41.6577 53.56 41.5421 53.56 41.4266 53.56C41.0799 53.5311 40.7332 53.4156 40.4444 53.1845C40.3866 53.4445 40.3577 53.7045 40.3866 53.9934C40.4155 54.3111 40.4732 54.6 40.5599 54.9178C40.7332 55.5822 40.9355 56.2178 41.1955 56.8534C41.4266 57.4311 41.6577 57.9511 41.9755 58.4422Z"
                  fill="#61474D"
                />
                <path
                  d="M40.3289 54.1089C40.3867 54.1956 40.4444 54.2245 40.5311 54.2245C40.5889 54.2245 41.1089 53.9645 41.1089 53.9645C41.1378 54.2533 41.3111 54.4845 41.5133 54.6578C41.7444 54.8311 42.0044 54.9467 42.2644 55.0333C43.3911 55.38 44.5755 55.38 45.76 55.2645C45.76 55.0622 45.76 54.86 45.76 54.6289C45.9911 54.7156 46.2511 54.8311 46.5111 54.8311C46.9444 54.8311 47.3489 54.5711 47.6955 54.2822C48.3311 53.7333 48.9667 53.0978 49.1978 52.2889C49.2267 52.2311 49.2267 52.1445 49.2844 52.1156C49.3422 52.0867 49.4 52.0578 49.4578 52.0578C49.8044 52.0578 50.1511 52.2022 50.3533 52.4622C50.3244 51.0467 49.4289 49.7178 48.1867 49.0245C46.9444 48.3311 45.4422 48.2445 44.0555 48.5911C43.8244 48.6489 43.5933 48.7356 43.3911 48.8511C43.1889 48.9667 43.0155 49.1689 42.8422 49.3133C42.8133 49.3422 42.7844 49.3711 42.7266 49.4C42.6689 49.4289 42.6111 49.4578 42.5533 49.4578C42.1778 49.5733 41.8022 49.7467 41.4844 50.0067C41.1378 50.2667 40.8778 50.6422 40.6755 51.0178C40.3867 51.5378 40.2133 52.1156 40.1844 52.6933C40.1555 52.9822 40.1844 53.2711 40.2422 53.56C40.1844 53.7045 40.2133 53.9645 40.3289 54.1089Z"
                  fill="#805E66"
                />
                <path
                  d="M56.3622 94.3802C56.3333 94.3224 56.3044 94.2357 56.2755 94.1779C55.9288 93.629 55.4666 93.1668 55.0622 92.6468C54.7444 92.2713 54.4844 91.8379 54.2822 91.4046C54.0799 90.9424 54.0222 90.4801 53.9355 89.9601C53.8488 89.4113 53.7622 88.8624 53.6755 88.3135C53.5311 87.2157 53.4444 86.1179 53.3866 85.0201C53.3288 83.9801 53.3288 82.9402 53.2711 81.9002C53.1844 80.889 52.9244 79.9357 52.6355 79.0113C52.0866 77.1624 52.2311 75.169 51.7399 73.2913C51.6244 73.5224 51.3355 73.6379 51.0466 73.6957C50.4688 73.8113 49.8622 73.8113 49.2844 73.6957C48.8511 73.609 48.4177 73.4646 48.0133 73.609C47.7533 73.6957 47.5511 73.9268 47.4644 74.1868C47.3488 74.5335 47.4933 74.9668 47.5799 75.3135C47.6955 75.7757 47.8688 76.2379 48.0133 76.729C48.3022 77.6824 48.4466 78.6935 48.5622 79.7046C48.7933 81.3801 48.9955 83.0557 49.4577 84.7024C49.6311 85.3379 49.8622 85.9446 50.0933 86.5802C50.4399 87.5624 51.8555 91.3757 51.9133 91.5779C51.9711 91.7801 52.0288 91.9824 51.9999 92.2135C51.9711 92.5602 51.8555 92.849 51.9133 93.1957C51.9999 93.8313 52.4911 94.3224 52.6933 94.929C52.7222 95.0446 52.7511 95.1602 52.6644 95.2468C52.6066 95.2757 52.5488 95.3046 52.4911 95.3335C52.3177 95.4202 52.3177 95.6513 52.4044 95.8246C52.5199 95.969 52.6933 96.0557 52.8377 96.1424C52.8955 96.1713 52.9533 96.2002 53.0111 96.229C53.0688 96.2868 53.1266 96.3446 53.1844 96.4024C53.3577 96.5468 53.6466 96.4601 53.8488 96.3446C53.8777 96.3157 53.9355 96.2868 53.9644 96.2868C54.0511 96.2579 54.1377 96.3157 54.2244 96.3735C54.4844 96.5179 54.8311 96.5179 55.0622 96.3446C55.1199 96.3157 55.1488 96.2579 55.2066 96.229C55.2644 96.2002 55.3511 96.1713 55.4088 96.1713C55.6399 96.0846 55.8133 95.9402 55.9577 95.7668C56.2755 95.3046 56.4777 94.7846 56.3622 94.3802Z"
                  fill="#FFE5CC"
                />
                <path
                  d="M52.491 68.7268C52.4044 68.0335 52.3177 67.3402 52.0577 66.7046C51.8844 66.2424 51.5955 65.7802 51.2199 65.4913C50.9599 65.2891 50.6422 65.2024 50.2955 65.2024C50.1222 65.2024 49.9199 65.2313 49.7466 65.2602C49.1977 65.3757 48.7066 65.6357 48.3022 66.0113C47.7244 66.5313 47.2622 67.2246 46.9733 67.918C46.5977 68.8713 46.4822 69.8824 46.5688 70.8935C46.6266 71.8757 47.1755 74.3891 47.2333 74.6779C47.2622 74.8513 47.291 75.1979 47.4066 75.3713C47.5222 75.5157 47.811 75.5157 47.9844 75.5735C48.2444 75.6313 48.4755 75.6602 48.7355 75.6602C49.7466 75.7179 50.7866 75.5157 51.711 75.0824C52.0288 74.9379 52.3755 74.7646 52.6355 74.5335C52.8955 74.3313 52.9821 74.0424 52.9821 73.7246C52.9533 73.3202 52.6355 69.9979 52.491 68.7268Z"
                  fill="#D9EFFF"
                />
              </g>
              <defs>
                <clipPath id="clip0_19_582">
                  <rect width="130" height="130" rx="4" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <p>
              Set your phone straight onto a table, around your waist height
            </p>
          </div>
          <Button
            variant="contained"
            onClick={() => handleOpen()}
            onTouchStart={handleOpen}
            className="!bg-[#6B7CF6] hover:!bg-[#4e5ab6] !mb-10 mt-8"
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
                variant="contained"
                onClick={() => getUserData()}
                className="mt-6 !bg-[#6B7CF6] hover:!bg-[#4e5ab6]"
              >
                Change my metrics
              </Button>
            )}
            {!login && (
              <>
                <Button
                  variant="contained"
                  onClick={() => {
                    localStorage.removeItem("token");
                    setLogin(null);
                    setIsRegister(true);
                    setIsLoginClicked(1);
                    setActiveTab(1);
                  }}
                  className="mt-6 !bg-[#6B7CF6] hover:!bg-[#4e5ab6]"
                >
                  Create an account
                </Button>
                <p className="text-lg lg:text-xl">To always have your size.</p>
              </>
            )}
          </div>
        )}
    </div>
  );
};

export default FitCheckYourSize4;
