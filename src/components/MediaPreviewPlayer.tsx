'use client';

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, Clock, Video, Mic, Sparkles } from 'lucide-react';
import { getMediaBlob } from '@/lib/videoStorage';

export interface MediaPreviewPlayerRef {
  seekTo: (seconds: number) => void;
}

interface MediaPreviewPlayerProps {
  sessionId: string;
  initialMediaUrl?: string | null;
  mediaType?: 'video' | 'audio';
  title?: string;
  onTimeUpdate?: (currentTime: number) => void;
}

function formatTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const mins = Math.floor(sec / 60).toString().padStart(2, '0');
  const secs = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

const MediaPreviewPlayer = forwardRef<MediaPreviewPlayerRef, MediaPreviewPlayerProps>(
  ({ sessionId, initialMediaUrl, mediaType = 'audio', title = 'Session Preview', onTimeUpdate }, ref) => {
    const [mediaUrl, setMediaUrl] = useState<string | null>(initialMediaUrl || null);
    const [actualType, setActualType] = useState<'video' | 'audio'>(mediaType);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [loading, setLoading] = useState(!initialMediaUrl);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Expose seekTo function to parent components (e.g. transcript timestamp clicks)
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        const media = actualType === 'video' ? videoRef.current : audioRef.current;
        if (media) {
          media.currentTime = seconds;
          media.play().catch(() => {});
          setIsPlaying(true);
        }
      },
    }));

    useEffect(() => {
      let objectUrl: string | null = null;
      let isMounted = true;

      if (!initialMediaUrl) {
        setLoading(true);
        getMediaBlob(sessionId).then(res => {
          if (!isMounted) return;
          if (res && res.blob) {
            objectUrl = URL.createObjectURL(res.blob);
            setMediaUrl(objectUrl);
            setActualType(res.mediaType || (res.blob.type.includes('video') ? 'video' : 'audio'));
          } else {
            setMediaUrl(null);
          }
          setLoading(false);
        });
      } else {
        setMediaUrl(initialMediaUrl);
        setLoading(false);
      }

      return () => {
        isMounted = false;
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }, [sessionId, initialMediaUrl]);

    const activeMedia = () => (actualType === 'video' ? videoRef.current : audioRef.current);

    const togglePlay = () => {
      const media = activeMedia();
      if (!media) return;
      if (isPlaying) {
        media.pause();
        setIsPlaying(false);
      } else {
        media.play().catch(() => {});
        setIsPlaying(true);
      }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const targetTime = parseFloat(e.target.value);
      const media = activeMedia();
      if (media) {
        media.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    };

    const changeSpeed = (speed: number) => {
      setPlaybackRate(speed);
      const media = activeMedia();
      if (media) media.playbackRate = speed;
    };

    const toggleMute = () => {
      const media = activeMedia();
      if (media) {
        media.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    const handleTimeUpdate = () => {
      const media = activeMedia();
      if (media) {
        setCurrentTime(media.currentTime);
        if (onTimeUpdate) onTimeUpdate(media.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      const media = activeMedia();
      if (media) {
        setDuration(media.duration || 0);
      }
    };

    if (loading) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading session media preview...</span>
        </div>
      );
    }

    if (!mediaUrl) {
      return (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-amber-400" />
            <span>Audio &amp; Video Preview available during live session recording</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">7-Day Retention Storage</span>
        </div>
      );
    }

    return (
      <div className="bg-[#0B0E27] border border-slate-800 rounded-2xl p-4 shadow-xl text-white space-y-3 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
              {actualType === 'video' ? <Video size={15} /> : <Mic size={15} />}
            </span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {title}
                <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {actualType === 'video' ? 'Video Playback' : 'Audio Recording'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {actualType === 'video' ? 'Webcam & Delivery Recording' : 'Microphone Vocal Track'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
              <button
                key={speed}
                onClick={() => changeSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  playbackRate === speed
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Media Container */}
        {actualType === 'video' ? (
          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
            <video
              ref={videoRef}
              src={mediaUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <audio
              ref={audioRef}
              src={mediaUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            {/* Animated Waveform Visualizer Bar */}
            <div className="flex items-end gap-1 h-8 px-2 flex-1 overflow-hidden">
              {[40, 75, 30, 90, 60, 100, 45, 80, 20, 65, 85, 35, 95, 50, 70, 30, 90, 60, 40, 80].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlaying ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * (i % 3 + 1)) % 100)}%` : `${h}%`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom Progress Bar & Controls */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-md"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  const media = activeMedia();
                  if (media) {
                    media.currentTime = 0;
                    setCurrentTime(0);
                  }
                }}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                title="Restart Media"
              >
                <RotateCcw size={15} />
              </button>

              <button
                onClick={toggleMute}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" /> Click transcript timestamps to jump playback
            </span>
          </div>
        </div>
      </div>
    );
  }
);

MediaPreviewPlayer.displayName = 'MediaPreviewPlayer';

export default MediaPreviewPlayer;
