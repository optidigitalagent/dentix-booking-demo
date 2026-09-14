import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { siteHref } from "@/lib/site-href";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wantsPlayback = useRef(true);
  const manuallyPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    wantsPlayback.current = !reducedMotion.matches && !manuallyPaused.current;
    let inView = typeof IntersectionObserver === "undefined";

    const syncPlayback = () => {
      if (inView && !document.hidden && wantsPlayback.current) {
        // A blocked autoplay leaves the poster and manual play button available.
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };
    const onMotionChange = () => {
      wantsPlayback.current = !reducedMotion.matches && !manuallyPaused.current;
      syncPlayback();
    };
    const observer = typeof IntersectionObserver === "undefined" ? null :
      new IntersectionObserver(([entry]) => {
        inView = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.25);
        syncPlayback();
      }, { threshold: [0, 0.25] });

    observer?.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", onMotionChange);
    syncPlayback();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", onMotionChange);
      video.pause();
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    wantsPlayback.current = video.paused;
    manuallyPaused.current = !video.paused;
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  };

  return (
    <>
      <div className="hero-bg">
        <video
          ref={videoRef}
          id="hero-clinic-video"
          className="hero-video"
          src={siteHref("/media/dentix-clinic-tour.mp4")}
          poster={siteHref("/media/dentix-clinic-tour-poster.webp")}
          aria-label="Відеоогляд клініки DENTIX"
          width={1280}
          height={720}
          playsInline
          muted
          loop
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onVolumeChange={() => setMuted(videoRef.current?.muted ?? true)}
        />
        <div className="hero-overlay" />
      </div>
      <div className="hero-video-controls" role="group" aria-label="Керування відео">
        <button
          type="button"
          aria-controls="hero-clinic-video"
          aria-label={playing ? "Призупинити відео" : "Відтворити відео"}
          onClick={togglePlayback}
        >
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>
        <button
          type="button"
          aria-controls="hero-clinic-video"
          aria-label={muted ? "Увімкнути звук відео" : "Вимкнути звук відео"}
          onClick={() => {
            const video = videoRef.current;
            if (video) video.muted = !video.muted;
          }}
        >
          {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        </button>
      </div>
    </>
  );
}
