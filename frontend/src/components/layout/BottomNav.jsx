import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSync } from "../../context/SyncContext";
import "./BottomNav.css";

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useSync();

  // Don't show bottom nav on auth screens
  if (currentPath === "/login" || currentPath === "/register") {
    return null;
  }

  const isActive = (path) =>
    currentPath === path || currentPath.startsWith(path + "/");

  return (
    <div className="bottom-nav">
      <Link
        to="/"
        className={`nav-item ${isActive("/") && currentPath === "/" ? "active" : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/Dom/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isActive("/") && currentPath === "/" ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Home</span>
      </Link>

      <Link
        to="/playlists"
        className={`nav-item ${isActive("/playlists") ? "active" : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={isActive("/playlists") ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
          <path d="M6 8h12"></path>
          <path d="M6 12h12"></path>
          <path d="M6 16h6"></path>
        </svg>
        <span>Playlist</span>
      </Link>

      {user?.role === "artist" && (
        <Link
          to="/artist/dashboard"
          className={`nav-item ${isActive("/artist/dashboard") ? "active" : ""}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={isActive("/artist/dashboard") ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="9"></rect>
            <rect x="14" y="3" width="7" height="5"></rect>
            <rect x="14" y="12" width="7" height="9"></rect>
            <rect x="3" y="16" width="7" height="5"></rect>
          </svg>
          <span>Artist</span>
        </Link>
      )}

      <Link
        to="/settings"
        className={`nav-item ${isActive("/settings") ? "active" : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span>Settings</span>
      </Link>
    </div>
  );
};

export default BottomNav;
