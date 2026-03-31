import React, { useEffect, useState } from "react";
import "./Home.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SyncButton from "../../components/layout/SyncButton";

const Home = ({ socket }) => {
  // Determine greeting based on time of day
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [music, setMusic] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_MUSIC_URL || 'http://localhost:3001'}/api/music/`, { withCredentials: true })
      .then((res) =>
        setMusic(
          res.data.musics.map((m) => {
            return {
              id: m._id,
              title: m.title,
              artist: m.artist,
              coverImageUrl: m.coverImageUrl,
              musicUrl: m.musicUrl,
            };
          }),
        ),
      );

    axios
      .get(`${import.meta.env.VITE_MUSIC_URL || 'http://localhost:3001'}/api/music/playlist`, {
        withCredentials: true,
      })
      .then((res) => {
        setPlaylists(
          res.data.playlists.map((p) => {
            return {
              id: p._id,
              title: p.title,
              count: p.musics.length,
            };
          }),
        );
      });
  }, []);

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__greeting">{greeting}</h1>
        <SyncButton />
      </header>

      <section className="home__section">
        <div className="home__section-title">
          <span>Playlists</span>
          <a href="#" className="home__section-link">
            Show all
          </a>
        </div>
        <div className="home__grid">
          {playlists.map((playlist) => (
            <div className="home-card" key={playlist.id}>
              {/* <div className="home-card__image-wrapper">
                <img
                  src={playlist.coverImageUrl}
                  alt={playlist.title}
                  className="home-card__image"
                />
                <div className="home-card__play">
                  <svg className="home-card__play-icon" viewBox="0 0 24 24">
                    <path d="M7 21l13-9L7 3v18z" />
                  </svg>
                </div>
              </div> */}
              <div className="home-card__info">
                <h3 className="home-card__title">{playlist.title}</h3>
                <p className="home-card__desc">{playlist.count} musics</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home__section">
        <div className="home__section-title">
          <span>Musics</span>
          <a href="#" className="home__section-link">
            Show all
          </a>
        </div>
        <div className="home__grid">
          {music.map((music) => (
            <div
              className="home-card"
              key={`recent-${music.id}`}
              onClick={() => {
                socket?.emit("play", { musicId: music.id });
                navigate(`/music/${music.id}`);
              }}
            >
              <div className="home-card__image-wrapper">
                <img
                  src={music.coverImageUrl}
                  alt={music.title}
                  className="home-card__image"
                />
                <div className="home-card__play">
                  <svg className="home-card__play-icon" viewBox="0 0 24 24">
                    <path d="M7 21l13-9L7 3v18z" />
                  </svg>
                </div>
              </div>
              <div className="home-card__info">
                <h3 className="home-card__title">{music.title}</h3>
                <p className="home-card__desc">{music.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
