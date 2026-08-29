// src/lib/mediapipeLoader.ts
import { FilesetResolver, GestureRecognizer, FaceLandmarker, PoseLandmarker } from '@mediapipe/tasks-vision';

let cachedVisionResolver: any = null;

async function getVisionResolver() {
  if (!cachedVisionResolver) {
    cachedVisionResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
    );
  }
  return cachedVisionResolver;
}

/**
 * Initializes the MediaPipe Gesture Recognizer for real-time hand tracking
 * using browser WebGL/WASM GPU delegate.
 */
export async function initializeGestureRecognizer() {
  try {
    const vision = await getVisionResolver();
    const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });
    return gestureRecognizer;
  } catch (error) {
    console.error("MediaPipe GestureRecognizer Init Failed:", error);
    return null;
  }
}

/**
 * Initializes MediaPipe FaceLandmarker for real-time gaze & eye contact detection.
 */
export async function initializeFaceLandmarker() {
  try {
    const vision = await getVisionResolver();
    const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU"
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1
    });
    return faceLandmarker;
  } catch (error) {
    console.error("MediaPipe FaceLandmarker Init Failed:", error);
    return null;
  }
}

/**
 * Initializes MediaPipe PoseLandmarker for real-time posture, shoulder alignment & slouch tracking.
 */
export async function initializePoseLandmarker() {
  try {
    const vision = await getVisionResolver();
    const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numPoses: 1
    });
    return poseLandmarker;
  } catch (error) {
    console.error("MediaPipe PoseLandmarker Init Failed:", error);
    return null;
  }
}

/**
 * Estimates eye contact percentage from face landmarks (Iris position relative to eye corners).
 * Client-Side Only - Returns scalar score (0 - 100), no raw landmark coordinates stored or transmitted.
 */
export function calculateEyeContactScore(faceLandmarks: any[]): number {
  if (!faceLandmarks || faceLandmarks.length === 0) return 0;
  const landmarks = faceLandmarks[0];
  if (!landmarks || landmarks.length < 473) return 50;

  // Key Iris landmark indices: 468 (Left pupil center), 473 (Right pupil center)
  const leftPupil = landmarks[468];
  const rightPupil = landmarks[473];
  const noseTip = landmarks[1];

  if (!leftPupil || !rightPupil || !noseTip) return 70;

  // Calculate horizontal pitch offset from nose center
  const gazeXOffset = Math.abs((leftPupil.x + rightPupil.x) / 2 - noseTip.x);
  const gazeYOffset = Math.abs((leftPupil.y + rightPupil.y) / 2 - noseTip.y);

  // If pupil is aligned within central threshold zone -> high eye contact score
  const combinedDeviation = Math.sqrt(gazeXOffset * gazeXOffset + gazeYOffset * gazeYOffset);
  const score = Math.max(0, Math.min(100, Math.round(100 - combinedDeviation * 350)));

  return score;
}

/**
 * Estimates posture stability score from shoulder landmarks (Left shoulder: 11, Right shoulder: 12).
 */
export function calculatePostureScore(poseLandmarks: any[]): number {
  if (!poseLandmarks || poseLandmarks.length === 0) return 80;
  const landmarks = poseLandmarks[0];
  if (!landmarks || landmarks.length < 13) return 80;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  if (!leftShoulder || !rightShoulder) return 80;

  // Shoulder height difference (tilt/slouch)
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  
  // Calculate stability score: smaller tilt = higher posture score (100 is perfectly straight)
  const score = Math.max(0, Math.min(100, Math.round(100 - shoulderTilt * 400)));
  return score;
}
