import React, { useRef, useEffect, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";

// Define types for the measurements object
interface Measurements {
  chestSize?: number | string;
  waistSize?: number | string;
  shoulderToHip?: number | string;
  hipToKnee?: number | string;
  kneeToAnkle?: number | string;
  armLength?: number | string;
  distanceToCamera?: number | string;
  tShirtSize?: string;
}

const SizeMeasur: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [poseDetector, setPoseDetector] =
    useState<poseDetection.PoseDetector | null>(null);
  const [pose, setPose] = useState<poseDetection.Keypoint[]>([]);
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [userDetected, setUserDetected] = useState<boolean>(false);
  const [cameraPermissionError, setCameraPermissionError] =
    useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false); // State to track if the camera is ready

  // Function to calculate Euclidean distance between two 2D points
  const calculateDistance = (
    point1: poseDetection.Keypoint,
    point2: poseDetection.Keypoint
  ): number => {
    if (!point1 || !point2) return 0;
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Function to estimate the distance from the person to the camera
  const estimateDistance = (
    shoulderLeft: poseDetection.Keypoint,
    shoulderRight: poseDetection.Keypoint
  ): number => {
    const shoulderWidth = calculateDistance(shoulderLeft, shoulderRight);
    const scalingFactor = 0.15; // Calibrate based on camera setup
    const estimatedDistance = 200 / shoulderWidth; // Approximation formula (can be adjusted)
    return estimatedDistance * scalingFactor;
  };

  // Function to start the webcam
  const startVideo = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.oncanplay = () => {
          videoRef.current?.play();
          setCameraReady(true); // Set cameraReady to true once the video starts playing
        };
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setCameraPermissionError(true); // Camera permission denied or unavailable
    }
  };

  // Initialize pose detection
  const startPoseDetection = async (): Promise<void> => {
    if (!cameraReady) return; // Wait until the camera is ready
    await tf.ready(); // Ensure TensorFlow.js is ready

    // Directly pass the config object to the `createDetector` function
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      }
    );

    setPoseDetector(detector);
  };

  // Function to draw keypoints on the canvas
  const drawKeypoints = (keypoints: poseDetection.Keypoint[]): void => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
        keypoints.forEach((keypoint) => {
          // Check if score exists and is greater than 0.5
          if (keypoint.score !== undefined && keypoint.score > 0.5) {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI); // Draw a red dot
            ctx.fillStyle = "red";
            ctx.fill();
          }
        });
      }
    }
  };

  // Function to estimate t-shirt size based on chest size
  const estimateTShirtSize = (chestInInches: number): string => {
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

  // Detect pose and process measurements
  const detectPose = async (): Promise<void> => {
    if (!poseDetector || !videoRef.current || !cameraReady) return; // Wait until camera is ready
    const video = videoRef.current;

    // Check if the video has valid dimensions
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("Invalid video dimensions. Skipping pose detection.");
      return; // Skip pose detection if video dimensions are invalid
    }

    try {
      const poses = await poseDetector.estimatePoses(video);
      if (poses.length > 0) {
        const poseKeypoints = poses[0].keypoints;
        setPose(poseKeypoints);

        const scalingFactor = 0.15; // Calibrate based on your camera setup

        // Extract required keypoints
        const keypointsMap: {
          [key: string]: poseDetection.Keypoint | undefined;
        } = {
          leftShoulder: poseKeypoints[5],
          rightShoulder: poseKeypoints[6],
          leftHip: poseKeypoints[11],
          rightHip: poseKeypoints[12],
          leftKnee: poseKeypoints[13],
          rightKnee: poseKeypoints[14],
          leftAnkle: poseKeypoints[15],
          rightAnkle: poseKeypoints[16],
          leftElbow: poseKeypoints[7],
          rightElbow: poseKeypoints[8],
          leftWrist: poseKeypoints[9],
          rightWrist: poseKeypoints[10],
        };

        // Ensure both shoulders and hips are detected to start measuring
        const detectedKeypoints = Object.keys(keypointsMap).filter((key) => {
          const keypoint = keypointsMap[key];
          return keypoint && keypoint?.score !== undefined && keypoint.score > 0.5;
        });

        if (detectedKeypoints.length > 0) {
          setUserDetected(true); // User detected

          // Initialize measurements object
          const calculatedMeasurements: Measurements = {};

          // Calculate measurements only for visible keypoints
          if (keypointsMap.leftShoulder && keypointsMap.rightShoulder) {
            const chestSize =
              calculateDistance(
                keypointsMap.leftShoulder,
                keypointsMap.rightShoulder
              ) * scalingFactor;
            calculatedMeasurements.chestSize = chestSize;
            // Calculate t-shirt size based on chest size
            calculatedMeasurements.tShirtSize = estimateTShirtSize(chestSize);
          } else {
            calculatedMeasurements.chestSize = "N/A";
            calculatedMeasurements.tShirtSize = "N/A";
          }

          // if (keypointsMap.leftHip && keypointsMap.rightHip) {
          //   calculatedMeasurements.waistSize =
          //     calculateDistance(keypointsMap.leftHip, keypointsMap.rightHip) *
          //     scalingFactor;
          // } else {
          //   calculatedMeasurements.waistSize = "N/A";
          // }

          // if (keypointsMap.leftShoulder && keypointsMap.leftHip) {
          //   calculatedMeasurements.shoulderToHip =
          //     calculateDistance(
          //       keypointsMap.leftShoulder,
          //       keypointsMap.leftHip
          //     ) * scalingFactor;
          // } else {
          //   calculatedMeasurements.shoulderToHip = "N/A";
          // }

          // if (keypointsMap.leftHip && keypointsMap.leftKnee) {
          //   calculatedMeasurements.hipToKnee =
          //     calculateDistance(keypointsMap.leftHip, keypointsMap.leftKnee) *
          //     scalingFactor;
          // } else {
          //   calculatedMeasurements.hipToKnee = "N/A";
          // }

          // if (keypointsMap.leftKnee && keypointsMap.leftAnkle) {
          //   calculatedMeasurements.kneeToAnkle =
          //     calculateDistance(keypointsMap.leftKnee, keypointsMap.leftAnkle) *
          //     scalingFactor;
          // } else {
          //   calculatedMeasurements.kneeToAnkle = "N/A";
          // }

          // if (keypointsMap.leftShoulder && keypointsMap.leftWrist) {
          //   calculatedMeasurements.armLength =
          //     calculateDistance(
          //       keypointsMap.leftShoulder,
          //       keypointsMap.leftWrist
          //     ) * scalingFactor;
          // } else {
          //   calculatedMeasurements.armLength = "N/A";
          // }

          // Estimate distance to camera only if both shoulders are visible
          if (keypointsMap.leftShoulder && keypointsMap.rightShoulder) {
            calculatedMeasurements.distanceToCamera = estimateDistance(
              keypointsMap.leftShoulder,
              keypointsMap.rightShoulder
            );
          } else {
            calculatedMeasurements.distanceToCamera = "N/A";
          }

          setMeasurements(calculatedMeasurements);

          // Draw keypoints on canvas only for detected keypoints
          drawKeypoints(poseKeypoints);
        } else {
          setUserDetected(false);
          setMeasurements({});
        }
      } else {
        setUserDetected(false);
        setMeasurements({});
      }
    } catch (error) {
      console.error("Error detecting pose:", error);
    }
  };

  // Start video and pose detection once the component mounts
  useEffect(() => {
    startVideo();
  }, []);

  // Start pose detection when camera is ready
  useEffect(() => {
    if (cameraReady) {
      startPoseDetection();
    }
  }, [cameraReady]);

  // Continuously detect pose every 100ms
  useEffect(() => {
    const interval = setInterval(detectPose, 100);
    return () => clearInterval(interval);
  }, [poseDetector, cameraReady]);

  return (
    <div style={{ textAlign: "center" }} className="text-black dark:text-white">
      <h1>Size Detection App</h1>
      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          width="640"
          height="480"
          style={{ border: "2px solid black" }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        />
      </div>

      {cameraPermissionError && (
        <p>
          Camera not found or permission denied. Please grant camera access.
        </p>
      )}

      {!userDetected && !cameraPermissionError && (
        <p>No user detected. Please step into the frame.</p>
      )}

      {userDetected && (
        <div>
          {Object.entries(measurements).map(([key, value]) => (
            <p key={key}>
              <strong>{key.replace(/([A-Z])/g, " $1")}</strong>:{" "}
              {value === "N/A"
                ? value
                : typeof value === "number"
                ? value.toFixed(2)
                : value}
            </p>
          ))}
          {/* <p>
            <strong>T-shirt Size:</strong> {measurements.tShirtSize}
          </p> */}
        </div>
      )}
    </div>
  );
};

export default SizeMeasur;
