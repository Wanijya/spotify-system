import React, { useState, useRef } from "react";
import axios from "axios";
import "./UploadMusic.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UploadMusic = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [musicFile, setMusicFile] = useState(null);
  const [musicPreview, setMusicPreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const musicInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleMusicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMusicFile(file);
      setMusicPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !musicFile || !coverImage) {
      toast.error("Please fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("music", musicFile);
    formData.append("coverImage", coverImage);

    setUploading(true);
    setStatus({ type: "", message: "" });

    try {
      await axios.post(`${import.meta.env.VITE_MUSIC_URL || 'http://localhost:3001'}/api/music/upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus({ type: "success", message: "Music uploaded successfully!" });
      toast.success("Music uploaded successfully!");
      // Reset form
      setTitle("");
      setMusicFile(null);
      setMusicPreview(null);
      setCoverImage(null);
      setCoverPreview(null);
      if (musicInputRef.current) musicInputRef.current.value = "";
      if (coverInputRef.current) coverInputRef.current.value = "";
      navigate("/artist/dashboard");
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Upload failed. Try again.",
      });
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-music">
      <div className="upload-music__card">
        <div className="upload-music__header">
          <h1 className="upload-music__title">Upload Music</h1>
          <p className="upload-music__subtitle">
            Share your music with the world
          </p>
        </div>

        <form className="upload-music__form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="upload-music__field">
            <label className="upload-music__label" htmlFor="upload-title">
              Song Title
            </label>
            <input
              id="upload-title"
              type="text"
              className="upload-music__input"
              placeholder="Enter song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Music File */}
          <div className="upload-music__field">
            <label className="upload-music__label">Music File</label>
            <div
              className={`upload-music__dropzone ${musicFile ? "has-file" : ""}`}
              onClick={() => musicInputRef.current?.click()}
            >
              <svg className="upload-music__dropzone-icon" viewBox="0 0 24 24">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
              </svg>
              {musicFile ? (
                <span className="upload-music__dropzone-filename">
                  {musicFile.name}
                </span>
              ) : (
                <span className="upload-music__dropzone-text">
                  Click to upload or drag & drop
                  <br />
                  <span className="upload-music__dropzone-text--highlight">
                    MP3, WAV, FLAC
                  </span>
                </span>
              )}
              <input
                ref={musicInputRef}
                type="file"
                accept="audio/*"
                className="upload-music__file-input"
                onChange={handleMusicChange}
              />
            </div>
            {musicPreview && (
              <audio
                controls
                src={musicPreview}
                className="upload-music__audio-preview"
                style={{ width: "100%", marginTop: "var(--space-sm)", borderRadius: "var(--radius-md)" }}
              />
            )}
          </div>

          {/* Cover Image */}
          <div className="upload-music__field">
            <label className="upload-music__label">Cover Image</label>
            <div
              className={`upload-music__dropzone ${coverImage ? "has-file" : ""}`}
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="upload-music__preview"
                />
              ) : (
                <svg
                  className="upload-music__dropzone-icon"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              )}
              {coverImage ? (
                <span className="upload-music__dropzone-filename">
                  {coverImage.name}
                </span>
              ) : (
                <span className="upload-music__dropzone-text">
                  Click to upload cover art
                  <br />
                  <span className="upload-music__dropzone-text--highlight">
                    JPG, PNG, WEBP
                  </span>
                </span>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="upload-music__file-input"
                onChange={handleCoverChange}
              />
            </div>
          </div>

          {/* Status */}
          {status.message && (
            <div
              className={`upload-music__status upload-music__status--${status.type}`}
            >
              {status.message}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="upload-music__submit"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Track"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadMusic;
