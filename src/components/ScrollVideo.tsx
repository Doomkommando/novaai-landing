import { useEffect, useRef, useState } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4";
const POSTER_URL = "/hero-poster.jpg";

const MAX_FRAMES = 90;
const MIN_FRAMES = 24;
const FRAME_MAX_WIDTH = 960;

function drawCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sw: number,
  sh: number,
  cw: number,
  ch: number
) {
  const scale = Math.max(cw / sw, ch / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.drawImage(source, dx, dy, dw, dh);
}

export function ScrollVideo() {
  const posterRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenVideoRef = useRef<HTMLVideoElement | null>(null);

  const [posterVisible, setPosterVisible] = useState(true);
  const [videoVisible, setVideoVisible] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(false);

  const framesRef = useRef<ImageBitmap[]>([]);
  const framesReadyRef = useRef(false);
  const smoothedRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastSeekRef = useRef(0);

  // Scroll progress tracker
  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      targetRef.current = progress;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Visible video: fade poster out once a frame is available
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    function onLoadedData() {
      setVideoVisible(true);
      setTimeout(() => setPosterVisible(false), 0);
    }
    video.addEventListener("loadeddata", onLoadedData);
    return () => video.removeEventListener("loadeddata", onLoadedData);
  }, []);

  // Frame extraction via offscreen video
  useEffect(() => {
    const visibleVideo = videoRef.current;
    if (!visibleVideo) return;

    let cancelled = false;

    async function extractFrames() {
      await new Promise<void>((resolve) => {
        if (visibleVideo!.readyState >= 2) return resolve();
        const handler = () => {
          visibleVideo!.removeEventListener("loadeddata", handler);
          resolve();
        };
        visibleVideo!.addEventListener("loadeddata", handler);
      });
      await new Promise((r) => setTimeout(r, 300));
      if (cancelled) return;

      const offVideo = document.createElement("video");
      offVideo.src = VIDEO_URL;
      offVideo.crossOrigin = "anonymous";
      offVideo.muted = true;
      offVideo.playsInline = true;
      offscreenVideoRef.current = offVideo;

      await new Promise<void>((resolve) => {
        offVideo.addEventListener("loadedmetadata", () => resolve(), { once: true });
        offVideo.load();
      });
      if (cancelled) return;

      const duration = offVideo.duration || 8;
      const frameCount = Math.min(MAX_FRAMES, Math.max(MIN_FRAMES, Math.floor(duration * 12)));
      const scale = Math.min(1, FRAME_MAX_WIDTH / (offVideo.videoWidth || FRAME_MAX_WIDTH));
      const w = Math.round((offVideo.videoWidth || FRAME_MAX_WIDTH) * scale);
      const h = Math.round((offVideo.videoHeight || 540) * scale);

      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = w;
      tmpCanvas.height = h;
      const tmpCtx = tmpCanvas.getContext("2d");
      if (!tmpCtx) return;

      const frames: ImageBitmap[] = [];
      for (let i = 0; i < frameCount; i++) {
        if (cancelled) return;
        const t = (i / (frameCount - 1)) * Math.max(0, duration - 0.05);
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            offVideo.removeEventListener("seeked", onSeeked);
            resolve();
          };
          offVideo.addEventListener("seeked", onSeeked);
          offVideo.currentTime = t;
        });
        if (cancelled) return;
        tmpCtx.drawImage(offVideo, 0, 0, w, h);
        try {
          const bitmap = await createImageBitmap(tmpCanvas);
          frames.push(bitmap);
        } catch {
          // ignore frame extraction failure, fallback will handle
        }
      }

      if (!cancelled && frames.length > 0) {
        framesRef.current = frames;
        framesReadyRef.current = true;
        setCanvasVisible(true);
        setVideoVisible(false);
      }
    }

    extractFrames().catch(() => {
      // frame cache failed; fallback to direct video seeking remains active
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // rAF loop: lerp smoothing + draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.round(rect.width * dpr);
      canvas!.height = Math.round(rect.height * dpr);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function tick() {
      smoothedRef.current += (targetRef.current - smoothedRef.current) * 0.12;
      const progress = smoothedRef.current;

      const cw = canvas!.width;
      const ch = canvas!.height;

      if (framesReadyRef.current && framesRef.current.length > 0) {
        const frames = framesRef.current;
        const idx = Math.min(frames.length - 1, Math.floor(progress * (frames.length - 1)));
        const frame = frames[idx];
        if (frame) {
          ctx!.clearRect(0, 0, cw, ch);
          drawCover(ctx!, frame, frame.width, frame.height, cw, ch);
        }
      } else {
        const video = videoRef.current;
        if (video && video.duration && !isNaN(video.duration)) {
          const targetTime = progress * (video.duration - 0.05);
          if (Math.abs(video.currentTime - targetTime) > 0.04 && Math.abs(targetTime - lastSeekRef.current) > 0.001) {
            video.currentTime = targetTime;
            lastSeekRef.current = targetTime;
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0a0a0a] pointer-events-none">
      <img
        ref={posterRef}
        src={POSTER_URL}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          posterVisible ? "opacity-100" : "opacity-0"
        }`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          videoVisible && !canvasVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
          canvasVisible ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
