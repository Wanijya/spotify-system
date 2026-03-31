import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Playlists.css";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/music/playlist", {
          withCredentials: true,
        });
        setPlaylists(response.data.playlists || []);
      } catch (err) {
        console.error("Error fetching playlists", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylists();
  }, []);

  return (
    <div className="playlists-container">
      <h2>Your Playlists</h2>
      
      {loading ? (
        <div className="loading-spinner">Loading your collection...</div>
      ) : playlists.length > 0 ? (
        <div className="playlists-grid">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="playlist-card">
              <div className="playlist-cover">
                <div className="playlist-icon">🎵</div>
              </div>
              <div className="playlist-info">
                <h3>{playlist.title}</h3>
                <p>{playlist.musics?.length || 0} songs</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🎧</div>
          <h3>Nothing to hear here</h3>
          <p>You haven't created any playlists yet.</p>
        </div>
      )}
    </div>
  );
};

export default Playlists;
