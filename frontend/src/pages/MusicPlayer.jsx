import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./MusicPlayer.css";

const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MusicPlayer = () => {
  const { id } = useParams();
  const audioRef = useRef(null);

  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);

  // Fetch track details
  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/music/get-details/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setTrack(res.data.music);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load music.");
        setLoading(false);
      });
  }, [id]);

  // Sync audio time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [track]);

  // Play / Pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Seek
  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
    setCurrentTime(audio.currentTime);
  };

  // Volume
  const handleVolume = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  // Speed
  const handleSpeed = (e) => {
    const val = Number(e.target.value);
    setSpeed(val);
    if (audioRef.current) audioRef.current.playbackRate = val;
  };

  // Skip forward / backward
  const skip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(
      Math.max(audio.currentTime + seconds, 0),
      duration,
    );
  };

  if (loading) {
    return (
      <div className="music-player">
        <span className="music-player__loading">Loading...</span>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="music-player">
        <span className="music-player__error">{error || "Track not found"}</span>
      </div>
    );
  }

  return (
    <div className="music-player">
      <div className="music-player__card">
        {/* Hidden audio element */}
        <audio ref={audioRef} src={track.musicUrl} preload="metadata" />

        {/* Cover Art */}
        <div className="music-player__cover-wrapper">
          <img
            src={track.coverImageUrl}
            alt={track.title}
            className="music-player__cover"
          />
        </div>

        {/* Track Info */}
        <div className="music-player__info">
          <h1 className="music-player__title">{track.title}</h1>
          <p className="music-player__artist">{track.artist}</p>
        </div>

        {/* Seek Bar */}
        <div className="music-player__seek">
          <input
            type="range"
            className="music-player__seek-bar"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
          />
          <div className="music-player__seek-times">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls: Skip Back, Play/Pause, Skip Forward */}
        <div className="music-player__controls">
          {/* Skip Back 10s */}
          <button
            className="music-player__btn music-player__btn--skip"
            onClick={() => skip(-10)}
            title="Back 10s"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12.5 3C7.81 3 4 6.81 4 11.5H1l4 4 4-4H6c0-3.59 2.91-6.5 6.5-6.5S19 7.91 19 11.5 16.09 18 12.5 18c-1.8 0-3.43-.73-4.6-1.9l-1.42 1.42A8.48 8.48 0 0 0 12.5 20c4.69 0 8.5-3.81 8.5-8.5S17.19 3 12.5 3z" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            className="music-player__btn music-player__btn--play"
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <path d="M7 21l13-9L7 3v18z" />
              </svg>
            )}
          </button>

          {/* Skip Forward 10s */}
          <button
            className="music-player__btn music-player__btn--skip"
            onClick={() => skip(10)}
            title="Forward 10s"
          >
            <svg viewBox="0 0 24 24">
              <path d="M11.5 3C6.81 3 3 6.81 3 11.5S6.81 20 11.5 20a8.48 8.48 0 0 0 6.02-2.48l-1.42-1.42A6.48 6.48 0 0 1 11.5 18c-3.59 0-6.5-2.91-6.5-6.5S7.91 5 11.5 5 18 7.91 18 11.5h-3l4 4 4-4h-3C20 6.81 16.19 3 11.5 3z" />
            </svg>
          </button>
        </div>

        {/* Volume & Speed */}
        <div className="music-player__extras">
          {/* Volume */}
          <div className="music-player__slider-group">
            <svg viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              className="music-player__slider"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolume}
            />
          </div>

          {/* Speed */}
          <div className="music-player__speed">
            <span className="music-player__speed-label">Speed</span>
            <select
              className="music-player__speed-select"
              value={speed}
              onChange={handleSpeed}
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
