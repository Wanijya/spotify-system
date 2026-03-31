import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Settings.css";
import { useSync } from "../../context/SyncContext";

const Settings = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const { user, logout } = useSync();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/auth/me", {
          withCredentials: true,
        });
        setUserProfile(response.data.user);
        // console.log(response.data.user);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      <div className="profile-section">
        {userProfile ? (
          <div className="profile-card">
            <div className="profile-avatar">
              {userProfile.fullName?.firstName?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="profile-details">
              <h3>
                {userProfile.fullName?.firstName} {userProfile.fullName?.lastName}
              </h3>
              <p className="profile-email">{userProfile.email || "Email not available"}</p>
              <div className="profile-badge">{userProfile.role || "User"}</div>
            </div>
          </div>
        ) : (
          <div className="guest-card">
            <div className="profile-avatar guest-avatar">?</div>
            <div className="profile-details">
              <h3>Guest User</h3>
              <p>Please log in to see your profile.</p>
            </div>
          </div>
        )}
      </div>

      <div className="settings-options">
        <div className="option-group">
          <h4>Account Actions</h4>
          {userProfile ? (
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="btn-login" onClick={handleLogin}>
              Log In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
