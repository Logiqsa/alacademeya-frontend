import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Maximize, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from "lucide-react";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "00:00";
  const value = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = value % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const BrandMediaPlayer = forwardRef(function BrandMediaPlayer({
  type = "video",
  src,
  sources = [],
  poster,
  autoPlay = false,
  className = "",
  onLoadedMetadata,
  onPlay,
  onTimeUpdate,
  onPause,
  onEnded,
  onError,
  onToggleFullscreen,
}, forwardedRef) {
  const mediaRef = useRef(null);
  const containerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const clickTimerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [activeSource, setActiveSource] = useState(src);
  const [feedback, setFeedback] = useState(null);

  useImperativeHandle(forwardedRef, () => mediaRef.current);
  useEffect(() => setActiveSource(src), [src]);
  useEffect(() => {
    const focusTimer = window.setTimeout(() => containerRef.current?.focus({ preventScroll: true }), 0);
    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(feedbackTimerRef.current);
      window.clearTimeout(clickTimerRef.current);
    };
  }, [activeSource]);

  const showFeedback = (kind, label) => {
    window.clearTimeout(feedbackTimerRef.current);
    setFeedback({ kind, label, id: Date.now() });
    feedbackTimerRef.current = window.setTimeout(() => setFeedback(null), 650);
  };

  const togglePlayback = () => {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) {
      media.play();
      showFeedback("play", "تشغيل");
    } else {
      media.pause();
      showFeedback("pause", "إيقاف مؤقت");
    }
  };
  const handleSurfaceClick = () => {
    window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = window.setTimeout(togglePlayback, 210);
  };
  const handleDoubleClick = () => {
    window.clearTimeout(clickTimerRef.current);
    if (type === "video") toggleFullscreen();
  };
  const skip = (amount) => {
    const media = mediaRef.current;
    if (media) media.currentTime = Math.min(Math.max(0, media.currentTime + amount), media.duration || Infinity);
    showFeedback(amount > 0 ? "forward" : "rewind", `${Math.abs(amount)} ثوانٍ`);
  };
  const seek = (event) => {
    const next = Number(event.target.value);
    if (mediaRef.current) mediaRef.current.currentTime = next;
    setCurrentTime(next);
  };
  const changeVolume = (event) => {
    const next = Number(event.target.value);
    if (mediaRef.current) {
      mediaRef.current.volume = next;
      mediaRef.current.muted = next === 0;
    }
    setVolume(next);
    setMuted(next === 0);
    showFeedback("volume", `${Math.round(next * 100)}%`);
  };
  const toggleMute = () => {
    if (!mediaRef.current) return;
    mediaRef.current.muted = !mediaRef.current.muted;
    setMuted(mediaRef.current.muted);
  };
  const adjustVolume = (amount) => {
    const media = mediaRef.current;
    if (!media) return;
    const next = Math.min(1, Math.max(0, media.volume + amount));
    media.volume = next;
    media.muted = next === 0;
    setVolume(next);
    setMuted(next === 0);
    showFeedback("volume", `${Math.round(next * 100)}%`);
  };
  const toggleFullscreen = async () => {
    if (onToggleFullscreen) {
      await onToggleFullscreen();
      return;
    }
    if (document.fullscreenElement === containerRef.current) await document.exitFullscreen();
    else await containerRef.current?.requestFullscreen();
  };
  const handleKeyboard = (event) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName) || event.target.isContentEditable) return;
    if (event.code === "Space") {
      event.preventDefault();
      togglePlayback();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      skip(10);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      skip(-10);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      adjustVolume(0.1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      adjustVolume(-0.1);
    } else if (event.key.toLowerCase() === "f" && type === "video") {
      event.preventDefault();
      toggleFullscreen();
    }
  };
  useEffect(() => {
    const onWindowKeyDown = (event) => handleKeyboard(event);
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  });
  const changeQuality = (event) => {
    const media = mediaRef.current;
    const wasPlaying = !media?.paused;
    const position = media?.currentTime || 0;
    setActiveSource(event.target.value);
    window.setTimeout(() => {
      if (!mediaRef.current) return;
      mediaRef.current.currentTime = position;
      if (wasPlaying) mediaRef.current.play();
    }, 0);
  };

  const Media = type === "audio" ? "audio" : "video";
  return <div ref={containerRef} dir="ltr" tabIndex={0} onClick={(event) => { if (type === "audio" && !event.target.closest("button, input, select")) handleSurfaceClick(); }} onDoubleClick={handleDoubleClick} className={`group relative overflow-hidden bg-[#030A17] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3567C8] ${type === "audio" ? "flex min-h-44 cursor-pointer items-center justify-center rounded-2xl bg-linear-to-br from-[#0A1D3E] to-[#123C91]" : "h-full w-full"} ${className}`} onContextMenu={(event) => event.preventDefault()}>
    {type === "audio" && <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(circle_at_center,#3567C8_0,transparent_58%)]" />}
    <Media
      ref={mediaRef}
      key={activeSource}
      src={activeSource}
      poster={type === "video" ? poster : undefined}
      autoPlay={autoPlay}
      crossOrigin="use-credentials"
      controls={false}
      controlsList="nodownload noremoteplayback"
      disablePictureInPicture
      disableRemotePlayback
      playsInline
      preload="metadata"
      className={type === "video" ? "h-full w-full bg-black object-contain" : "absolute h-px w-px opacity-0"}
      onClick={handleSurfaceClick}
      onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration || 0); onLoadedMetadata?.(event); }}
      onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
      onPlay={(event) => { setPlaying(true); onPlay?.(event); }}
      onPause={(event) => { setPlaying(false); onPause?.(event); }}
      onTimeUpdate={(event) => { setCurrentTime(event.currentTarget.currentTime); onTimeUpdate?.(event); }}
      onEnded={(event) => { setPlaying(false); onEnded?.(event); }}
      onError={onError}
    />
    {feedback && <div key={feedback.id} className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 animate-[ping_.55s_ease-out_1] flex-col items-center gap-1.5 rounded-2xl bg-black/65 px-5 py-3 text-white shadow-2xl backdrop-blur-md">{feedback.kind === "play" ? <Play size={28} fill="currentColor" /> : feedback.kind === "pause" ? <Pause size={28} fill="currentColor" /> : feedback.kind === "forward" ? <RotateCw size={28} /> : feedback.kind === "rewind" ? <RotateCcw size={28} /> : <Volume2 size={28} />}<span className="whitespace-nowrap text-xs font-bold">{feedback.label}</span></div>}
    {type === "video" && !playing && <button type="button" onClick={togglePlayback} aria-label="تشغيل" className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-[#123C91]/90 text-white shadow-2xl backdrop-blur transition hover:scale-105 hover:bg-[#1750B4]"><Play size={27} fill="currentColor" /></button>}
    {type === "audio" && <div className="relative mb-12 text-center text-white"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Volume2 size={30} className="text-[#79A7FF]" /></span><p className="mt-3 text-sm font-bold">المحتوى الصوتي</p></div>}
    <div className={`absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-[#020713] via-[#020713]/90 to-transparent px-3 pb-3 pt-10 text-white transition-opacity sm:px-4 ${type === "video" ? "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" : "opacity-100"}`}>
      <input aria-label="موضع التشغيل" type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={seek} className="brand-media-range mb-2 h-1.5 w-full cursor-pointer accent-[#123C91]" />
      <div className="flex items-center gap-2 sm:gap-3">
        <button type="button" onClick={togglePlayback} aria-label={playing ? "إيقاف مؤقت" : "تشغيل"} className="grid h-9 w-9 place-items-center rounded-full bg-[#123C91] text-white ring-1 ring-white/20 transition hover:bg-[#3567C8]">{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
        <button type="button" onClick={() => skip(-10)} aria-label="تأخير 10 ثوانٍ" className="relative grid h-8 w-8 place-items-center rounded-lg text-white/85 hover:bg-[#123C91]/70 hover:text-white"><RotateCcw size={19} /><span className="absolute text-[8px] font-bold">10</span></button>
        <button type="button" onClick={() => skip(10)} aria-label="تقديم 10 ثوانٍ" className="relative grid h-8 w-8 place-items-center rounded-lg text-white/85 hover:bg-[#123C91]/70 hover:text-white"><RotateCw size={19} /><span className="absolute text-[8px] font-bold">10</span></button>
        <span className="min-w-24 text-xs tabular-nums text-white/75">{formatTime(currentTime)} / {formatTime(duration)}</span>
        <div className="ml-auto flex items-center gap-2">
          {sources.length > 1 && <select aria-label="جودة التشغيل" value={activeSource} onChange={changeQuality} className="rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-xs text-white outline-none"><option value={src}>تلقائي</option>{sources.map((source) => <option key={source.url} value={source.url} className="text-black">{source.label}</option>)}</select>}
          <button type="button" onClick={toggleMute} aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"} className="hidden text-white/85 hover:text-[#79A7FF] sm:block">{muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}</button>
          <input aria-label="مستوى الصوت" type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={changeVolume} className="hidden h-1 w-20 cursor-pointer accent-[#123C91] md:block" />
          {type === "video" && <button type="button" onClick={toggleFullscreen} aria-label="ملء الشاشة" className="text-white/85 hover:text-[#79A7FF]"><Maximize size={19} /></button>}
        </div>
      </div>
    </div>
  </div>;
});

export default BrandMediaPlayer;
