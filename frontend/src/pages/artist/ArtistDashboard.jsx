import React, { useEffect, useState } from "react";
import "./ArtistDashboard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ── Empty State Initialization ──

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const [musics, setMusics] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_MUSIC_URL || 'http://localhost:3001'}/api/music/artist-musics`, {
        withCredentials: true,
      })
      .then((response) => {
        // Also ensure playlists reflect the fetched musics if necessary in a real scenario
        setMusics(
          response.data.musics.map((m) => {
            return {
              id: m._id,
              title: m.title,
              artist: m.artist,
              coverImageUrl: m.coverImageUrl,
              musicUrl: m.musicUrl,
            };
          }),
        );
      })
      .catch((error) => console.error("Error fetching musics", error));

    axios
      .get(`${import.meta.env.VITE_MUSIC_URL || 'http://localhost:3001'}/api/music/playlist/artist`, {
        withCredentials: true,
      })
      .then((response) => {
        setPlaylists(response.data.playlists);
        // console.log(response.data.playlists);
      })
      .catch((error) => console.error("Error fetching playlists", error));
  }, []);

  return (
    <div className="artist-dashboard">
      {/* ── Dashboard Header ── */}
      <header className="dashboard-header">
        <div className="dashboard-header__left">
          <img
            src="https://images.unsplash.com/photo-1549834125-82d3c48159a3?q=80&w=300&auto=format&fit=crop"
            alt="Artist Profile"
            className="dashboard-header__image"
          />
          <div className="dashboard-header__info">
            <span className="dashboard-header__label">Artist</span>
            {musics.length > 0 && (
              <h1 className="dashboard-header__title">{musics[0].artist}</h1>
            )}
            <span className="dashboard-header__stats">
              100,234,567 monthly listeners
            </span>
          </div>
        </div>

        <div className="dashboard-header__actions">
          <button
            className="dashboard-header__button"
            onClick={() => navigate("/artist/dashboard/upload-music")}
          >
            Upload Music
          </button>
        </div>
      </header>

      {/* ── Popular Music Section ── */}
      <section className="dashboard-section">
        <h2 className="section-title">Musics</h2>
        <div className="music-list">
          {musics.map((track, index) => (
            <div className="music-row" key={track.id || track._id || index}>
              <div className="music-row__number">{index + 1}</div>
              <svg className="music-row__hover-icon" viewBox="0 0 24 24">
                <path d="M7 21l13-9L7 3v18z" />
              </svg>
              <div className="music-row__info">
                <img
                  src={track.coverImageUrl}
                  alt={track.title}
                  className="music-row__cover"
                />
                <div className="music-row__details">
                  <span className="music-row__title">{track.title}</span>
                  {/* Using artist instead of duration/plays to match data structure */}
                  <span className="music-row__plays">{track.artist}</span>
                </div>
              </div>
              <div className="music-row__duration">
                <a
                  href={track.musicUrl}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  ▶
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Playlists Section ── */}
      <section className="dashboard-section">
        <h2 className="section-title">Playlists</h2>
        <div className="playlists-grid">
          {playlists.map((playlist) => (
            <div className="playlist-card" key={playlist.id || playlist._id}>
              <div className="playlist-card__image-wrapper">
                {/* Fallback to first music cover if playlist doesn't have its own image */}
                <img
                  src={
                    playlist.musics?.[0]?.coverImageUrl ||
                    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=300&auto=format&fit=crop"
                  }
                  alt={playlist.title}
                  className="playlist-card__image"
                />
                <div className="playlist-card__play">
                  <svg className="playlist-card__play-icon" viewBox="0 0 24 24">
                    <path d="M7 21l13-9L7 3v18z" />
                  </svg>
                </div>
              </div>
              <div className="playlist-card__info">
                <span className="playlist-card__title">{playlist.title}</span>
                <span className="playlist-card__desc">
                  By {playlist.artist} • {playlist.musics?.length || 0} songs
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArtistDashboard;
