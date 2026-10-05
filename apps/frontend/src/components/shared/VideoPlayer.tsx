"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AspectRatio } from "@/components/shared/shadcn";

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2];

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    }

    return () => hls?.destroy();
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    const onCanPlay = () => setBuffering(false);
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onVolumeChange = () => {
      setMuted(video.muted);
      setVolume(video.volume);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("progress", onProgress);
    video.addEventListener("volumechange", onVolumeChange);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(
      Math.max(video.currentTime + seconds, 0),
      duration || Infinity,
    );
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
  };

  const cyclePlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;
    const next =
      PLAYBACK_RATES[
        (PLAYBACK_RATES.indexOf(rate) + 1) % PLAYBACK_RATES.length
      ];
    video.playbackRate = next;
    setRate(next);
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  };

  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (bufferedEnd / duration) * 100 : 0;

  return (
    <AspectRatio
      ratio={16 / 9}
      className="group relative overflow-hidden rounded-xl border border-border bg-black shadow-lg"
    >
      {/* Click anywhere on the video, or press Space while focused, to toggle play/pause — like YouTube. */}
      <div
        ref={containerRef}
        role="button"
        tabIndex={0}
        aria-label={playing ? "Pause video" : "Play video"}
        onClick={togglePlay}
        onKeyDown={(e) => {
          if (e.code === "Space") {
            e.preventDefault();
            togglePlay();
          }
        }}
        className="relative h-full w-full cursor-pointer bg-black outline-none"
      >
        <video ref={videoRef} className="h-full w-full" aria-label={title} />

        {/* Top gradient + title, revealed on hover */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-black/70 to-transparent px-4 py-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <p className="truncate text-sm font-medium text-white drop-shadow">
            {title}
          </p>
        </div>

        {buffering && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-10 animate-spin text-white/90" />
          </div>
        )}

        {!buffering && !playing && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-black/50 shadow-xl backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
              <Play className="size-9 translate-x-0.5 fill-white text-white" />
            </div>
          </div>
        )}

        {/* Bottom control bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-0 flex cursor-default flex-col gap-1.5 bg-linear-to-t from-black/90 via-black/50 to-transparent px-3 pt-10 pb-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          {/* Seek bar with buffered + played progress */}
          <div className="group/seek relative flex h-3 items-center">
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/seek:h-1.5">
              <div
                className="absolute inset-y-0 left-0 bg-white/40"
                style={{ width: `${bufferedPercent}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-red-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const video = videoRef.current;
                if (!video) return;
                video.currentTime = Number(e.target.value);
              }}
              aria-label="Seek"
              className="absolute inset-x-0 h-3 w-full cursor-pointer opacity-0"
            />
            <div
              className="pointer-events-none absolute size-3 -translate-x-1/2 rounded-full bg-red-500 opacity-0 shadow transition-opacity group-hover/seek:opacity-100"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="rounded-full p-1.5 hover:bg-white/15"
              >
                {playing ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => skip(-10)}
                aria-label="Back 10 seconds"
                className="rounded-full p-1.5 hover:bg-white/15"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => skip(10)}
                aria-label="Forward 10 seconds"
                className="rounded-full p-1.5 hover:bg-white/15"
              >
                <RotateCw className="size-4" />
              </button>

              <div className="group/volume flex items-center">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="rounded-full p-1.5 hover:bg-white/15"
                >
                  <VolumeIcon className="size-4" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  aria-label="Volume"
                  className="w-0 cursor-pointer accent-white opacity-0 transition-all duration-200 group-hover/volume:ml-1 group-hover/volume:w-16 group-hover/volume:opacity-100"
                />
              </div>

              <span className="ml-1 text-xs tabular-nums text-white/90">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={cyclePlaybackRate}
                aria-label="Playback speed"
                className="rounded-full px-2 py-1 text-xs font-medium hover:bg-white/15"
              >
                {rate}x
              </button>
              <button
                type="button"
                onClick={togglePictureInPicture}
                aria-label="Picture in picture"
                className="rounded-full p-1.5 hover:bg-white/15"
              >
                <PictureInPicture2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                className="rounded-full p-1.5 hover:bg-white/15"
              >
                {fullscreen ? (
                  <Minimize className="size-4" />
                ) : (
                  <Maximize className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AspectRatio>
  );
}
