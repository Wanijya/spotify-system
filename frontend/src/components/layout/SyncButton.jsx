import "./SyncButton.css";
import { useSync } from "../../context/SyncContext";
import { useNavigate } from "react-router-dom";

const SyncButton = () => {
  const { syncEnabled, toggleSync, user } = useSync();
  const navigate = useNavigate();

  const handleClick = () => {
    const result = toggleSync();

    if (result?.needsLogin) {
      navigate("/login");
    }
  };

  return (
    <button
      className={`sync-btn ${syncEnabled ? "sync-btn--active" : ""}`}
      onClick={handleClick}
      title={
        !user
          ? "Login to sync devices"
          : syncEnabled
            ? "Sync is ON — click to turn off"
            : "Sync devices"
      }
    >
      <svg viewBox="0 0 24 24" width="18" height="18">
        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
      </svg>

      {/* Green dot — sync on hone pe dikhega */}
      <span className={`sync-dot ${syncEnabled ? "sync-dot--on" : ""}`} />
    </button>
  );
};

export default SyncButton;
