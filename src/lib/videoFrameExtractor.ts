export async function extractFramesFromVideo(videoBlob: Blob, numFrames: number = 5): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const videoUrl = URL.createObjectURL(videoBlob);
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = async () => {
      try {
        // WebM blobs from MediaRecorder often lack duration metadata.
        // If duration is missing, seek to a large number to force the browser to calculate it.
        let actualDuration = video.duration;
        if (!isFinite(actualDuration) || actualDuration === 0) {
           video.currentTime = Number.MAX_SAFE_INTEGER;
           await new Promise(r => {
             video.onseeked = () => {
               actualDuration = video.duration;
               video.onseeked = null;
               r(null);
             };
           });
        }

        const frames: string[] = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Downscale to save memory and API payload size
        const targetWidth = 640;
        const scale = targetWidth / video.videoWidth;
        canvas.width = targetWidth;
        canvas.height = video.videoHeight * scale;

        const intervals = [];
        for (let i = 1; i <= numFrames; i++) {
          intervals.push((actualDuration / (numFrames + 1)) * i);
        }

        for (const time of intervals) {
          video.currentTime = time;
          await new Promise<void>((r) => {
            video.onseeked = () => r();
          });
          
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Get base64 string, remove data URL prefix
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            const base64 = dataUrl.split(',')[1];
            frames.push(base64);
          }
        }

        URL.revokeObjectURL(videoUrl);
        resolve(frames);
      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        reject(err);
      }
    };

    video.onerror = (err) => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error("Error loading video for frame extraction."));
    };

    video.load();
  });
}
