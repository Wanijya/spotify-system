import express from "express";
import rateLimit from "express-rate-limit";
import multer from "multer";
import * as musicController from "../controllers/music.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";
import { rateLimitConfig, createLimiter } from "../config/rateLimit.config.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "music") {
      const allowed = ["audio/mpeg", "audio/wav", "audio/flac", "audio/mp4"];
      if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only audio files allowed"), false);
      }
    }
    if (file.fieldname === "coverImage") {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only image files allowed"), false);
      }
    }
    cb(null, true);
  },
});

const router = express.Router();

// Route-specific rate limiters
const uploadLimiter = rateLimit(createLimiter(rateLimitConfig.upload));
const getMusicLimiter = rateLimit(createLimiter(rateLimitConfig.getMusic));
const artistMusicLimiter = rateLimit(createLimiter(rateLimitConfig.artistMusic));
const playlistLimiter = rateLimit(createLimiter(rateLimitConfig.playlist));
const getPlaylistLimiter = rateLimit(createLimiter(rateLimitConfig.getPlaylist));
const presignedUrlLimiter = rateLimit(createLimiter(rateLimitConfig.presignedUrl));

/* Upload music (POST /api/music/upload) */
router.post(
  "/upload",
  uploadLimiter,
  authMiddleware.authArtistMiddleware,
  upload.fields([
    { name: "music", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  musicController.uploadMusic,
);

/* Get all music (GET /api/music/) */
router.get("/", getMusicLimiter, authMiddleware.authUserMiddleware, musicController.getAllMusic);

/* Get music details (GET /api/music/get-details/:id) */
router.get(
  "/get-details/:id",
  getMusicLimiter,
  authMiddleware.authUserMiddleware,
  musicController.getMusicById,
);

/* Get artist music (GET /api/music/artist-musics) */
router.get(
  "/artist-musics",
  artistMusicLimiter,
  authMiddleware.authArtistMiddleware,
  musicController.getArtistMusic,
);

/* Create playlist (POST /api/music/playlist) */
router.post(
  "/playlist",
  playlistLimiter,
  authMiddleware.authArtistMiddleware,
  musicController.createPlaylist,
);

/* Get artist playlist (GET /api/music/playlist/artist) */
router.get(
  "/playlist/artist",
  playlistLimiter,
  authMiddleware.authArtistMiddleware,
  musicController.getArtistPlaylist,
);

/* Get playlist (GET /api/music/playlist) */
router.get(
  "/playlist",
  getPlaylistLimiter,
  authMiddleware.authUserMiddleware,
  musicController.getPlaylist,
);

/* Get specific playlist song (GET /api/music/playlist/:id) */
router.get(
  "/playlist/:id",
  getPlaylistLimiter,
  authMiddleware.authUserMiddleware,
  musicController.getPlaylistById,
);

export default router;
